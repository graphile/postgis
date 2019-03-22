import { Plugin } from "graphile-build";
import { GIS_SUBTYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISGeographyType, pgGISType, pgGISSubtype },
    } = context;
    if (!isPgGISGeographyType || pgGISSubtype !== GIS_SUBTYPE.MultiPoint) {
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
          return data.__geojson.coordinates.map((coord: any) => ({
            __gisType: GIS_SUBTYPE.Point,
            __geojson: {
              type: "Point",
              coordinates: coord,
            },
          }));
        },
      },
    });
  });
};
export default plugin;
