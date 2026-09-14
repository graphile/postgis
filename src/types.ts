/**
 * PostGIS geometry/geography subtype enumeration
 * 0 = Geometry (generic)
 * 1 = Point
 * 2 = LineString
 * 3 = Polygon
 * 4 = MultiPoint
 * 5 = MultiLineString
 * 6 = MultiPolygon
 * 7 = GeometryCollection
 */
export type Subtype = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Detailed type information extracted from PostGIS type modifier
 */
export interface GISTypeDetails {
  subtype: Subtype;
  hasZ: boolean;
  hasM: boolean;
  srid: number;
}

/**
 * GeoJSON coordinate array (recursive for nested geometries)
 */
export type GeoJSONCoordinates = number[] | GeoJSONCoordinates[];

/**
 * GeoJSON geometry object structure
 */
export interface GeoJSONGeometry {
  type: string;
  coordinates?: GeoJSONCoordinates;
  geometries?: GeoJSONGeometry[];
}

/**
 * Internal representation of PostGIS geometry/geography data
 * Attached to resolved field values
 */
export interface PostGISResolvedData {
  __gisType: string;
  __srid: number;
  __geojson: GeoJSONGeometry;
}

/**
 * Base inflection context shared by all GIS inflectors
 */
export interface BaseGISInflectionDetails {
  typeName: string;
  scope?: GraphileBuild.ScopeObject | GraphileBuild.ScopeInterface;
}

/**
 * Inflection context for GIS type naming
 */
export interface GISTypeInflectionDetails extends BaseGISInflectionDetails {
  subtype: Subtype;
  hasZ: boolean;
  hasM: boolean;
}

/**
 * Inflection context for GIS interface naming
 */
export type GISInterfaceInflectionDetails = Pick<
  BaseGISInflectionDetails,
  "typeName"
>;

/**
 * Inflection context for GIS dimension interface naming
 */
export interface GISDimensionInterfaceInflectionDetails extends Pick<
  BaseGISInflectionDetails,
  "typeName"
> {
  hasZ: boolean;
  hasM: boolean;
}

/**
 * Inflection context for GIS field naming (x/y/z)
 */
export type GISFieldInflectionDetails = BaseGISInflectionDetails;

/**
 * Inflection context for naming a codec that's specific to a PostGIS type
 * modifier (never surfaced in the schema; only needs to be unique)
 */
export interface GISModifiedCodecInflectionDetails {
  baseCodecName: string;
  typeModifier: number;
}

/**
 * Type-safe registry of constructed GraphQL types by codec and subtype
 */
export interface TypeRegistry {
  [codecName: string]: {
    [gisTypeKey: string]: string; // Type name
  };
}

/**
 * Type-safe registry of GraphQL interfaces by codec and zmflag
 */
export interface InterfaceRegistry {
  [codecName: string]: {
    [zmflag: number]: string; // Interface name
  };
}

declare global {
  namespace GraphileBuild {
    interface ScopeObject {
      isPgGISType?: boolean;
      pgGISTypeName?: string;
      pgGISTypeDetails?: GISTypeDetails;
    }

    interface Build {
      /**
       * Get PostGIS GraphQL type name by geometry properties
       */
      getPostgisTypeByGeometryType(
        codecName: string,
        subtype: Subtype,
        hasZ?: boolean,
        hasM?: boolean,
        srid?: number
      ): string | undefined;

      /**
       * Registry of PostGIS type names by codec and subtype
       */
      pgGISGraphQLTypesByTypeAndSubtype: TypeRegistry;

      /**
       * Registry of PostGIS interface names by codec and zmflag
       */
      pgGISGraphQLInterfaceTypesByType: InterfaceRegistry;

      /**
       * List of type names to include in the schema
       */
      pgGISIncludedTypes: string[];

      /**
       * Add a type to the inclusion list
       */
      pgGISIncludeType(typeName: string): void;
    }

    interface Inflection {
      gisType(this: Inflection, details: GISTypeInflectionDetails): string;

      gisInterfaceName(
        this: Inflection,
        details: GISInterfaceInflectionDetails
      ): string;

      gisDimensionInterfaceName(
        this: Inflection,
        details: GISDimensionInterfaceInflectionDetails
      ): string;

      geojsonFieldName(this: Inflection): string;

      gisXFieldName(
        this: Inflection,
        details: GISFieldInflectionDetails
      ): string;

      gisYFieldName(
        this: Inflection,
        details: GISFieldInflectionDetails
      ): string;

      gisZFieldName(
        this: Inflection,
        details: GISFieldInflectionDetails
      ): string;

      pgGISModifiedCodecName(
        this: Inflection,
        details: GISModifiedCodecInflectionDetails
      ): string;
    }
  }
}
