drop schema if exists graphile_postgis cascade;
create schema graphile_postgis;

drop extension if exists postgis cascade;
create extension if not exists postgis with schema public;

--insert into spatial_ref_sys (srid, auth_name, auth_srid, proj4text, srtext) values
--  (4979, 'epsg', 4979, '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ', 'GEOGCS["WGS 84",DATUM["World Geodetic System 1984",SPHEROID["WGS 84",6378137.0,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0.0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.017453292519943295],AXIS["Geodetic latitude",NORTH],AXIS["Geodetic longitude",EAST],AXIS["Ellipsoidal height",UP],AUTHORITY["EPSG","4979"]]');

create table graphile_postgis.gis_debug (
  id                        serial primary key,

  ---------------
  -- GEOGRAPHY --
  ---------------

  geog                      geography,

  -- XY
  geog_geometry             geography(geometry),
  geog_point                geography(point),
  geog_linestring           geography(linestring),
  geog_polygon              geography(polygon),
  geog_multipoint           geography(multipoint),
  geog_multilinestring      geography(multilinestring),
  geog_multipolygon         geography(multipolygon),
  geog_geometrycollection   geography(geometrycollection),

  -- XYZ
  geog_geometryz            geography(geometryz),
  geog_pointz               geography(pointz),
  geog_linestringz          geography(linestringz),
  geog_polygonz             geography(polygonz),
  geog_multipointz          geography(multipointz),
  geog_multilinestringz     geography(multilinestringz),
  geog_multipolygonz        geography(multipolygonz),
  geog_geometrycollectionz  geography(geometrycollectionz),

  -- XYM
  geog_geometrym            geography(geometrym),
  geog_pointm               geography(pointm),
  geog_linestringm          geography(linestringm),
  geog_polygonm             geography(polygonm),
  geog_multipointm          geography(multipointm),
  geog_multilinestringm     geography(multilinestringm),
  geog_multipolygonm        geography(multipolygonm),
  geog_geometrycollectionm  geography(geometrycollectionm),

  -- XYZM
  geog_geometryzm           geography(geometryzm),
  geog_pointzm              geography(pointzm),
  geog_linestringzm         geography(linestringzm),
  geog_polygonzm            geography(polygonzm),
  geog_multipointzm         geography(multipointzm),
  geog_multilinestringzm    geography(multilinestringzm),
  geog_multipolygonzm       geography(multipolygonzm),
  geog_geometrycollectionzm geography(geometrycollectionzm),

  -- EPSG:4326 (WGS 84) [deg,deg]

  --geog_point_4326              geography(point,4326),
  --geog_linestring_4326         geography(linestring,4326),
  --geog_polygon_4326            geography(polygon,4326),
  --geog_multipoint_4326         geography(multipoint,4326),
  --geog_multilinestring_4326    geography(multilinestring,4326),
  --geog_multipolygon_4326       geography(multipolygon,4326),
  --geog_geometrycollection_4326 geography(geometrycollection,4326),

  -- EPSG:4979 (WGS 84) [deg,deg,m]

  --geog_pointz_4979              geography(pointz,4979),
  --geog_linestringz_4979         geography(linestringz,4979),
  --geog_polygonz_4979            geography(polygonz,4979),
  --geog_multipointz_4979         geography(multipointz,4979),
  --geog_multilinestringz_4979    geography(multilinestringz,4979),
  --geog_multipolygonz_4979       geography(multipolygonz,4979),
  --geog_geometrycollectionz_4979 geography(geometrycollectionz,4979),

  --------------
  -- GEOMETRY --
  --------------

  geom                      geometry,

  -- XY
  geom_geometry             geometry(geometry),
  geom_point                geometry(point),
  geom_linestring           geometry(linestring),
  geom_polygon              geometry(polygon),
  geom_multipoint           geometry(multipoint),
  geom_multilinestring      geometry(multilinestring),
  geom_multipolygon         geometry(multipolygon),
  geom_geometrycollection   geometry(geometrycollection),

  -- XYZ
  geom_geometryz            geometry(geometryz),
  geom_pointz               geometry(pointz),
  geom_linestringz          geometry(linestringz),
  geom_polygonz             geometry(polygonz),
  geom_multipointz          geometry(multipointz),
  geom_multilinestringz     geometry(multilinestringz),
  geom_multipolygonz        geometry(multipolygonz),
  geom_geometrycollectionz  geometry(geometrycollectionz),

  -- XYM
  geom_geometrym            geometry(geometrym),
  geom_pointm               geometry(pointm),
  geom_linestringm          geometry(linestringm),
  geom_polygonm             geometry(polygonm),
  geom_multipointm          geometry(multipointm),
  geom_multilinestringm     geometry(multilinestringm),
  geom_multipolygonm        geometry(multipolygonm),
  geom_geometrycollectionm  geometry(geometrycollectionm),

  -- XYZM
  geom_geometryzm           geometry(geometryzm),
  geom_pointzm              geometry(pointzm),
  geom_linestringzm         geometry(linestringzm),
  geom_polygonzm            geometry(polygonzm),
  geom_multipointzm         geometry(multipointzm),
  geom_multilinestringzm    geometry(multilinestringzm),
  geom_multipolygonzm       geometry(multipolygonzm),
  geom_geometrycollectionzm geometry(geometrycollectionzm)

  -- EPSG:27700 (OSGB 1936 / British National Grid) [m,m]

  --geom_point_27700              geometry(point,27700),
  --geom_linestring_27700         geometry(linestring,27700),
  --geom_polygon_27700            geometry(polygon,27700),
  --geom_multipoint_27700         geometry(multipoint,27700),
  --geom_multilinestring_27700    geometry(multilinestring,27700),
  --geom_multipolygon_27700       geometry(multipolygon,27700),
  --geom_geometrycollection_27700 geometry(geometrycollection,27700),

  -- EPSG:7405 (OSGB 1936 / British National Grid + ODN height) [m,m,m]

  --geom_pointz_7405              geometry(pointz,7405),
  --geom_linestringz_7405         geometry(linestringz,7405),
  --geom_polygonz_7405            geometry(polygonz,7405),
  --geom_multipointz_7405         geometry(multipointz,7405),
  --geom_multilinestringz_7405    geometry(multilinestringz,7405),
  --geom_multipolygonz_7405       geometry(multipolygonz,7405),
  --geom_geometrycollectionz_7405 geometry(geometrycollectionz,7405)
);

