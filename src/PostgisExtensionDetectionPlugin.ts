import type { PgCodec } from "postgraphile/@dataplan/pg";
import debug from "./debug.ts";
import { version } from "./version.ts";

declare global {
  namespace GraphileBuild {
    interface Build {
      pgGISGeometryCodec: PgCodec | null;
      pgGISGeographyCodec: PgCodec | null;
      pgGISExtensionSchema: string | null;
    }
  }
}

export const PostgisExtensionDetectionPlugin: GraphileConfig.Plugin = {
  name: "PostgisExtensionDetectionPlugin",
  version,

  schema: {
    hooks: {
      build(build) {
        // Find the geometry and geography codecs
        let pgGISGeometryCodec: PgCodec | null = null;
        let pgGISGeographyCodec: PgCodec | null = null;
        let pgGISExtensionSchema: string | null = null;

        for (const [_name, codec] of Object.entries(build.pgCodecs || {})) {
          const c = codec as PgCodec;
          if (c.name === "geometry" && c.extensions?.pg) {
            pgGISGeometryCodec = c;
            if (!pgGISExtensionSchema) {
              pgGISExtensionSchema = c.extensions.pg.schemaName;
            }
          }
          if (c.name === "geography" && c.extensions?.pg) {
            pgGISGeographyCodec = c;
            if (!pgGISExtensionSchema) {
              pgGISExtensionSchema = c.extensions.pg.schemaName;
            }
          }
        }

        if (!pgGISGeometryCodec && !pgGISGeographyCodec) {
          debug("PostGIS extension not found in database; skipping");
        } else {
          debug("PostGIS plugin enabled");
        }

        build.pgGISGraphQLTypesByTypeAndSubtype = {};
        build.pgGISGraphQLInterfaceTypesByType = {};
        build.pgGISGeometryCodec = pgGISGeometryCodec;
        build.pgGISGeographyCodec = pgGISGeographyCodec;
        build.pgGISExtensionSchema = pgGISExtensionSchema;

        return build;
      },
    },
  },
};

export default PostgisExtensionDetectionPlugin;
