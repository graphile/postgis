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
          ].join("-")
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
          ].join("-")
        );
      },
      geojsonFieldName() {
        return `geojson`;
      },
      gisXFieldName(type: PgType, srid: number) {
        return type.name === "geography" || srid === 4326 ? "longitude" : "x";
      },
      gisYFieldName(type: PgType, srid: number) {
        return type.name === "geography" || srid === 4326 ? "latitude" : "y";
      },
    };
  });
};

export default plugin;
