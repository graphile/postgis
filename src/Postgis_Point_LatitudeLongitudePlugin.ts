import { Plugin } from "graphile-build";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const { inflection } = build;
    const {
      scope: { isPgGISGeographyType, pgGISType, pgGISSubtypeDetails },
    } = context;
    if (!isPgGISGeographyType || pgGISSubtypeDetails.subtype !== 1) {
      return fields;
    }
    const {
      extend,
      graphql: { GraphQLNonNull, GraphQLFloat },
    } = build;
    const xFieldName = inflection.gisXFieldName(
      pgGISType,
      pgGISSubtypeDetails.srid
    );
    const yFieldName = inflection.gisYFieldName(
      pgGISType,
      pgGISSubtypeDetails.srid
    );
    return extend(fields, {
      [xFieldName]: {
        type: new GraphQLNonNull(GraphQLFloat),
        resolve(data: any) {
          return data.__geojson.coordinates[0];
        },
      },
      [yFieldName]: {
        type: new GraphQLNonNull(GraphQLFloat),
        resolve(data: any) {
          return data.__geojson.coordinates[1];
        },
      },
    });
  });
};
export default plugin;
