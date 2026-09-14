import type { GraphQLOutputType } from "postgraphile/graphql";
import type { Step } from "postgraphile/grafast";
import { lambda } from "postgraphile/grafast";
import type { PostGISResolvedData } from "./types.ts";
import { GIS_SUBTYPE } from "./constants.ts";
import { getGISTypeName } from "./utils.ts";
import { version } from "./version.ts";

export const Postgis_Polygon_RingsPlugin: GraphileConfig.Plugin = {
  name: "Postgis_Polygon_RingsPlugin",
  description: "Enhancing the `Polygon` type",
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
        const lineStringTypeName = getPostgisTypeByGeometryType(
          pgGISTypeName!,
          GIS_SUBTYPE.LineString,
          hasZ,
          hasM,
          srid
        );
        const LineString = lineStringTypeName
          ? (build.getTypeByName(lineStringTypeName) as GraphQLOutputType)
          : null;
        if (!LineString) return fields;

        return extend(
          fields,
          {
            exterior: {
              type: LineString,
              plan($data: Step<PostGISResolvedData>) {
                return lambda($data, (data) => ({
                  __gisType: getGISTypeName(GIS_SUBTYPE.LineString, hasZ, hasM),
                  __srid: data.__srid,
                  __geojson: {
                    type: "LineString",
                    coordinates: (
                      data.__geojson.coordinates as number[][][]
                    )[0],
                  },
                }));
              },
            },
            interiors: {
              type: new GraphQLList(LineString),
              plan($data: Step<PostGISResolvedData>) {
                return lambda($data, (data) =>
                  (data.__geojson.coordinates as number[][][])
                    .slice(1)
                    .map((coord) => ({
                      __gisType: getGISTypeName(
                        GIS_SUBTYPE.LineString,
                        hasZ,
                        hasM
                      ),
                      __srid: data.__srid,
                      __geojson: {
                        type: "LineString",
                        coordinates: coord,
                      },
                    }))
                );
              },
            },
          },
          "PostGIS Polygon rings fields"
        );
      },
    },
  },
};

export default Postgis_Polygon_RingsPlugin;
