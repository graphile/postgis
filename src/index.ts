import { Plugin } from "graphile-build";
import PostgisInflectionPlugin from "./PostgisInflectionPlugin";
import PostgisExtensionDetectionPlugin from "./PostgisExtensionDetectionPlugin";
import PostgisRegisterTypesPlugin from "./PostgisRegisterTypesPlugin";
import PostgisPointLatitudeLongitudePlugin from "./PostgisPointLatitudeLongitudePlugin";
import PostgisGeometryCollectionGeometriesPlugin from "./PostgisGeometryCollectionGeometriesPlugin";

// We only currently support SRID 4326 (WGS 84 long lat)

const PostgisPlugin: Plugin = async (builder, options) => {
  await PostgisInflectionPlugin(builder, options);
  await PostgisExtensionDetectionPlugin(builder, options);
  await PostgisRegisterTypesPlugin(builder, options);

  // Enhancing the `Point` type:
  await PostgisPointLatitudeLongitudePlugin(builder, options);

  // Enhancing the `GeometryCollection` type:
  await PostgisGeometryCollectionGeometriesPlugin(builder, options);
};
export default PostgisPlugin;
