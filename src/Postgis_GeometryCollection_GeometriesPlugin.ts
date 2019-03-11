import { Plugin } from "graphile-build";
import debug from "./debug";
import {
  SUBTYPE_BY_GEOJSON_TYPE,
  SUBTYPE_BY_PG_GEOMETRY_TYPE,
} from "./constants";

const plugin: Plugin = builder => {
  builder.hook(
    "GraphQLObjectType:fields",
    function AddGeometriesToGeometryCollection(fields, build, context) {
      const {
        scope: { isPgGISGeographyType, pgGISType, pgGISSubtype },
      } = context;
      if (!isPgGISGeographyType || pgGISSubtype !== 7) {
        return fields;
      }
      const {
        extend,
        pgGISGraphQLInterfaceTypesByType,
        graphql: { GraphQLList },
      } = build;
      const Interface = pgGISGraphQLInterfaceTypesByType[pgGISType.id];
      if (!Interface) {
        debug("Unexpectedly couldn't find the interface");
        return fields;
      }

      return extend(fields, {
        geometries: {
          type: new GraphQLList(Interface),
          resolve(data: any) {
            return data.__geojson.geometries.map((geom: any) => {
              const subtype = SUBTYPE_BY_GEOJSON_TYPE[geom.type];
              const pgGeometryType = Object.keys(
                SUBTYPE_BY_PG_GEOMETRY_TYPE
              ).find(k => SUBTYPE_BY_PG_GEOMETRY_TYPE[k] === subtype);
              return {
                __gisType: pgGeometryType,
                __geojson: geom,
              };
            });
          },
        },
      });
    }
  );
};
export default plugin;
