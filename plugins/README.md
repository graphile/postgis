# Plugins

This directory contains the plugins used to add PostGIS support to Graphile
Build. Ideally, we should find meaningful separations between features,
and put each feature in plugin, rather than putting all the code into one
massive plugin.

Right now we only have one plugin: `GeographyPointPlugin`. It doesn't actually
work yet, but may be a good starting point for learning how Graphile works.

## Install and Run

In order to use this project, first make sure that you have
[Postgraphile](https://www.graphile.org/postgraphile/) installed and running
correctly. You will also need a PostgreSQL database that Postgraphile
can access.

To run Postgraphile normally, you run `postgraphile` on the command line
and pass it a reference to the schema with the tables for your API:

```
postgraphile --schema <my-schema>
```

To try running [Postgraphile](https://www.graphile.org/postgraphile/) with
this plugin, first clone this repository onto your computer. Then `cd` into
the `plugins` directory, and run:

```
postgraphile --schema <my-schema> --append-plugins `pwd`/GeographyPointPlugin.js
```

## Node Debugging

**This project does not work yet!** Right now, this is more of a collaborative
research project than a product. You should [read the Node.js documentation
for how to use a debugger](https://nodejs.org/en/docs/inspector/) before
getting started with this project.

## Database debugging

If you want to use PostGIS data types, you have to activate the PostGIS
extension. Run `psql`, then run:

```
CREATE EXTENSION IF NOT EXISTS postgis;
```

You'll also want to make your own schema for your database tables, but
the PostGIS functions are defined in the `public` schema, which is the
default one. In order to make it work, you need to tell Postgres to check
_your_ schema first, and the `public` schema as a fallback if it can't find
the function you're referring to in _your_ schema. Use the
[SET](https://www.postgresql.org/docs/current/static/sql-set.html)
command to do that:

```
SET search_path TO my_schema, public;
```
