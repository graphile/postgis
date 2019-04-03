import { Plugin } from "graphile-build";
import debug from "./debug";
import { PgType } from "graphile-build-pg";
import { GraphQLResolveInfo, GraphQLType, GraphQLNamedType } from "graphql";
import { Subtype } from "./interfaces";
import { getGISTypeDetails, getGISTypeModifier, getGISTypeName } from "./utils";
import { SQL } from "pg-sql2";
import makeGeoJSONType from "./makeGeoJSONType";

function identity<T>(input: T): T {
  return input;
}

const plugin: Plugin = builder => {
  builder.hook("build", build => {
    const GeoJSON = makeGeoJSONType(
      build.graphql,
      build.inflection.builtin("GeoJSON")
    );
    build.addType(GeoJSON);

    return build.extend(build, {
      getPostgisTypeByGeometryType(
        pgGISType: PgType,
        subtype: Subtype,
        hasZ: boolean = false,
        hasM: boolean = false,
        srid: number = 0
      ) {
        const typeModifier = getGISTypeModifier(subtype, hasZ, hasM, srid);
        return this.pgGetGqlTypeByTypeIdAndModifier(pgGISType.id, typeModifier);
      },
      pgGISIncludedTypes: [],
      pgGISIncludeType(Type: GraphQLNamedType) {
        this.pgGISIncludedTypes.push(Type);
      },
    });
  });

  builder.hook(
    "init",
    (_, build) => {
      const {
        newWithHooks,
        pgIntrospectionResultsByKind: introspectionResultsByKind,
        graphql: { GraphQLInt, GraphQLInterfaceType, GraphQLObjectType },
        pgRegisterGqlTypeByTypeId,
        pgRegisterGqlInputTypeByTypeId,
        pgTweaksByTypeIdAndModifer,
        getTypeByName,
        pgSql: sql,
        pg2gql,
        pg2GqlMapper,
        inflection,
        pgGISGraphQLTypesByTypeAndSubtype: constructedTypes,
        pgGISGraphQLInterfaceTypesByType: _interfaces,
        pgGISGeometryType: GEOMETRY_TYPE,
        pgGISGeographyType: GEOGRAPHY_TYPE,
        pgGISExtension: POSTGIS,
        pgGISIncludeType: includeType,
      } = build;
      if (!GEOMETRY_TYPE || !GEOGRAPHY_TYPE) {
        return _;
      }
      debug("PostGIS plugin enabled");

      const GeoJSON = getTypeByName(inflection.builtin("GeoJSON"));
      const geojsonFieldName = inflection.geojsonFieldName();

      function getGisInterface(type: PgType) {
        const zmflag = -1; // no dimensional constraint; could be xy/xyz/xym/xyzm
        if (!_interfaces[type.id]) {
          _interfaces[type.id] = {};
        }
        if (!_interfaces[type.id][zmflag]) {
          _interfaces[type.id][zmflag] = newWithHooks(
            GraphQLInterfaceType,
            {
              name: inflection.gisInterfaceName(type),
              fields: {
                [geojsonFieldName]: {
                  type: GeoJSON,
                  description: "Converts the object to GeoJSON",
                },
                srid: {
                  type: GraphQLInt,
                  description: "Spatial reference identifier (SRID)",
                },
              },
              resolveType(value: any, _info?: GraphQLResolveInfo) {
                const Type =
                  constructedTypes[type.id] &&
                  constructedTypes[type.id][value.__gisType];
                return Type;
              },
              description: `All ${type.name} types implement this interface`,
            },
            {
              isPgGISInterface: true,
              pgGisType: type,
              pgGisZMFlag: zmflag,
            }
          );
          // Force creation of all GraphQL types that could be resolved from this interface
          const subtypes: Array<Subtype> = [1, 2, 3, 4, 5, 6, 7];
          for (const subtype of subtypes) {
            for (const hasZ of [false, true]) {
              for (const hasM of [false, true]) {
                const typeModifier = getGISTypeModifier(subtype, hasZ, hasM, 0);
                const Type = getGisType(type, typeModifier);
                includeType(Type);
              }
            }
          }
        }
        return _interfaces[type.id][zmflag];
      }
      function getGisDimensionInterface(
        type: PgType,
        hasZ: boolean,
        hasM: boolean
      ) {
        const zmflag = (hasZ ? 2 : 0) + (hasM ? 1 : 0); // Equivalent to ST_Zmflag: https://postgis.net/docs/ST_Zmflag.html
        const coords = { 0: "XY", 1: "XYM", 2: "XYZ", 3: "XYZM" }[zmflag];
        if (!_interfaces[type.id]) {
          _interfaces[type.id] = {};
        }
        if (!_interfaces[type.id][zmflag]) {
          _interfaces[type.id][zmflag] = newWithHooks(
            GraphQLInterfaceType,
            {
              name: inflection.gisDimensionInterfaceName(type, hasZ, hasM),
              fields: {
                [geojsonFieldName]: {
                  type: GeoJSON,
                  description: "Converts the object to GeoJSON",
                },
                srid: {
                  type: GraphQLInt,
                  description: "Spatial reference identifier (SRID)",
                },
              },
              resolveType(value: any, _info?: GraphQLResolveInfo) {
                const Type =
                  constructedTypes[type.id] &&
                  constructedTypes[type.id][value.__gisType];
                return Type;
              },
              description: `All ${
                type.name
              } ${coords} types implement this interface`,
            },
            {
              isPgGISDimensionInterface: true,
              pgGisType: type,
              pgGisZMFlag: zmflag,
            }
          );
          // Force creation of all GraphQL types that could be resolved from this interface
          const subtypes: Array<Subtype> = [1, 2, 3, 4, 5, 6, 7];
          for (const subtype of subtypes) {
            const typeModifier = getGISTypeModifier(subtype, hasZ, hasM, 0);
            const Type = getGisType(type, typeModifier);
            includeType(Type);
          }
        }
        return _interfaces[type.id][zmflag];
      }
      function getGisType(type: PgType, typeModifier: number) {
        const typeId = type.id;
        const typeDetails = getGISTypeDetails(typeModifier);
        const { subtype, hasZ, hasM, srid } = typeDetails;
        debug(
          `Getting ${type.name} type ${
            type.id
          }|${typeModifier}|${subtype}|${hasZ}|${hasM}|${srid}`
        );
        if (!constructedTypes[type.id]) {
          constructedTypes[type.id] = {};
        }
        const typeModifierKey = typeModifier != null ? typeModifier : -1;
        if (!pgTweaksByTypeIdAndModifer[typeId]) {
          pgTweaksByTypeIdAndModifer[typeId] = {};
        }
        if (!pgTweaksByTypeIdAndModifer[typeId][typeModifierKey]) {
          pgTweaksByTypeIdAndModifer[typeId][typeModifierKey] = (
            fragment: SQL,
            _resolveData: any
          ) => {
            const params = [
              sql.literal("__gisType"),
              sql.fragment`${sql.identifier(
                POSTGIS.namespaceName || "public",
                "postgis_type_name" // MUST be lowercase!
              )}(
                ${sql.identifier(
                  POSTGIS.namespaceName || "public",
                  "geometrytype" // MUST be lowercase!
                )}(${fragment}),
                ${sql.identifier(
                  POSTGIS.namespaceName || "public",
                  "st_coorddim" // MUST be lowercase!
                )}(${fragment}::text)
              )`,
              sql.literal("__srid"),
              sql.fragment`${sql.identifier(
                POSTGIS.namespaceName || "public",
                "st_srid" // MUST be lowercase!
              )}(${fragment})`,
              sql.literal("__geojson"),
              sql.fragment`${sql.identifier(
                POSTGIS.namespaceName || "public",
                "st_asgeojson" // MUST be lowercase!
              )}(${fragment})::JSON`,
            ];
            return sql.fragment`(case when ${fragment} is null then null else json_build_object(
            ${sql.join(params, ", ")}
          ) end)`;
          };
        }
        const gisTypeKey =
          typeModifier != null ? getGISTypeName(subtype, hasZ, hasM) : -1;
        if (!constructedTypes[type.id][gisTypeKey]) {
          if (typeModifierKey === -1) {
            constructedTypes[type.id][gisTypeKey] = getGisInterface(type);
          } else if (subtype === 0) {
            constructedTypes[type.id][gisTypeKey] = getGisDimensionInterface(
              type,
              hasZ,
              hasM
            );
          } else {
            const intType = introspectionResultsByKind.type.find(
              (t: PgType) =>
                t.name === "int4" && t.namespaceName === "pg_catalog"
            );
            const jsonType = introspectionResultsByKind.type.find(
              (t: PgType) =>
                t.name === "json" && t.namespaceName === "pg_catalog"
            );

            constructedTypes[type.id][gisTypeKey] = newWithHooks(
              GraphQLObjectType,
              {
                name: inflection.gisType(type, subtype, hasZ, hasM, srid),
                interfaces: () => [
                  getGisInterface(type),
                  getGisDimensionInterface(type, hasZ, hasM),
                ],
                fields: {
                  [geojsonFieldName]: {
                    type: GeoJSON,
                    resolve: (
                      data: any,
                      _args: any,
                      _context: any,
                      _resolveInfo: GraphQLResolveInfo
                    ) => {
                      return pg2gql(data.__geojson, jsonType);
                    },
                  },
                  srid: {
                    type: GraphQLInt,
                    resolve: (
                      data: any,
                      _args: any,
                      _context: any,
                      _resolveInfo: GraphQLResolveInfo
                    ) => {
                      return pg2gql(data.__srid, intType);
                    },
                  },
                },
              },
              {
                isPgGISType: true,
                pgGISType: type,
                pgGISTypeDetails: typeDetails,
              }
            );
          }
        }
        return constructedTypes[type.id][gisTypeKey];
      }

      debug(`Registering handler for ${GEOGRAPHY_TYPE.id}`);

      pgRegisterGqlInputTypeByTypeId(GEOGRAPHY_TYPE.id, () => GeoJSON);
      pg2GqlMapper[GEOGRAPHY_TYPE.id] = {
        map: identity,
        unmap: (o: any) =>
          sql.fragment`st_geomfromgeojson(${sql.value(
            JSON.stringify(o)
          )}::text)::${sql.identifier(
            POSTGIS.namespaceName || "public",
            "geography"
          )}`,
      };

      pgRegisterGqlTypeByTypeId(
        GEOGRAPHY_TYPE.id,
        (_set: (type: GraphQLType) => void, typeModifier: number) => {
          return getGisType(GEOGRAPHY_TYPE, typeModifier);
        }
      );

      debug(`Registering handler for ${GEOMETRY_TYPE.id}`);

      pgRegisterGqlInputTypeByTypeId(GEOMETRY_TYPE.id, () => GeoJSON);
      pg2GqlMapper[GEOMETRY_TYPE.id] = {
        map: identity,
        unmap: (o: any) =>
          sql.fragment`st_geomfromgeojson(${sql.value(
            JSON.stringify(o)
          )}::text)`,
      };

      pgRegisterGqlTypeByTypeId(
        GEOMETRY_TYPE.id,
        (_set: (type: GraphQLType) => void, typeModifier: number) => {
          return getGisType(GEOMETRY_TYPE, typeModifier);
        }
      );
      return _;
    },
    ["PostgisTypes"],
    ["PgTables"],
    ["PgTypes"]
  );

  builder.hook("GraphQLSchema", (schema, build) => {
    if (!schema.types) {
      schema.types = [];
    }
    schema.types = [...schema.types, ...build.pgGISIncludedTypes];
    return schema;
  });
};

export default plugin;
