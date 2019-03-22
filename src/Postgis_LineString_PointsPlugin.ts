import { Plugin } from "graphile-build";
import { GIS_SUBTYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISType, pgGISType, pgGISTypeDetails },
    } = context;
    if (
      !isPgGISType ||
      !pgGISTypeDetails ||
      pgGISTypeDetails.subtype !== GIS_SUBTYPE.LineString
    ) {
      return fields;
    }
    const {
      extend,
      getPostgisTypeByGeometryType,
      graphql: { GraphQLList },
    } = build;
    const Point = getPostgisTypeByGeometryType(pgGISType, GIS_SUBTYPE.Point);

    return extend(fields, {
      points: {
        type: new GraphQLList(Point),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => {
            return {
              __gisType: GIS_SUBTYPE.Point,
              __geojson: {
                type: "Point",
                coordinates: coord,
              },
            };
          });
        },
      },
    });
  });
};
export default plugin;
