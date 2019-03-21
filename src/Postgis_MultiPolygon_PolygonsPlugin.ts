import { Plugin } from "graphile-build";
import { SUBTYPE_BY_PG_GEOMETRY_TYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISGeographyType, pgGISType, pgGISSubtype },
    } = context;
    if (
      !isPgGISGeographyType ||
      pgGISSubtype !== SUBTYPE_BY_PG_GEOMETRY_TYPE.MULTIPOLYGON
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
      SUBTYPE_BY_PG_GEOMETRY_TYPE.POLYGON
    );

    return extend(fields, {
      polygons: {
        type: new GraphQLList(Polygon),
        resolve(data: any) {
          return data.__geojson.coordinates.map((coord: any) => ({
            __gisType: SUBTYPE_BY_PG_GEOMETRY_TYPE.POLYGON,
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
