import { Plugin } from "graphile-build";
import { PgType } from "graphile-build-pg";
import { SUBTYPE_STRING_BY_SUBTYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("inflection", inflection => {
    return {
      ...inflection,
      gisType(type: PgType, subtype: number) {
        return this.upperCamelCase(
          `${type.name}-${SUBTYPE_STRING_BY_SUBTYPE[subtype]}`
        );
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

export default plugin;
