import { Plugin } from "graphile-build";
import { SUBTYPE_BY_PG_GEOMETRY_TYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISGeographyType, pgGISSubtype },
    } = context;
    if (
      !isPgGISGeographyType ||
      pgGISSubtype !== SUBTYPE_BY_PG_GEOMETRY_TYPE.POLYGON
    ) {
      return fields;
    }
    const {
      extend,
      getPostgisTypeByGeometryType,
      graphql: { GraphQLList },
    } = build;
    const LineString = getPostgisTypeByGeometryType(
      SUBTYPE_BY_PG_GEOMETRY_TYPE.LINESTR
    );

    return extend(fields, {
      exteriorRing: {
        type: LineString,
        resolve(data: any) {
          return {
            __gisType: SUBTYPE_BY_PG_GEOMETRY_TYPE.LINESTR,
            __geojson: {
              type: "LineString",
              coordinates: data.__geojson.coordinates[0],
            },
          };
        },
      },
      interiorRings: {
        type: new GraphQLList(LineString),
        resolve(data: any) {
          return data.__geojson.coordinates.slice(1).map((coord: any) => ({
            __gisType: SUBTYPE_BY_PG_GEOMETRY_TYPE.LINESTR,
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
