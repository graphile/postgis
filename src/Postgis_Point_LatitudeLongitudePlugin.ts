import type { Step } from "postgraphile/grafast";
import { lambda } from "postgraphile/grafast";
import type { PostGISResolvedData } from "./types.ts";
import { GIS_SUBTYPE } from "./constants.ts";
import { version } from "./version.ts";

export const Postgis_Point_LatitudeLongitudePlugin: GraphileConfig.Plugin = {
  name: "Postgis_Point_LatitudeLongitudePlugin",
  description: "Enhancing the `Point` type",
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
          pgGISTypeDetails.subtype !== GIS_SUBTYPE.Point
        ) {
          return fields;
        }
        const {
          extend,
          graphql: { GraphQLNonNull, GraphQLFloat },
          inflection,
        } = build;
        const xFieldName = inflection.gisXFieldName({
          typeName: pgGISTypeName!,
          scope: context.scope,
        });
        const yFieldName = inflection.gisYFieldName({
          typeName: pgGISTypeName!,
          scope: context.scope,
        });
        const zFieldName = inflection.gisZFieldName({
          typeName: pgGISTypeName!,
          scope: context.scope,
        });
        return extend(
          fields,
          {
            [xFieldName]: {
              type: new GraphQLNonNull(GraphQLFloat),
              plan($data: Step<PostGISResolvedData>) {
                return lambda(
                  $data,
                  (data) => (data.__geojson.coordinates as number[])[0]
                );
              },
            },
            [yFieldName]: {
              type: new GraphQLNonNull(GraphQLFloat),
              plan($data: Step<PostGISResolvedData>) {
                return lambda(
                  $data,
                  (data) => (data.__geojson.coordinates as number[])[1]
                );
              },
            },
            ...(pgGISTypeDetails.hasZ
              ? {
                  [zFieldName]: {
                    type: new GraphQLNonNull(GraphQLFloat),
                    plan($data: Step<PostGISResolvedData>) {
                      return lambda(
                        $data,
                        (data) => (data.__geojson.coordinates as number[])[2]
                      );
                    },
                  },
                }
              : {}),
          },
          "PostGIS Point lat/lon fields"
        );
      },
    },
  },
};

export default Postgis_Point_LatitudeLongitudePlugin;
