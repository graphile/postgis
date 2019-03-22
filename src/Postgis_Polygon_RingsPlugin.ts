import { Plugin } from "graphile-build";
import { GIS_SUBTYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISGeographyType, pgGISType, pgGISSubtype },
    } = context;
    if (!isPgGISGeographyType || pgGISSubtype !== GIS_SUBTYPE.Polygon) {
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
      exterior: {
        type: LineString,
        resolve(data: any) {
          return {
            __gisType: GIS_SUBTYPE.LineString,
            __geojson: {
              type: "LineString",
              coordinates: data.__geojson.coordinates[0],
            },
          };
        },
      },
      interiors: {
        type: new GraphQLList(LineString),
        resolve(data: any) {
          return data.__geojson.coordinates.slice(1).map((coord: any) => ({
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