insert into graphile_postgis.gis_debug (
  geog,

  geog_geometry,
  geog_point,
  geog_linestring,
  geog_polygon,
  geog_multipoint,
  geog_multilinestring,
  geog_multipolygon,
  geog_geometrycollection,

  geog_geometryz,
  geog_pointz,
  geog_linestringz,
  geog_polygonz,
  geog_multipointz,
  geog_multilinestringz,
  geog_multipolygonz,
  geog_geometrycollectionz,

  geog_geometrym,
  geog_pointm,
  geog_linestringm,
  geog_polygonm,
  geog_multipointm,
  geog_multilinestringm,
  geog_multipolygonm,
  geog_geometrycollectionm,

  geog_geometryzm,
  geog_pointzm,
  geog_linestringzm,
  geog_polygonzm,
  geog_multipointzm,
  geog_multilinestringzm,
  geog_multipolygonzm,
  geog_geometrycollectionzm,

  geom,

  geom_geometry,
  geom_point,
  geom_linestring,
  geom_polygon,
  geom_multipoint,
  geom_multilinestring,
  geom_multipolygon,
  geom_geometrycollection,

  geom_geometryz,
  geom_pointz,
  geom_linestringz,
  geom_polygonz,
  geom_multipointz,
  geom_multilinestringz,
  geom_multipolygonz,
  geom_geometrycollectionz,

  geom_geometrym,
  geom_pointm,
  geom_linestringm,
  geom_polygonm,
  geom_multipointm,
  geom_multilinestringm,
  geom_multipolygonm,
  geom_geometrycollectionm,

  geom_geometryzm,
  geom_pointzm,
  geom_linestringzm,
  geom_polygonzm,
  geom_multipointzm,
  geom_multilinestringzm,
  geom_multipolygonzm,
  geom_geometrycollectionzm
) values (
  ST_GeographyFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeographyFromText('POINT (30 10)'),
  ST_GeographyFromText('POINT (30 10)'),
  ST_GeographyFromText('LINESTRING (30 10, 10 30, 40 40)'),
  ST_GeographyFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'),
  ST_GeographyFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)'),
  ST_GeographyFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))'),
  ST_GeographyFromText('MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeographyFromText('POINT Z (30 10 80)'),
  ST_GeographyFromText('POINT Z (30 10 80)'),
  ST_GeographyFromText('LINESTRING Z (30 10 80, 10 30 80, 40 40 80)'),
  ST_GeographyFromText('POLYGON Z ((35 10 80, 45 45 80, 15 40 80, 10 20 80, 35 10 80), (20 30 80, 35 35 80, 30 20 80, 20 30 80))'),
  ST_GeographyFromText('MULTIPOINT Z (10 40 80, 40 30 80, 20 20 80, 30 10 80)'),
  ST_GeographyFromText('MULTILINESTRING Z ((10 10 80, 20 20 80, 10 40 80), (40 40 80, 30 30 80, 40 20 80, 30 10 80))'),
  ST_GeographyFromText('MULTIPOLYGON Z (((40 40 80, 20 45 80, 45 30 80, 40 40 80)), ((20 35 80, 10 30 80, 10 10 80, 30 5 80, 45 20 80, 20 35 80), (30 20 80, 20 15 80, 20 25 80, 30 20 80)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION Z (POINT Z (4 6 80),LINESTRING Z (4 6 80,7 10 80))'),

  ST_GeographyFromText('POINT M (30 10 99)'),
  ST_GeographyFromText('POINT M (30 10 99)'),
  ST_GeographyFromText('LINESTRING M (30 10 99, 10 30 99, 40 40 99)'),
  ST_GeographyFromText('POLYGON M ((35 10 99, 45 45 99, 15 40 99, 10 20 99, 35 10 99), (20 30 99, 35 35 99, 30 20 99, 20 30 99))'),
  ST_GeographyFromText('MULTIPOINT M (10 40 99, 40 30 99, 20 20 99, 30 10 99)'),
  ST_GeographyFromText('MULTILINESTRING M ((10 10 99, 20 20 99, 10 40 99), (40 40 99, 30 30 99, 40 20 99, 30 10 99))'),
  ST_GeographyFromText('MULTIPOLYGON M (((40 40 99, 20 45 99, 45 30 99, 40 40 99)), ((20 35 99, 10 30 99, 10 10 99, 30 5 99, 45 20 99, 20 35 99), (30 20 99, 20 15 99, 20 25 99, 30 20 99)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION M (POINT M (4 6 99),LINESTRING M (4 6 99,7 10 99))'),

  ST_GeographyFromText('POINT ZM (30 10 80 99)'),
  ST_GeographyFromText('POINT ZM (30 10 80 99)'),
  ST_GeographyFromText('LINESTRING ZM (30 10 80 99, 10 30 80 99, 40 40 80 99)'),
  ST_GeographyFromText('POLYGON ZM ((35 10 80 99, 45 45 80 99, 15 40 80 99, 10 20 80 99, 35 10 80 99), (20 30 80 99, 35 35 80 99, 30 20 80 99, 20 30 80 99))'),
  ST_GeographyFromText('MULTIPOINT ZM (10 40 80 99, 40 30 80 99, 20 20 80 99, 30 10 80 99)'),
  ST_GeographyFromText('MULTILINESTRING ZM ((10 10 80 99, 20 20 80 99, 10 40 80 99), (40 40 80 99, 30 30 80 99, 40 20 80 99, 30 10 80 99))'),
  ST_GeographyFromText('MULTIPOLYGON ZM (((40 40 80 99, 20 45 80 99, 45 30 80 99, 40 40 80 99)), ((20 35 80 99, 10 30 80 99, 10 10 80 99, 30 5 80 99, 45 20 80 99, 20 35 80 99), (30 20 80 99, 20 15 80 99, 20 25 80 99, 30 20 80 99)))'),
  ST_GeographyFromText('GEOMETRYCOLLECTION ZM (POINT ZM (4 6 80 99),LINESTRING ZM (4 6 80 99,7 10 80 99))'),

  ST_GeometryFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeometryFromText('POINT (30 10)'),
  ST_GeometryFromText('POINT (30 10)'),
  ST_GeometryFromText('LINESTRING (30 10, 10 30, 40 40)'),
  ST_GeometryFromText('POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10), (20 30, 35 35, 30 20, 20 30))'),
  ST_GeometryFromText('MULTIPOINT (10 40, 40 30, 20 20, 30 10)'),
  ST_GeometryFromText('MULTILINESTRING ((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))'),
  ST_GeometryFromText('MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)), ((20 35, 10 30, 10 10, 30 5, 45 20, 20 35), (30 20, 20 15, 20 25, 30 20)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION(POINT(4 6),LINESTRING(4 6,7 10))'),

  ST_GeometryFromText('POINT Z (30 10 80)'),
  ST_GeometryFromText('POINT Z (30 10 80)'),
  ST_GeometryFromText('LINESTRING Z (30 10 80, 10 30 80, 40 40 80)'),
  ST_GeometryFromText('POLYGON Z ((35 10 80, 45 45 80, 15 40 80, 10 20 80, 35 10 80), (20 30 80, 35 35 80, 30 20 80, 20 30 80))'),
  ST_GeometryFromText('MULTIPOINT Z (10 40 80, 40 30 80, 20 20 80, 30 10 80)'),
  ST_GeometryFromText('MULTILINESTRING Z ((10 10 80, 20 20 80, 10 40 80), (40 40 80, 30 30 80, 40 20 80, 30 10 80))'),
  ST_GeometryFromText('MULTIPOLYGON Z (((40 40 80, 20 45 80, 45 30 80, 40 40 80)), ((20 35 80, 10 30 80, 10 10 80, 30 5 80, 45 20 80, 20 35 80), (30 20 80, 20 15 80, 20 25 80, 30 20 80)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION Z (POINT Z (4 6 80),LINESTRING Z (4 6 80,7 10 80))'),

  ST_GeometryFromText('POINT M (30 10 99)'),
  ST_GeometryFromText('POINT M (30 10 99)'),
  ST_GeometryFromText('LINESTRING M (30 10 99, 10 30 99, 40 40 99)'),
  ST_GeometryFromText('POLYGON M ((35 10 99, 45 45 99, 15 40 99, 10 20 99, 35 10 99), (20 30 99, 35 35 99, 30 20 99, 20 30 99))'),
  ST_GeometryFromText('MULTIPOINT M (10 40 99, 40 30 99, 20 20 99, 30 10 99)'),
  ST_GeometryFromText('MULTILINESTRING M ((10 10 99, 20 20 99, 10 40 99), (40 40 99, 30 30 99, 40 20 99, 30 10 99))'),
  ST_GeometryFromText('MULTIPOLYGON M (((40 40 99, 20 45 99, 45 30 99, 40 40 99)), ((20 35 99, 10 30 99, 10 10 99, 30 5 99, 45 20 99, 20 35 99), (30 20 99, 20 15 99, 20 25 99, 30 20 99)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION M (POINT M (4 6 99),LINESTRING M (4 6 99,7 10 99))'),

  ST_GeometryFromText('POINT ZM (30 10 80 99)'),
  ST_GeometryFromText('POINT ZM (30 10 80 99)'),
  ST_GeometryFromText('LINESTRING ZM (30 10 80 99, 10 30 80 99, 40 40 80 99)'),
  ST_GeometryFromText('POLYGON ZM ((35 10 80 99, 45 45 80 99, 15 40 80 99, 10 20 80 99, 35 10 80 99), (20 30 80 99, 35 35 80 99, 30 20 80 99, 20 30 80 99))'),
  ST_GeometryFromText('MULTIPOINT ZM (10 40 80 99, 40 30 80 99, 20 20 80 99, 30 10 80 99)'),
  ST_GeometryFromText('MULTILINESTRING ZM ((10 10 80 99, 20 20 80 99, 10 40 80 99), (40 40 80 99, 30 30 80 99, 40 20 80 99, 30 10 80 99))'),
  ST_GeometryFromText('MULTIPOLYGON ZM (((40 40 80 99, 20 45 80 99, 45 30 80 99, 40 40 80 99)), ((20 35 80 99, 10 30 80 99, 10 10 80 99, 30 5 80 99, 45 20 80 99, 20 35 80 99), (30 20 80 99, 20 15 80 99, 20 25 80 99, 30 20 80 99)))'),
  ST_GeometryFromText('GEOMETRYCOLLECTION ZM (POINT ZM (4 6 80 99),LINESTRING ZM (4 6 80 99,7 10 80 99))')
);

