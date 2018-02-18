# Graphile-Build Notes

This is a disorganized set of notes that I made while trying to understand
how Graphile-Build works. It may help you understand how to continue building
this project. As you deepen your understanding of Graphile-Build, please
add to these notes, or make pull requests to the official documentation!

----

`builder` argument is a SchemaBuilder: `graphile-build/src/SchemaBuilder.js`.
All possible hooks are documented there.

Default plugin list is in `graphile-build-pg/src/index.js`
This plugin should ideally be defined after
`graphile-build-pg/src/plugins/PgTypesPlugin.js`,
which uses the "build" hook but comment says it should use the "init" hook instead?

"build"/"init" hook: define a mapping from Postgres data types to GraphQL data types
"GraphQLObjectType:fields" hook: look up columns in database, use that mapping to convert to GraphQL data types

for debugging -- investigate Postgres data types at "GraphQLObjectType:fields" time?

https://github.com/postgraphql/postgraphql/issues/575

`pg_attribute` table contains information about all columns of all tables:
https://www.postgresql.org/docs/current/static/catalog-pg-attribute.html

`pg_type` table contains information about all possible column types:
https://www.postgresql.org/docs/current/static/catalog-pg-type.html

The massive introspection query uses these tables:
`graphile-build-pg/res/introspection-query.sql`
It investigates the database to figure out what's inside!

Looks like Geography type is 17033, but how do we distinguish between
`geography(POINT)`, `geography(POLYGON)`, etc?

Introspection query: `graphile-build-pg/res/introspection-query.sql`
