import * as fs from "fs";
import * as path from "path";
import * as pg from "pg";
import { promisify } from "util";
import { GraphQLSchema, graphql } from "graphql";
import { withPgClient } from "../helpers";
import { createPostGraphileSchema } from "postgraphile-core";
import PostgisPlugin from "../../src/index";

const readFile = promisify(fs.readFile);

const queriesDir = `${__dirname}/../fixtures/queries`;
const queryFileNames = fs.readdirSync(queriesDir);

const schemas = ["graphile_postgis"];
const options = {
  appendPlugins: [PostgisPlugin],
};

let gqlSchema: GraphQLSchema;

beforeAll(async () => {
  await withPgClient(async (client: pg.PoolClient) => {
    gqlSchema = await createPostGraphileSchema(client, schemas, options);
  });
});

for (const queryFileName of queryFileNames) {
  test(queryFileName, async () => {
    const query = await readFile(
      path.resolve(queriesDir, queryFileName),
      "utf8"
    );
    const result = await withPgClient(async (client: pg.PoolClient) =>
      graphql(gqlSchema, query, null, { pgClient: client })
    );
    expect(result).toMatchSnapshot();
  });
}
