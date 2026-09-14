import type {} from "postgraphile";

import { PostgisVersionPlugin } from "./PostgisVersionPlugin.ts";
import { PostgisInflectionPlugin } from "./PostgisInflectionPlugin.ts";
import { PostgisExtensionDetectionPlugin } from "./PostgisExtensionDetectionPlugin.ts";
import { PostgisRegisterTypesPlugin } from "./PostgisRegisterTypesPlugin.ts";
import { Postgis_Point_LatitudeLongitudePlugin } from "./Postgis_Point_LatitudeLongitudePlugin.ts";
import { Postgis_GeometryCollection_GeometriesPlugin } from "./Postgis_GeometryCollection_GeometriesPlugin.ts";
import { Postgis_LineString_PointsPlugin } from "./Postgis_LineString_PointsPlugin.ts";
import { Postgis_Polygon_RingsPlugin } from "./Postgis_Polygon_RingsPlugin.ts";
import { Postgis_MultiPoint_PointsPlugin } from "./Postgis_MultiPoint_PointsPlugin.ts";
import { Postgis_MultiLineString_LineStringsPlugin } from "./Postgis_MultiLineString_LineStringsPlugin.ts";
import { Postgis_MultiPolygon_PolygonsPlugin } from "./Postgis_MultiPolygon_PolygonsPlugin.ts";

const PostgisPreset: GraphileConfig.Preset = {
  plugins: [
    PostgisVersionPlugin,
    PostgisInflectionPlugin,
    PostgisExtensionDetectionPlugin,
    PostgisRegisterTypesPlugin,

    Postgis_Point_LatitudeLongitudePlugin,
    Postgis_LineString_PointsPlugin,
    Postgis_Polygon_RingsPlugin,
    Postgis_MultiPoint_PointsPlugin,
    Postgis_MultiLineString_LineStringsPlugin,
    Postgis_MultiPolygon_PolygonsPlugin,
    Postgis_GeometryCollection_GeometriesPlugin,
  ],
};

export default PostgisPreset;

export {
  PostgisVersionPlugin,
  PostgisInflectionPlugin,
  PostgisExtensionDetectionPlugin,
  PostgisRegisterTypesPlugin,
  Postgis_Point_LatitudeLongitudePlugin,
  Postgis_LineString_PointsPlugin,
  Postgis_Polygon_RingsPlugin,
  Postgis_MultiPoint_PointsPlugin,
  Postgis_MultiLineString_LineStringsPlugin,
  Postgis_MultiPolygon_PolygonsPlugin,
  Postgis_GeometryCollection_GeometriesPlugin,
  PostgisPreset,
};

export type {
  Subtype,
  GISTypeDetails,
  GeoJSONCoordinates,
  GeoJSONGeometry,
  PostGISResolvedData,
  GISTypeInflectionDetails,
  GISInterfaceInflectionDetails,
  GISDimensionInterfaceInflectionDetails,
  GISFieldInflectionDetails,
} from "./types.ts";

declare global {
  namespace GraphileConfig {
    interface Plugins {
      PostgisVersionPlugin: true;
      PostgisInflectionPlugin: true;
      PostgisExtensionDetectionPlugin: true;
      PostgisRegisterTypesPlugin: true;
      Postgis_Point_LatitudeLongitudePlugin: true;
      Postgis_LineString_PointsPlugin: true;
      Postgis_Polygon_RingsPlugin: true;
      Postgis_MultiPoint_PointsPlugin: true;
      Postgis_MultiLineString_LineStringsPlugin: true;
      Postgis_MultiPolygon_PolygonsPlugin: true;
      Postgis_GeometryCollection_GeometriesPlugin: true;
    }
  }
}
