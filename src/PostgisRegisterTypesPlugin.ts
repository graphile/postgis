import { Plugin } from "graphile-build";
import debug from "./debug";
import { PgType } from "graphile-build-pg";
import { GraphQLResolveInfo, GraphQLType } from "graphql";
import { SUBTYPE_BY_PG_GEOMETRY_TYPE } from "./constants";
import { getSubtypeAndSridFromModifier } from "./utils";
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
        geometryType: number,
        isXym: boolean = false
      ) {
        const typeModifier =
          (4326 << 8) + (geometryType << 2) + (isXym ? 1 : 0);
        return this.pgGetGqlTypeByTypeIdAndModifier(
          this.pgGISGeographyType.id,
          typeModifier
        );
      },
    });
  });

  builder.hook(
    "init",
    (_, build) => {
      const {
        newWithHooks,
        pgIntrospectionResultsByKind: introspectionResultsByKind,
        graphql: { GraphQLObjectType, GraphQLInterfaceType },
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
      } = build;
      if (!GEOMETRY_TYPE || !GEOGRAPHY_TYPE) {
        return _;
      }
      debug("PostGIS plugin enabled");

      const GeoJSON = getTypeByName(inflection.builtin("GeoJSON"));
      const geojsonFieldName = inflection.geojsonFieldName();

      function getGisInterface(type: PgType) {
        if (!_interfaces[type.id]) {
          _interfaces[type.id] = newWithHooks(
            GraphQLInterfaceType,
            {
              name: inflection.gisInterfaceName(type),
              fields: {
                [geojsonFieldName]: {
                  type: GeoJSON,
                  description: "Converts the object to GeoJSON",
                },
              },
              resolveType(value: any, _info?: GraphQLResolveInfo) {
                const subtype = SUBTYPE_BY_PG_GEOMETRY_TYPE[value.__gisType];
                const Type =
                  constructedTypes[type.id] &&
                  constructedTypes[type.id][subtype];
                return Type;
              },
              description:
                "All PostGIS geography types implement this interface",
            },
            {
              isPgGISGeographyInterface: true,
            }
          );
        }
        return _interfaces[type.id];
      }
      function getGisType(type: PgType, typeModifier: number) {
        const typeId = type.id;
        const { subtype, subtypeString } = getSubtypeAndSridFromModifier(
          true,
          typeModifier
        );
        debug(`Getting type ${typeModifier} / ${subtype} / ${subtypeString}`);
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
                "geometrytype" // MUST be lowercase!
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
        if (!constructedTypes[type.id][subtype]) {
          if (subtype === 0) {
            constructedTypes[type.id][subtype] = getGisInterface(type);
          } else {
            const jsonType = introspectionResultsByKind.type.find(
              (t: PgType) =>
                t.name === "json" && t.namespaceName === "pg_catalog"
            );

            constructedTypes[type.id][subtype] = newWithHooks(
              GraphQLObjectType,
              {
                name: inflection.gisType(type, subtype),
                interfaces: [getGisInterface(type)],
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
                },
              },
              {
                isPgGISGeographyType: true,
                pgGISType: type,
                pgGISSubtype: subtype,
              }
            );
          }
        }
        return constructedTypes[type.id][subtype] || getGisInterface(type);
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
};

export default plugin;
