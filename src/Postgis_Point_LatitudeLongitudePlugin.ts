import { Plugin } from "graphile-build";
import { GIS_SUBTYPE } from "./constants";

const plugin: Plugin = builder => {
  builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
    const {
      scope: { isPgGISGeographyType, pgGISType, pgGISTypeDetails },
    } = context;
    if (
      !isPgGISGeographyType ||
      !pgGISTypeDetails ||
      pgGISTypeDetails.subtype !== GIS_SUBTYPE.Point
    ) {
      return fields;
    }
    const {
      extend,
      graphql: { GraphQLNonNull, GraphQLFloat },
      inflection,
    } = build;
    const xFieldName = inflection.gisXFieldName(
      pgGISType,
      pgGISTypeDetails.srid
    );
    const yFieldName = inflection.gisYFieldName(
      pgGISType,
      pgGISTypeDetails.srid
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
