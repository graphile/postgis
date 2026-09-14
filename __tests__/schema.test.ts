import * as pg from "pg";
import { withPgPool, makePostGraphileSchema } from "./helpers";
import { lexicographicSortSchema } from "postgraphile/graphql";

const schemas = ["graphile_postgis"];

test("prints a schema with this plugin", () =>
  withPgPool(async (pool: pg.Pool) => {
    const { schema } = await makePostGraphileSchema(pool, schemas);
    expect(lexicographicSortSchema(schema)).toMatchSnapshot();
  }));
