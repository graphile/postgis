import { Plugin } from "graphile-build";
import debug from "./debug";
import { GIS_SUBTYPE } from "./constants";
import { getGISTypeName } from "./utils";

const plugin: Plugin = builder => {
  builder.hook(
    "GraphQLObjectType:fields",
    function AddGeometriesToGeometryCollection(fields, build, context) {
      const {
        scope: { isPgGISType, pgGISType, pgGISTypeDetails },
      } = context;
      if (
        !isPgGISType ||
        !pgGISTypeDetails ||
        pgGISTypeDetails.subtype !== GIS_SUBTYPE.GeometryCollection
      ) {
        return fields;
      }
      const {
        extend,
        pgGISGraphQLInterfaceTypesByType,
        graphql: { GraphQLList },
      } = build;
      const { hasZ, hasM } = pgGISTypeDetails;
      const zmflag = (hasZ ? 2 : 0) + (hasM ? 1 : 0); // Equivalent to ST_Zmflag: https://postgis.net/docs/ST_Zmflag.html
      const Interface = pgGISGraphQLInterfaceTypesByType[pgGISType.id][zmflag];
      if (!Interface) {
        debug("Unexpectedly couldn't find the interface");
        return fields;
      }

      return extend(fields, {
        geometries: {
          type: new GraphQLList(Interface),
          resolve(data: any) {
            return data.__geojson.geometries.map((geom: any) => {
              return {
                __gisType: getGISTypeName(GIS_SUBTYPE[geom.type], hasZ, hasM),
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
