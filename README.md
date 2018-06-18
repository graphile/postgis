# graphile-build-postgis

This is a [Graphile Build](https://www.graphile.org/graphile-build/) plugin
that attempts to provide support for the popular [PostGIS](http://postgis.net/)
spatial database system. Once it's working, you should be able to create
a [PostgreSQL](https://www.postgresql.org/) database with PostGIS columns,
run [Postgraphile](https://www.graphile.org/postgraphile/), and have a fully
functional [GraphQL](http://graphql.org/) API for your database.

## Not Yet Working

This project does not work yet. This repository currently exists as place for
interested developers to work on this project together, and learn from each
other. We hope to put together a minimal plugin that provides _some_
functionality in the future, but a comprehensive solution is a _long_ way off.

# Roadmap

We can't build everything at once. Here is a short list of features that
we would like this plugin to support initially, roughly in priority order:

- [ ] Read-only support for `longitude` and `latitude` on `geography(POINT)`
      columns
- [ ] Create/update/delete support for `geography(POINT)` columns
- [ ] Read-only support for a list of points (`longitude` and `latitude`) on
      `geography(LINESTRING)` and `geography(POLYGON)` columns
- [ ] Read-only support for a `geojson` attribute on `geography(POINT)`,
      `geography(LINESTRING)`, and `geography(POLYGON)` columns
- [ ] Read-only support for computed attributes on
      `geography(LINESTRING)` and `geography(POLYGON)`, such as `area`,
      `length`, `perimeter`, and `centroid`
- [ ] Create/update/delete support for `geography(LINESTRING)` and
      `geography(POLYGON)` columns

There are many, many other features that this plugin could support. However,
these are the highest priority features.

# Desired API

These are some example of the API we would like to build.
Note that **these examples do not yet work!** They are only designs of what
we want to build in the future.

## Points

SQL DDL
```sql
CREATE TABLE point_of_interest (
  id        serial primary key,
  name      text not null,
  location  geography(point, 4326) not null
);
```

GraphQL Query
```graphql
query {
  allPointsOfInterest {
    edges {
      node {
        name
        location {
          longitude
          latitude
        }
      }
    }
  }
}
```

Query Result
```json
{
  "allPointsOfInterest": {
    "edges": [
      {
        "node": {
          "name": "Eiffel Tower",
          "location": {
            "longitude": 48.8583701,
            "latitude": 2.2922873
          }
        }
      }
    ]
  }
}
```

GraphQL Mutation
```graphql
mutation {
  createPointOfInterest(input: {
    name: "Great Pyramid at Giza",
    location: {
      longitude: 29.9792345,
      latitude: 31.1320079
    }
  }) {
    id
  }
}
```

## Polygons

SQL DDL (requires PostGIS, e.g. `brew install postgis`)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE country (
  id        serial primary key,
  name      text not null,
  location  geography(polygon, 4326) not null
);
```


GraphQL Query
```graphql
query {
  allCountries {
    edges {
      node {
        name
        location {
          area
          centroid {
            longitude
            latitude
          }
          points {
            totalCount
            edges {
              node {
                longitude
                latitude
              }
            }
          }
        }
      }
    }
  }
}
```

Query Result
```json
{
  "allCountries": {
    "edges": [
      {
        "node": {
          "name": "Germany",
          "location": {
            "area": 357168,
            "centroid": {
              "longitude": 51.0894739,
              "latitude": 5.9566569
            },
            "points": {
              "totalCount": 592,
              "edges": [
                {
                  "node": {
                    "longitude": 53.243552,
                    "latitude": 7.208890
                  }
                },
                {
                  "node": {
                    "longitude": 53.248821,
                    "latitude": 7.219040
                  }
                },
                ...
              ]
            }
          }
        }
      }
    ]
  }
}
```
