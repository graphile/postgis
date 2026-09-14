import type {
  GISTypeInflectionDetails,
  GISInterfaceInflectionDetails,
  GISDimensionInterfaceInflectionDetails,
  GISFieldInflectionDetails,
  GISModifiedCodecInflectionDetails,
} from "./types.ts";
import { SUBTYPE_STRING_BY_SUBTYPE } from "./constants.ts";
import { getGISTypeDetails, getGISTypeName } from "./utils.ts";
import { version } from "./version.ts";

export const PostgisInflectionPlugin: GraphileConfig.Plugin = {
  name: "PostgisInflectionPlugin",
  version,

  inflection: {
    add: {
      gisType(_preset, details: GISTypeInflectionDetails) {
        const { typeName, subtype, hasZ, hasM } = details;
        return this.upperCamelCase(
          [
            typeName,
            SUBTYPE_STRING_BY_SUBTYPE[subtype],
            hasZ ? "z" : null,
            hasM ? "m" : null,
          ]
            .filter((_) => _)
            .join("-")
        );
      },
      gisInterfaceName(_preset, details: GISInterfaceInflectionDetails) {
        return this.upperCamelCase(`${details.typeName}-interface`);
      },
      gisDimensionInterfaceName(
        _preset,
        details: GISDimensionInterfaceInflectionDetails
      ) {
        const { typeName, hasZ, hasM } = details;
        return this.upperCamelCase(
          [
            typeName,
            SUBTYPE_STRING_BY_SUBTYPE[0],
            hasZ ? "z" : null,
            hasM ? "m" : null,
          ]
            .filter((_) => _)
            .join("-")
        );
      },
      geojsonFieldName(_preset) {
        return `geojson`;
      },
      gisXFieldName(_preset, details: GISFieldInflectionDetails) {
        return details.typeName === "geography" ? "longitude" : "x";
      },
      gisYFieldName(_preset, details: GISFieldInflectionDetails) {
        return details.typeName === "geography" ? "latitude" : "y";
      },
      gisZFieldName(_preset, details: GISFieldInflectionDetails) {
        return details.typeName === "geography" ? "height" : "z";
      },
      pgGISModifiedCodecName(
        _preset,
        details: GISModifiedCodecInflectionDetails
      ) {
        const { baseCodecName, typeModifier } = details;
        const { subtype, hasZ, hasM, srid } = getGISTypeDetails(typeModifier);
        return `${baseCodecName}_${getGISTypeName(subtype, hasZ, hasM)}_${srid}`;
      },
    },
  },
};

export default PostgisInflectionPlugin;
