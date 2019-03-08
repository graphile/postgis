import { Plugin } from "graphile-build";
import debug from "./debug";
import { PgType } from "graphile-build-pg";
import { GraphQLResolveInfo, GraphQLType } from "graphql";
import { SUBTYPE_BY_PG_GEOMETRY_TYPE } from "./constants";
import { getSubtypeAndSridFromModifier } from "./utils";
import { SQL } from "pg-sql2";

const PostgisRegisterTypesPlugin: Plugin = builder => {
  builder.hook(
    "init",
    (_, build) => {
      const {
        newWithHooks,
        pgIntrospectionResultsByKind: introspectionResultsByKind,
        graphql: { GraphQLObjectType, GraphQLInterfaceType },
        pgRegisterGqlTypeByTypeId,
        pgTweaksByTypeIdAndModifer,
        getTypeByName,
        pgSql: sql,
        pg2gql,
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

      const GraphQLJSON = getTypeByName("JSON");
      const geojsonFieldName = inflection.geojsonFieldName();

      function getGisInterface(type: PgType) {
        if (!_interfaces[type.id]) {
          _interfaces[type.id] = newWithHooks(
            GraphQLInterfaceType,
            {
              name: inflection.gisInterfaceName(type),
              fields: {
                [geojsonFieldName]: {
                  type: GraphQLJSON,
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
        if (!constructedTypes[type.id][subtype]) {
          if (!pgTweaksByTypeIdAndModifer[typeId]) {
            pgTweaksByTypeIdAndModifer[typeId] = {};
          }
          const typeModifierKey = typeModifier != null ? typeModifier : -1;
          pgTweaksByTypeIdAndModifer[typeId][typeModifierKey] = (
            fragment: SQL,
            _resolveData: any
          ) => {
            const params = [
              sql.literal("__gisType"),
              sql.fragment`${sql.identifier(
                POSTGIS.namespace.name,
                "geometrytype" // MUST be lowercase!
              )}(${fragment})`,
              sql.literal("__geojson"),
              sql.fragment`${sql.identifier(
                POSTGIS.namespace.name,
                "st_asgeojson" // MUST be lowercase!
              )}(${fragment})::JSON`,
            ];
            return sql.fragment`json_build_object(
            ${sql.join(params, ", ")}
          )`;
          };
          const jsonType = introspectionResultsByKind.type.find(
            (t: PgType) => t.name === "json" && t.namespaceName === "pg_catalog"
          );
          console.log(type.id, subtype);
          if (subtype === 0) {
            constructedTypes[type.id][subtype] = getGisInterface(type);
          } else {
            constructedTypes[type.id][subtype] = newWithHooks(
              GraphQLObjectType,
              {
                name: inflection.gisType(type, subtype),
                interfaces: [getGisInterface(type)],
                fields: {
                  [geojsonFieldName]: {
                    type: GraphQLJSON,
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
      pgRegisterGqlTypeByTypeId(
        GEOGRAPHY_TYPE.id,
        (_set: (type: GraphQLType) => void, typeModifier: number) => {
          return getGisType(GEOGRAPHY_TYPE, typeModifier);
        }
      );
      debug(`Registering handler for ${GEOMETRY_TYPE.id}`);
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

export default PostgisRegisterTypesPlugin;
