drop schema if exists graphile_postgis cascade;
create schema graphile_postgis;

drop extension if exists postgis cascade;
create extension if not exists postgis with schema public;

set search_path to graphile_postgis, public;

create table graphile_postgis.gis_debug (
  id                        serial primary key,

  geog                      geography,

  geog_point                geography(point),
  geog_linestring           geography(linestring),
  geog_polygon              geography(polygon),
  geog_multipoint           geography(multipoint),
  geog_multilinestring      geography(multilinestring),
  geog_multipolygon         geography(multipolygon),
  geog_geometrycollection   geography(geometrycollection),

  geog_pointm               geography(pointm),
  geog_linestringm          geography(linestringm),
  geog_polygonm             geography(polygonm),
  geog_multipointm          geography(multipointm),
  geog_multilinestringm     geography(multilinestringm),
  geog_multipolygonm        geography(multipolygonm),
  geog_geometrycollectionm  geography(geometrycollectionm),

  -- geog_pointz               geography(pointz),
  -- geog_linestringz          geography(linestringz),
  -- geog_polygonz             geography(polygonz),
  -- geog_multipointz          geography(multipointz),
  -- geog_multilinestringz     geography(multilinestringz),
  -- geog_multipolygonz        geography(multipolygonz),
  -- geog_geometrycollectionz  geography(geometrycollectionz),

  -- geog_pointzm              geography(pointzm),
  -- geog_linestringzm         geography(linestringzm),
  -- geog_polygonzm            geography(polygonzm),
  -- geog_multipointzm         geography(multipointzm),
  -- geog_multilinestringzm    geography(multilinestringzm),
  -- geog_multipolygonzm       geography(multipolygonzm),
  -- geog_geometrycollectionzm geography(geometrycollectionzm),

  geom                      geometry,

  geom_point                geometry(point),
  geom_linestring           geometry(linestring),
  geom_polygon              geometry(polygon),
  geom_multipoint           geometry(multipoint),
  geom_multilinestring      geometry(multilinestring),
  geom_multipolygon         geometry(multipolygon),
  geom_geometrycollection   geometry(geometrycollection),

  geom_pointm               geometry(pointm),
  geom_linestringm          geometry(linestringm),
  geom_polygonm             geometry(polygonm),
  geom_multipointm          geometry(multipointm),
  geom_multilinestringm     geometry(multilinestringm),
  geom_multipolygonm        geometry(multipolygonm),
  geom_geometrycollectionm  geometry(geometrycollectionm)

  -- geom_pointz               geometry(pointz),
  -- geom_linestringz          geometry(linestringz),
  -- geom_polygonz             geometry(polygonz),
  -- geom_multipointz          geometry(multipointz),
  -- geom_multilinestringz     geometry(multilinestringz),
  -- geom_multipolygonz        geometry(multipolygonz),
  -- geom_geometrycollectionz  geometry(geometrycollectionz),

  -- geom_pointzm              geometry(pointzm),
  -- geom_linestringzm         geometry(linestringzm),
  -- geom_polygonzm            geometry(polygonzm),
  -- geom_multipointzm         geometry(multipointzm),
  -- geom_multilinestringzm    geometry(multilinestringzm),
  -- geom_multipolygonzm       geometry(multipolygonzm),
  -- geom_geometrycollectionzm geometry(geometrycollectionzm),
);

insert into graphile_postgis.gis_debug (
  geog,

  geog_point,
  geog_linestring,
  geog_polygon,
  geog_multipoint,
  geog_multilinestring,
  geog_multipolygon,
  geog_geometrycollection,

  geog_pointm,
  geog_linestringm,
  geog_polygonm,
  geog_multipointm,
  geog_multilinestringm,
  geog_multipolygonm,
  geog_geometrycollectionm,

  geom,

  geom_point,
  geom_linestring,
  geom_polygon,
  geom_multipoint,
  geom_multilinestring,
  geom_multipolygon,
  geom_geometrycollection,

  geom_pointm,
  geom_linestringm,
  geom_polygonm,
  geom_multipointm,
  geom_multilinestringm,
  geom_multipolygonm,
  geom_geometrycollectionm
) values (
  ST_GeographyFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeographyFromText('POINT (30 10)'),
  ST_GeographyFromText('LINESTRING (30 10, 10 30, 40 40)'),
  ST_GeographyFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'),
  ST_GeographyFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)'),
  ST_GeographyFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))'),
  ST_GeographyFromText('MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeographyFromText('POINT M (30 10 99)'),
  ST_GeographyFromText('LINESTRING M (30 10 99, 10 30 99, 40 40 99)'),
  ST_GeographyFromText('POLYGON M ((35 10 99, 45 45 99, 15 40 99, 10 20 99, 35 10 99), (20 30 99, 35 35 99, 30 20 99, 20 30 99))'),
  ST_GeographyFromText('MULTIPOINT M (10 40 99, 40 30 99, 20 20 99, 30 10 99)'),
  ST_GeographyFromText('MULTILINESTRING M ((10 10 99, 20 20 99, 10 40 99), (40 40 99, 30 30 99, 40 20 99, 30 10 99))'),
  ST_GeographyFromText('MULTIPOLYGON M (((40 40 99, 20 45 99, 45 30 99, 40 40 99)), ((20 35 99, 10 30 99, 10 10 99, 30 5 99, 45 20 99, 20 35 99), (30 20 99, 20 15 99, 20 25 99, 30 20 99)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION M (POINT M (4 6 99),LINESTRING M (4 6 99,7 10 99))'),

  ST_GeometryFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeometryFromText('POINT (30 10)'),
  ST_GeometryFromText('LINESTRING (30 10, 10 30, 40 40)'),
  ST_GeometryFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'),
  ST_GeometryFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)'),
  ST_GeometryFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))'),
  ST_GeometryFromText('MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeometryFromText('POINT M (30 10 99)'),
  ST_GeometryFromText('LINESTRING M (30 10 99, 10 30 99, 40 40 99)'),
  ST_GeometryFromText('POLYGON M ((35 10 99, 45 45 99, 15 40 99, 10 20 99, 35 10 99), (20 30 99, 35 35 99, 30 20 99, 20 30 99))'),
  ST_GeometryFromText('MULTIPOINT M (10 40 99, 40 30 99, 20 20 99, 30 10 99)'),
  ST_GeometryFromText('MULTILINESTRING M ((10 10 99, 20 20 99, 10 40 99), (40 40 99, 30 30 99, 40 20 99, 30 10 99))'),
  ST_GeometryFromText('MULTIPOLYGON M (((40 40 99, 20 45 99, 45 30 99, 40 40 99)), ((20 35 99, 10 30 99, 10 10 99, 30 5 99, 45 20 99, 20 35 99), (30 20 99, 20 15 99, 20 25 99, 30 20 99)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION M (POINT M (4 6 99),LINESTRING M (4 6 99,7 10 99))')
);
