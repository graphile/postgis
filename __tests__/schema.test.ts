import * as pg from "pg";
import { withPgClient, printSchemaOrdered } from "./helpers";
import { createPostGraphileSchema } from "postgraphile-core";
import PostgisPlugin from "../src/index";

const schemas = ["graphile_postgis"];
const options = {
  appendPlugins: [PostgisPlugin],
};

test("prints a schema with this plugin", () =>
  withPgClient(async (client: pg.PoolClient) => {
    const schema = await createPostGraphileSchema(client, schemas, options);
    expect(printSchemaOrdered(schema)).toMatchSnapshot();
  }));
