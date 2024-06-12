import * as pg from "pg";
import { withPgPool } from "./helpers";
import PostgisPreset from "../src/index";
import { lexicographicSortSchema } from "graphql";
import { makeSchema } from "graphile-build";
import { makePgService } from "postgraphile/adaptors/pg";

const schemas = ["graphile_postgis"];

test("prints a schema with this plugin", () =>
  withPgPool(async (pool: pg.Pool) => {
    const gqlSchema = await makeSchema({
      extends: [PostgisPreset],
      pgServices: [
        makePgService({
          pool,
          schemas,
        }),
      ],
    }).then(it => it.schema);
    expect(lexicographicSortSchema(gqlSchema)).toMatchSnapshot();
  }));
