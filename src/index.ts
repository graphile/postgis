import { Plugin } from "graphile-build";
import PostgisInflectionPlugin from "./PostgisInflectionPlugin";
import PostgisExtensionDetectionPlugin from "./PostgisExtensionDetectionPlugin";
import PostgisRegisterTypesPlugin from "./PostgisRegisterTypesPlugin";
import Postgis_Point_LatitudeLongitudePlugin from "./Postgis_Point_LatitudeLongitudePlugin";
import Postgis_GeometryCollection_GeometriesPlugin from "./Postgis_GeometryCollection_GeometriesPlugin";
import Postgis_LineString_CoordinatesPlugin from "./Postgis_LineString_CoordinatesPlugin";

// We only currently support SRID 4326 (WGS 84 long lat)

const PostgisPlugin: Plugin = async (builder, options) => {
  await PostgisInflectionPlugin(builder, options);
  await PostgisExtensionDetectionPlugin(builder, options);
  await PostgisRegisterTypesPlugin(builder, options);

  // Enhancing the `Point` type:
  await Postgis_Point_LatitudeLongitudePlugin(builder, options);

  // Enhancing the `GeometryCollection` type:
  await Postgis_GeometryCollection_GeometriesPlugin(builder, options);

  // Enhancing the `LineString` type:
  await Postgis_LineString_CoordinatesPlugin(builder, options);
};
export default PostgisPlugin;
