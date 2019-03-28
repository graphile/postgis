import { Plugin } from "graphile-build";
import { GIS_SUBTYPE } from "./constants";
import { getGISTypeName } from "./utils";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISType, pgGISType, pgGISTypeDetails },
    } = context;
    if (
      !isPgGISType ||
      !pgGISTypeDetails ||
      pgGISTypeDetails.subtype !== GIS_SUBTYPE.Polygon
    ) {
      return fields;
    }
    const {
      extend,
      getPostgisTypeByGeometryType,
      graphql: { GraphQLList },
    } = build;
    const { hasZ, hasM, srid } = pgGISTypeDetails;
    const LineString = getPostgisTypeByGeometryType(
      pgGISType,
      GIS_SUBTYPE.LineString,
      hasZ,
      hasM,
      srid
    );

    return extend(fields, {
      exterior: {
        type: LineString,
        resolve(data: any) {
          return {
            __gisType: getGISTypeName(GIS_SUBTYPE.LineString, hasZ, hasM),
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
            __gisType: getGISTypeName(GIS_SUBTYPE.LineString, hasZ, hasM),
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
