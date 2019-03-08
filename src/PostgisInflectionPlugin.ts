import { Plugin } from "graphile-build";
import { PgType } from "graphile-build-pg";
import { TYPE_LOOKUP } from "./constants";

const PostgisInflectionPlugin: Plugin = builder => {
  builder.hook("inflection", inflection => {
    return {
      ...inflection,
      gisType(type: PgType, subtype: number) {
        return this.upperCamelCase(`${type.name}-${TYPE_LOOKUP[subtype]}`);
      },
      gisInterfaceName(type: PgType) {
        return this.upperCamelCase(`${type.name}-interface`);
      },
      geojsonFieldName() {
        return `geojson`;
      },
    };
  });
};

export default PostgisInflectionPlugin;
