import * as pg from "pg";
import { withPgClient } from "./helpers";
import { createPostGraphileSchema } from "postgraphile-core";
import PostgisPlugin from "../src/index";
import { lexicographicSortSchema } from "graphql";

const schemas = ["graphile_postgis_minimal_dimensional"];
const options = {
  appendPlugins: [PostgisPlugin],
};

test("prints a schema with this plugin", () =>
  withPgClient(async (client: pg.PoolClient) => {
    const gqlSchema = await createPostGraphileSchema(client, schemas, options);
    expect(lexicographicSortSchema(gqlSchema)).toMatchSnapshot();
  }));
