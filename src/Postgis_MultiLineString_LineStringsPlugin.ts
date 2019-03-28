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
      pgGISTypeDetails.subtype !== GIS_SUBTYPE.MultiLineString
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
      lines: {
        type: new GraphQLList(LineString),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => ({
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
