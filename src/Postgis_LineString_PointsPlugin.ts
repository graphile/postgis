import { Plugin } from "graphile-build";
import { GIS_SUBTYPE } from "./constants";
import { getGISTypeModifier } from "./utils";

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
    const { hasZ, hasM, srid } = pgGISTypeDetails;
    const Point = getPostgisTypeByGeometryType(
      pgGISType,
      GIS_SUBTYPE.Point,
      hasZ,
      hasM,
      srid
    );

    return extend(fields, {
      points: {
        type: new GraphQLList(Point),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => {
            return {
              __gisType: getGISTypeModifier(
                GIS_SUBTYPE.Point,
                hasZ,
                hasM,
                srid
              ),
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
