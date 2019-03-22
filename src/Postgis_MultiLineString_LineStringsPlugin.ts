import { Plugin } from "graphile-build";
import { GIS_SUBTYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISGeographyType, pgGISType, pgGISTypeDetails },
    } = context;
    if (
      !isPgGISGeographyType ||
      !pgGISTypeDetails ||
      pgGISTypeDetails.subtype !== GIS_SUBTYPE.MultiLineString
    ) {
      return fields;
    }
    const {
      extend,
      getPostgisTypeByGeometryType,
      graphql: { GraphQLList },
    } = build;
    const LineString = getPostgisTypeByGeometryType(
      pgGISType,
      GIS_SUBTYPE.LineString
    );

    return extend(fields, {
      lines: {
        type: new GraphQLList(LineString),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => ({
            __gisType: GIS_SUBTYPE.LineString,
            __geojson: {
              type: "LineString",
              coordinates: coord,
            },
          }));
        },
      },
    });
  });
};
export default plugin;
