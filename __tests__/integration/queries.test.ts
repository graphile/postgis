import * as fs from "fs";
import * as path from "path";
import * as pg from "pg";
import { promisify } from "util";
import { GraphQLSchema, graphql } from "graphql";
import { withPgClient, withPgPool } from "../helpers";
import PostgisPlugin from "../../src/index";
import { makeSchema } from "graphile-build";
import { makePgService } from "postgraphile/adaptors/pg";

const readFile = promisify(fs.readFile);

const queriesDir = `${__dirname}/../fixtures/queries`;
const queryFileNames = fs.readdirSync(queriesDir);

const schemas = ["graphile_postgis"];

let gqlSchema: GraphQLSchema;

beforeAll(async () => {
  await withPgPool(async (pool: pg.Pool) => {
    gqlSchema = await makeSchema({
      extends: [PostgisPlugin],
      pgServices: [
        makePgService({
          pool,
          schemas,
        }),
      ],
    }).then(it => it.schema);
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