-- SCHEMA: graphile_postgis_minimal_unconstrained
-- one geometry column with no constraints

drop schema if exists graphile_postgis_minimal_unconstrained cascade;
create schema graphile_postgis_minimal_unconstrained;
create table graphile_postgis_minimal_unconstrained.foo (
  id serial primary key,
  geom geometry
);
insert into graphile_postgis_minimal_unconstrained.foo (geom) values
  (GeomFromEWKT('SRID=27700;POINT (437300 115500)'));

-- SCHEMA: graphile_postgis_minimal_dimensional
-- one geometry column with a dimensional constraint

drop schema if exists graphile_postgis_minimal_dimensional cascade;
create schema graphile_postgis_minimal_dimensional;
create table graphile_postgis_minimal_dimensional.foo (
  id serial primary key,
  geom_geometry geometry(geometry)
);
insert into graphile_postgis_minimal_dimensional.foo (geom_geometry) values
  (GeomFromEWKT('SRID=27700;POINT (437300 115500)'));

-- SCHEMA: graphile_postgis_minimal_type
-- one geometry column with a type constraint

drop schema if exists graphile_postgis_minimal_type cascade;
create schema graphile_postgis_minimal_type;
create table graphile_postgis_minimal_type.foo (
  id serial primary key,
  geom_point geometry(point)
);
insert into graphile_postgis_minimal_type.foo (geom_point) values
  (GeomFromEWKT('SRID=27700;POINT (437300 115500)'));

-- SCHEMA: graphile_postgis_minimal_type_and_srid
-- one geometry column with a type constraint and an SRID constraint

drop schema if exists graphile_postgis_minimal_type_and_srid cascade;
create schema graphile_postgis_minimal_type_and_srid;
create table graphile_postgis_minimal_type_and_srid.foo (
  id serial primary key,
  geom_point_27700 geometry(point,27700)
);
insert into graphile_postgis_minimal_type_and_srid.foo (geom_point_27700) values
  (GeomFromEWKT('SRID=27700;POINT (437300 115500)'));
