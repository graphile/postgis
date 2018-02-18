const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLEnumType,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLScalarType,
  isInputType,
  getNamedType
} = require("graphql");

const nullableIf = (GraphQLNonNull, condition, Type) =>
  condition ? Type : new GraphQLNonNull(Type);

const Point = new GraphQLObjectType({
  name: "GeographyPoint",
  fields: {
    longitude: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    latitude: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  }
});

const PointInput = new GraphQLInputObjectType({
  name: "GeographyPointInput",
  fields: {
    longitude: {
      type: new GraphQLNonNull(GraphQLFloat)
    },
    latitude: {
      type: new GraphQLNonNull(GraphQLFloat)
    }
  }
});

// select oid, typname, typarray, typcategory, typtype from pg_catalog.pg_type where typtype = 'b' order by oid;
const GEOGRAPHY_TYPE_ID = 17033;

const GeographyPointPlugin = function GeographyPointPlugin(
  builder,
  { pgInflection: inflection }
) {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      extend,
      pgGetGqlTypeByTypeId,
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      pgSql: sql,
      pg2gql,
      graphql: { GraphQLString, GraphQLNonNull },
      getAliasFromResolveInfo,
      pgTweakFragmentForType,
      pgColumnFilter
    } = build;
    const {
      scope: { isPgRowType, isPgCompoundType, pgIntrospection: table },
      fieldWithHooks,
      Self
    } = context;
    if (
      !(isPgRowType || isPgCompoundType) ||
      !table ||
      table.kind !== "class"
    ) {
      // Copied from `PgColumnsPlugin`
      // Skip anything that isn't a table
      return fields;
    }

    const geographyColumns = introspectionResultsByKind.attribute
      .filter(attr => attr.classId === table.id)
      .filter(attr => parseInt(attr.typeId) === GEOGRAPHY_TYPE_ID);

    if (geographyColumns.length === 0) {
      // Skip any tables that don't have any geography columns
      return fields;
    }

    const geographyFields = geographyColumns
      .filter(attr => pgColumnFilter(attr, build, context))
      .reduce((memo, attr) => {
        // A lot of this is also copied from `PgColumnsPlugin`
        const fieldName = inflection.column(
          attr.name,
          table.name,
          table.namespaceName
        );
        if (memo[fieldName]) {
          throw new Error(
            `Two columns produce the same GraphQL field name '${fieldName}' on class '${
              table.namespaceName
            }.${table.name}'; one of them is '${attr.name}'`
          );
        }
        memo[fieldName] = fieldWithHooks(
          fieldName,
          ({ getDataFromParsedResolveInfoFragment, addDataGenerator }) => {
            const ReturnType = Point;
            addDataGenerator(parsedResolveInfoFragment => {
              // `parsedResolveInfoFragment` has information about what info
              // the client requested, such as `latitude` and `longitude`
              const { alias } = parsedResolveInfoFragment;
              return {
                pgQuery: queryBuilder => {
                  // geography types not not compound types, but they need
                  // to be treated like complex types, so I need to dive into
                  // the `type.type === "c"` section of this code...
                  const getSelectValueForFieldAndType = (sqlFullName, type) => {
                    debugger;
                    if (type.type === "c") {
                      const resolveData = getDataFromParsedResolveInfoFragment(
                        parsedResolveInfoFragment,
                        ReturnType
                      );
                      const jsonBuildObject = queryFromResolveData(
                        sql.identifier(Symbol()), // Ignore!
                        sqlFullName,
                        resolveData,
                        { onlyJsonField: true, addNullCase: true }
                      );
                      return jsonBuildObject;
                    } else {
                      return pgTweakFragmentForType(sqlFullName, type);
                    }
                  };
                  queryBuilder.select(
                    getSelectValueForFieldAndType(
                      sql.fragment`(${queryBuilder.getTableAlias()}.${sql.identifier(
                        attr.name
                      )})`, // The brackets are necessary to stop the parser getting confused, ref: https://www.postgresql.org/docs/9.6/static/rowtypes.html#ROWTYPES-ACCESSING
                      attr.type
                    ),
                    alias
                  );
                }
              };
            });
            return {
              description: attr.description,
              type: nullableIf(
                GraphQLNonNull,
                !attr.isNotNull && !attr.type.domainIsNotNull,
                ReturnType
              ),
              resolve: (data, _args, _context, resolveInfo) => {
                const alias = getAliasFromResolveInfo(resolveInfo);
                debugger;
                return pg2gql(data[alias], attr.type);
              }
            };
          },
          { pgFieldIntrospection: attr }
        );
        return memo;
      }, {});
    // `PgColumnsPlugin` uses the `extend` function, which is designed to
    // throw an error if we overwrite existing fields. By the time this
    // plugin runs, geometry columns will already be in the existing fields
    // as string types, so we *want* to overwrite existing fields.
    // As a result, we use `Object.assign` instead of `extend`.
    return Object.assign({}, fields, geographyFields);
  });
};

exports.default = GeographyPointPlugin;
