import * as pg from "pg";
import { makePostGraphileSchema, withPgPool } from "./helpers";
import { lexicographicSortSchema } from "graphql";

const schemas = ["graphile_postgis_minimal_dimensional"];

test("prints a schema with this plugin", () =>
  withPgPool(async (pool: pg.Pool) => {
    const { schema } = await makePostGraphileSchema(pool, schemas);
    expect(lexicographicSortSchema(schema)).toMatchSnapshot();
  }));
