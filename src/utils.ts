import { SubtypeDetails } from "./interfaces";
import { TYPE_LOOKUP } from "./constants";

export const getSubtypeAndSridFromModifier = (
  isGeography: boolean,
  modifier: number
): SubtypeDetails => {
  const allZeroesHopefully = modifier >> 24;
  if (allZeroesHopefully !== 0) {
    throw new Error("Unsupported PostGIS modifier");
  }
  const srid = (modifier >> 8) & (2 ** 16 - 1);
  if (isGeography && (srid !== 4326 && srid !== 0)) {
    throw new Error(
      `We only support SRID 4326 currently, saw something with SRID '${srid}'`
    );
  }
  if (!isGeography && srid !== 0) {
    throw new Error("Unexpected SRID with geometry type");
  }
  const subtype = (modifier & 255) >> 2;
  if (subtype > 7 || subtype < 0) {
    throw new Error(
      `Unsupported PostGIS modifier, expected 0-7, received ${subtype} (${modifier})`
    );
  }
  const isXym = (modifier & 1) === 1;
  return {
    srid,
    isXym,
    subtype,
    subtypeString: TYPE_LOOKUP[subtype],
  };
};
