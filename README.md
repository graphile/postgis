# @graphile/postgis

This is a [PostGraphile schema
plugin](https://www.graphile.org/postgraphile/extending/) that provides
support for the popular [PostGIS](http://postgis.net/) spatial database
system.

Create a [PostgreSQL](https://www.postgresql.org/) database with PostGIS
columns, run [PostGraphile](https://www.graphile.org/postgraphile/) with this
plugin, and have a fully functional geospatial-aware
[GraphQL](http://graphql.org/) API for your database.

## Roadmap

Work is ongoing, here's the plan:

- [x] Read-only support for `geojson` field from all geography types (via a shared GraphQL interface)
- [x] Add GraphQL types for all the expected geography types (implementing this interface)
- [x] Read-only support for determining the geometry sub-types of columns and exposing these directly (rather than the interface)
- [x] Read-only support for `longitude` and `latitude` on `geography(POINT)` columns
- [x] Read-only support for viewing the list of `geometries` in a `geography(GEOMETRYCOLLECTION)`
- [x] Read-only support for a list of points (`longitude` and `latitude`) on
      `geography(LINESTRING)` and `geography(POLYGON)` columns
- [x] Create/update/null support for `geography(POINT)` columns
- [x] Create/update/null support for `geography(LINESTRING)` and `geography(POLYGON)` columns
- [x] Integration with `postgraphile-plugin-connection-filter` to enable PostGIS specific filtering (via [postgraphile-plugin-connection-filter-postgis](https://github.com/mattbretl/postgraphile-plugin-connection-filter-postgis/))
- [ ] Read-only support for computed attributes on
      `geography(LINESTRING)` and `geography(POLYGON)`, such as `area`,
      `length`, `perimeter`, and `centroid` - currently possible by adding a plugin and consuming the GeoJSON directly.

There are many, many other features that this plugin could support - if you
have specific needs please get in touch!

## Usage

This plugin requires PostGraphile **v4.4.0** or higher to function correctly.

Add PostGIS to your database:

```sql
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;
```

Load the plugin:

```
postgraphile --append-plugins @graphile/postgis
```

#### Querying and mutating

Using this table as example:

```sql
CREATE TABLE data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v1mc(),
  geom_point geometry(Point, 4326) default null
);
```

In **queries** `geom_point` is represented as type `GeometryPoint`. Example:

```graphql
query {
  allDatas {
    nodes {
      geomPoint {
        geojson
        srid
        x
        y
      }
    }
  }
}
```

In **mutations** `geom_point` is represented as type `GeoJSON`. Example:

```graphql
mutation ($id: UUID!, $geomPoint: GeoJSON!) {
  updateDataById(
    input: {
      id: $id,
      dataPatch: {
        geomPoint: $geomPoint
      }
    }
  ) { ... }
}
```

with these variables:

```json
{
  "id": "0116254a-0146-11ea-8418-4f89d6596247",
  "geomPoint": {
    "type": "Point",
    "coordinates": [8.5, 47.5]
  }
}
```

Beware of the fact that since 2016 the `GeoJSON` spec expects the coordinates to be of SRID 4326/WGS84 (see https://tools.ietf.org/html/rfc7946#section-4). So adding a `crs` field to the GeoJSON is deprecated. Thus since v3 PostGIS will be happy to receive above GeoJSON.

**In earlier versions PostGIS expects a SRID to be passed**. So the variables would be:

```json
{
  "id": "0116254a-0146-11ea-8418-4f89d6596247",
  "geomPoint": {
    "type": "Point",
    "coordinates": [8.5, 47.5],
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:EPSG::4326"
      }
    }
  }
}
```

## Development

Contributions are extremely welcome! To get started, clone down this repo and then:

```
createdb graphile_test
export TEST_DATABASE_URL=postgres://localhost:5432/graphile_test
yarn
yarn dev
```

Note the development server runs at http://localhost:5123/graphiql

To run the tests:

```
yarn test
```
