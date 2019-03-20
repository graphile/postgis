export const SUBTYPE_STRING_BY_SUBTYPE = {
  1: "point",
  2: "linestring",
  3: "polygon",
  4: "multipoint",
  5: "multilinestring",
  6: "multipolygon",
  7: "geometry-collection",
};

export const SUBTYPE_BY_PG_GEOMETRY_TYPE = {
  POINT: 1,
  LINESTR: 2,
  POLYGON: 3,
  MULTIPOINT: 4,
  MULTILINESTR: 5,
  MULTIPOLYGON: 6,
  GEOMETRYCOLLECTION: 7,
};

export const SUBTYPE_BY_GEOJSON_TYPE = {
  Point: 1,
  LineString: 2,
  Polygon: 3,
  MultiPoint: 4,
  MultiLinestr: 5,
  MultiPolygon: 6,
  GeometryCollection: 7,
};
