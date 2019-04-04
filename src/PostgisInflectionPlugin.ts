import { Plugin } from "graphile-build";
import { PgType } from "graphile-build-pg";
import { Subtype } from "./interfaces";
import { SUBTYPE_STRING_BY_SUBTYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("inflection", inflection => {
    return {
      ...inflection,
      gisType(type: PgType, subtype: Subtype, hasZ: boolean, hasM: boolean) {
        return this.upperCamelCase(
          [
            type.name,
            SUBTYPE_STRING_BY_SUBTYPE[subtype],
            hasZ ? "z" : null,
            hasM ? "m" : null,
          ]
            .filter(_ => _)
            .join("-")
        );
      },
      gisInterfaceName(type: PgType) {
        return this.upperCamelCase(`${type.name}-interface`);
      },
      gisDimensionInterfaceName(type: PgType, hasZ: boolean, hasM: boolean) {
        return this.upperCamelCase(
          [
            type.name,
            SUBTYPE_STRING_BY_SUBTYPE[0],
            hasZ ? "z" : null,
            hasM ? "m" : null,
          ]
            .filter(_ => _)
            .join("-")
        );
      },
      geojsonFieldName() {
        return `geojson`;
      },
      gisXFieldName(type: PgType) {
        return type.name === "geography" ? "longitude" : "x";
      },
      gisYFieldName(type: PgType) {
        return type.name === "geography" ? "latitude" : "y";
      },
      gisZFieldName(type: PgType) {
        return type.name === "geography" ? "height" : "z";
      },
    };
  });
};

export default plugin;
