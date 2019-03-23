import { Plugin } from "graphile-build";
import debug from "./debug";
import { GIS_SUBTYPE } from "./constants";
import { getGISTypeModifier } from "./utils";

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
      const { hasZ, hasM, srid } = pgGISTypeDetails;
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
              return {
                __gisType: getGISTypeModifier(
                  GIS_SUBTYPE[geom.type],
                  hasZ,
                  hasM,
                  srid
                ),
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
