import { Plugin } from "graphile-build";

const PostgisPointLatitudeLongitudePlugin: Plugin = builder => {
  builder.hook(
    "GraphQLObjectType:fields",
    function AddLatitudeAndLongitudeToPointType(fields, build, context) {
      const {
        scope: { isPgGISGeographyType, pgGISSubtype },
      } = context;
      if (!isPgGISGeographyType || pgGISSubtype !== 1) {
        return fields;
      }
      const {
        extend,
        graphql: { GraphQLNonNull, GraphQLFloat },
      } = build;
      return extend(fields, {
        longitude: {
          type: new GraphQLNonNull(GraphQLFloat),
          resolve(data: any) {
            return data.__geojson.coordinates[0];
          },
        },
        latitude: {
          type: new GraphQLNonNull(GraphQLFloat),
          resolve(data: any) {
            return data.__geojson.coordinates[1];
          },
        },
      });
    }
  );
};
export default PostgisPointLatitudeLongitudePlugin;
