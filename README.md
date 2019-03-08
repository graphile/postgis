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
- [ ] Read-only support for a list of points (`longitude` and `latitude`) on
      `geography(LINESTRING)` and `geography(POLYGON)` columns
- [ ] Read-only support for computed attributes on
      `geography(LINESTRING)` and `geography(POLYGON)`, such as `area`,
      `length`, `perimeter`, and `centroid`
- [ ] Create/update/delete support for `geography(POINT)` columns
- [ ] Create/update/delete support for `geography(LINESTRING)` and
      `geography(POLYGON)` columns
- [ ] Integration with `postgraphile-plugin-connection-filter` to enable PostGIS specific filtering

There are many, many other features that this plugin could support - if you
have specific needs please get in touch!

## Usage

This plugin requires PostGraphile **v4.4.0-beta.3** or higher to function correctly.

Add PostGIS to your database:

```sql
CREATE EXTENSION IF NOT EXISTS postgis USING SCHEMA public;
```

Load the plugin:

```
postgraphile --append-plugins @graphile/postgis
```
