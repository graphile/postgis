import type { GraphQLOutputType } from "postgraphile/graphql";
import type { Step } from "postgraphile/grafast";
import { lambda } from "postgraphile/grafast";
import type { PostGISResolvedData } from "./types.ts";
import { GIS_SUBTYPE } from "./constants.ts";
import { getGISTypeName } from "./utils.ts";
import { version } from "./version.ts";

export const Postgis_MultiPoint_PointsPlugin: GraphileConfig.Plugin = {
  name: "Postgis_MultiPoint_PointsPlugin",
  description: "Enhancing the `MultiPoint` type",
  version,

  schema: {
    hooks: {
      GraphQLObjectType_fields(fields, build, context) {
        const {
          scope: { isPgGISType, pgGISTypeName, pgGISTypeDetails },
        } = context;
        if (
          !isPgGISType ||
          !pgGISTypeDetails ||
          pgGISTypeDetails.subtype !== GIS_SUBTYPE.MultiPoint
        ) {
          return fields;
        }
        const {
          extend,
          getPostgisTypeByGeometryType,
          graphql: { GraphQLList },
        } = build;
        const { hasZ, hasM, srid } = pgGISTypeDetails;
        const pointTypeName = getPostgisTypeByGeometryType(
          pgGISTypeName!,
          GIS_SUBTYPE.Point,
          hasZ,
          hasM,
          srid
        );
        const Point = pointTypeName
          ? (build.getTypeByName(pointTypeName) as GraphQLOutputType)
          : null;
        if (!Point) return fields;

        return extend(
          fields,
          {
            points: {
              type: new GraphQLList(Point),
              plan($data: Step<PostGISResolvedData>) {
                return lambda($data, (data) =>
                  (data.__geojson.coordinates as number[][]).map((coord) => ({
                    __gisType: getGISTypeName(GIS_SUBTYPE.Point, hasZ, hasM),
                    __srid: data.__srid,
                    __geojson: {
                      type: "Point",
                      coordinates: coord,
                    },
                  }))
                );
              },
            },
          },
          "PostGIS MultiPoint points field"
        );
      },
    },
  },
};

export default Postgis_MultiPoint_PointsPlugin;
