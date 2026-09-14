import { version } from "./version.ts";

export const PostgisVersionPlugin: GraphileConfig.Plugin = {
  name: "PostgisVersionPlugin",
  version,

  schema: {
    hooks: {
      build(build) {
        build.versions = build.extend(
          build.versions,
          { "@graphile/postgis": version },
          "Adding @graphile/postgis version"
        );
        return build;
      },
    },
  },
};

export default PostgisVersionPlugin;
