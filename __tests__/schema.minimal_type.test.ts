import * as pg from "pg";
import { withPgPool } from "./helpers";
import PostgisPlugin from "../src/index";
import { lexicographicSortSchema } from "graphql";
import { makePgService } from "postgraphile/adaptors/pg";
import { makeSchema } from "graphile-build";

const schemas = ["graphile_postgis_minimal_type"];

test("prints a schema with this plugin", () =>
  withPgPool(async (pool: pg.Pool) => {
    const gqlSchema = await makeSchema({
      extends: [PostgisPlugin],
      pgServices: [
        makePgService({
          pool,
          schemas,
        }),
      ],
    }).then(it => it.schema);
    expect(lexicographicSortSchema(gqlSchema)).toMatchSnapshot();
  }));
