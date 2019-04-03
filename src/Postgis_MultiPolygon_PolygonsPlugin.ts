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
      pgGISTypeDetails.subtype !== GIS_SUBTYPE.MultiPolygon
    ) {
      return fields;
    }
    const {
      extend,
      getPostgisTypeByGeometryType,
      graphql: { GraphQLList },
    } = build;
    const { hasZ, hasM, srid } = pgGISTypeDetails;
    const Polygon = getPostgisTypeByGeometryType(
      pgGISType,
      GIS_SUBTYPE.Polygon,
      hasZ,
      hasM,
      srid
    );

    return extend(fields, {
      polygons: {
        type: new GraphQLList(Polygon),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => ({
            __gisType: getGISTypeName(GIS_SUBTYPE.Polygon, hasZ, hasM),
            __srid: data.__srid,
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
