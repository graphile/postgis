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
      pgGISTypeDetails.subtype !== GIS_SUBTYPE.MultiPolygon
    ) {
      return fields;
    }
    const {
      extend,
      getPostgisTypeByGeometryType,
      graphql: { GraphQLList },
    } = build;
    const Polygon = getPostgisTypeByGeometryType(
      pgGISType,
      GIS_SUBTYPE.Polygon
    );

    return extend(fields, {
      polygons: {
        type: new GraphQLList(Polygon),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => ({
            __gisType: GIS_SUBTYPE.Polygon,
            __geojson: {
              type: "Polygon",
              coordinates: coord,
            },
          }));
        },
      },
    });
  });
};
export default plugin;
