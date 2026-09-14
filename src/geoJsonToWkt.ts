import type { SQLRawValue } from "postgraphile/@dataplan/pg/pg-sql2";
import type { GeoJSONCoordinates, GeoJSONGeometry } from "./types.ts";

// PostGIS's `geometry_in` happens to lenient-parse GeoJSON text directly (an
// undocumented implementation detail), but `geography_in` does not - it
// throws "parse error - invalid geometry". Rather than depend on that
// leniency (which also doesn't verify we handle SRID/dimensionality
// correctly), this converts GeoJSON to WKT/EWKT ourselves, which both
// `geometry_in` and `geography_in` accept explicitly and identically.

function coordToWkt(coord: number[]): string {
  return coord.join(" ");
}

function firstCoord(coordinates: GeoJSONCoordinates): number[] | undefined {
  let current: GeoJSONCoordinates = coordinates;
  while (Array.isArray(current) && Array.isArray(current[0])) {
    current = current[0] as GeoJSONCoordinates;
  }
  return Array.isArray(current) && typeof current[0] === "number"
    ? (current as number[])
    : undefined;
}

function dimSuffix(coordinates: GeoJSONCoordinates): string {
  const coord = firstCoord(coordinates);
  return coord && coord.length >= 3 ? " Z " : "";
}

function pointBody(coordinates: number[]): string {
  return `(${coordToWkt(coordinates)})`;
}

function lineBody(coordinates: number[][]): string {
  return `(${coordinates.map(coordToWkt).join(", ")})`;
}

function polygonBody(coordinates: number[][][]): string {
  return `(${coordinates.map((ring) => `(${ring.map(coordToWkt).join(", ")})`).join(", ")})`;
}

function multiPolygonBody(coordinates: number[][][][]): string {
  return `(${coordinates.map(polygonBody).join(", ")})`;
}

function toWktBody(geometry: GeoJSONGeometry): string {
  switch (geometry.type) {
    case "Point":
      return `POINT${dimSuffix(geometry.coordinates!)}${pointBody(
        geometry.coordinates as number[]
      )}`;
    case "LineString":
      return `LINESTRING${dimSuffix(geometry.coordinates!)}${lineBody(
        geometry.coordinates as number[][]
      )}`;
    case "Polygon":
      return `POLYGON${dimSuffix(geometry.coordinates!)}${polygonBody(
        geometry.coordinates as number[][][]
      )}`;
    case "MultiPoint":
      return `MULTIPOINT${dimSuffix(geometry.coordinates!)}${lineBody(
        geometry.coordinates as number[][]
      )}`;
    case "MultiLineString":
      return `MULTILINESTRING${dimSuffix(geometry.coordinates!)}${polygonBody(
        geometry.coordinates as number[][][]
      )}`;
    case "MultiPolygon":
      return `MULTIPOLYGON${dimSuffix(
        geometry.coordinates!
      )}${multiPolygonBody(geometry.coordinates as number[][][][])}`;
    case "GeometryCollection":
      return `GEOMETRYCOLLECTION(${(geometry.geometries ?? [])
        .map(toWktBody)
        .join(", ")})`;
    default:
      throw new Error(`Unsupported GeoJSON type: ${geometry.type}`);
  }
}

/**
 * Converts a GeoJSON geometry object into EWKT text that PostGIS's
 * `geometry_in`/`geography_in` will accept, for use as the SQL parameter
 * value when writing a geometry/geography column. Non-object values (e.g.
 * an already-WKT string, or null) are passed through unchanged.
 *
 * `srid` defaults to 4326 (WGS 84) per RFC 7946, which mandates that GeoJSON
 * coordinates are always WGS 84 regardless of any `crs` member. Callers
 * writing into a column constrained to a different SRID must pass that SRID
 * explicitly, since PostGIS rejects a typmod cast whose EWKT SRID conflicts
 * with the column's.
 */
export function geoJsonToWkt(value: unknown, srid = 4326): SQLRawValue {
  if (value == null || typeof value !== "object") {
    return value as SQLRawValue;
  }
  const geometry = value as GeoJSONGeometry;
  if (typeof geometry.type !== "string") {
    return value as unknown as SQLRawValue;
  }

  return `SRID=${srid};${toWktBody(geometry)}`;
}
