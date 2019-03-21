import * as pg from "pg";
import { parse, buildASTSchema, GraphQLSchema } from "graphql";
const { printSchema } = require("graphql/utilities");

export async function withPgPool<T = any>(
  cb: (pool: pg.Pool) => Promise<T>
): Promise<T> {
  const pool = new pg.Pool({
    connectionString: "graphile_test",
  });
  try {
    return await cb(pool);
  } finally {
    pool.end();
  }
}

export async function withPgClient<T = any>(
  cb: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  return withPgPool(async pool => {
    const client = await pool.connect();
    try {
      return await cb(client);
    } finally {
      client.release();
    }
  });
}

export async function withTransaction<T = any>(
  cb: (client: pg.PoolClient) => Promise<T>,
  closeCommand = "rollback"
): Promise<T> {
  return withPgClient(async client => {
    await client.query("begin");
    try {
      return await cb(client);
    } finally {
      await client.query(closeCommand);
    }
  });
}

export function printSchemaOrdered(originalSchema: GraphQLSchema) {
  // Clone schema so we don't damage anything
  const schema = buildASTSchema(parse(printSchema(originalSchema)));

  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach(name => {
    const gqlType = typeMap[name] as any;

    // Object?
    if (gqlType.getFields) {
      const fields = gqlType.getFields();
      const keys = Object.keys(fields).sort();
      keys.forEach(key => {
        const value = fields[key];

        // Move the key to the end of the object
        delete fields[key];
        fields[key] = value;

        // Sort args
        if (value.args) {
          value.args.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
      });
    }

    // Enum?
    if (gqlType.getValues) {
      gqlType
        .getValues()
        .sort((a: any, b: any) => a.name.localeCompare(b.name));
    }
  });

  return printSchema(schema);
}
