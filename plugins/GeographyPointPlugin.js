const debug = require("debug")("graphile-build-postgis");

// We only currently support SRID 4326 (WGS 84 long lat)

/*
 *
 * NOTES:
 *
 *   atttypmod: 1107460
 *   (1107460 >> 8) & (2 ** 16 - 1): 4326
 *   (atttypmod && 255) >> 2: 1
 *   geography(point)
 *   geography(point, 4326)
 *
 *   1 - point
 *   2 - linestr
 *   3 - polygon
 *   4 - multipoint
 *   5 - multilinestr
 *   6 - multipolygon
 *   7 - geometrycollection
 *
 */

const TYPE_LOOKUP = {
  1: "point",
  2: "linestring",
  3: "polygon",
  4: "multipoint",
  5: "multilinestring",
  6: "multipolygon",
  7: "geometry-collection",
};

const subtypeByPgGeometryType = {
  POINT: 1,
  LINESTR: 2,
  POLYGON: 3,
  MULTIPOINT: 4,
  MULTILINESTR: 5,
  MULTIPOLYGON: 6,
  GEOMETRYCOLLECTION: 7,
};

const subtypeByGeojsonType = {
  'Point': 1,
  'LineString': 2,
  'Polygon': 3,
  'MultiPoint': 4,
  'MultiLinestr': 5,
  'MultiPolygon': 6,
  'GeometryCollection': 7,
}

const getSubtypeAndSridFromModifier = (isGeography, modifier) => {
  const ALL_ZEROES_HOPEFULLY = modifier >> 24;
  if (ALL_ZEROES_HOPEFULLY !== 0) {
    throw new Error("Unsupported PostGIS modifier");
  }
  const SRID = (modifier >> 8) & (2 ** 16 - 1);
  if (isGeography && (SRID !== 4326 && SRID !== 0)) {
    throw new Error(
      `We only support SRID 4326 currently, saw something with SRID '${SRID}'`
    );
  }
  if (!isGeography && SRID !== 0) {
    throw new Error("Unexepected SRID with geometry type");
  }
  const SUBTYPE = (modifier & 255) >> 2;
  if (SUBTYPE > 7 || SUBTYPE < 0) {
    throw new Error(
      `Unsupported PostGIS modifier, expected 0-7, received ${SUBTYPE} (${modifier})`
    );
  }
  const IS_XYM = modifier & 1;
  return {
    srid: SRID,
    isXym: IS_XYM,
    subtype: SUBTYPE,
    subtypeString: TYPE_LOOKUP[SUBTYPE],
  };
};

const GeographyPointPlugin = function GeographyPointPlugin(builder) {
  builder.hook("inflection", inflection => {
    return {
      ...inflection,
      gisType(type, subtype) {
        return this.upperCamelCase(`${type.name}-${TYPE_LOOKUP[subtype]}`);
      },
      gisInterfaceName(type) {
        return this.upperCamelCase(`${type.name}-interface`);
      }
      geojsonFieldName() {
        return `geojson`;
      },
    };
  });
  builder.hook("build", build => {
    const {
      pgIntrospectionResultsByKind: introspectionResultsByKind,
    } = build;
    const POSTGIS = introspectionResultsByKind.extension.find(
      e => e.name === "postgis"
    );
    // Check we have the postgis extension
    if (!POSTGIS) {
      debug("PostGIS extension not found in database; skipping");
      return build;
    }
    // Extract the geography and geometry types
    const GEOMETRY_TYPE = introspectionResultsByKind.type.find(
      t => t.name === "geometry" && t.namespaceId === POSTGIS.namespaceId
    );
    const GEOGRAPHY_TYPE = introspectionResultsByKind.type.find(
      t => t.name === "geography" && t.namespaceId === POSTGIS.namespaceId
    );
    if (!GEOGRAPHY_TYPE || !GEOMETRY_TYPE) {
      throw new Error(
        "PostGIS is installed, but we couldn't find the geometry/geography types!"
      );
    }
    return build.extend(build, {
      pgGISGraphQLTypesByTypeAndSubtype: {},
      pgGISGraphQLInterfaceTypesByType: {},
      pgGISGeometryType: GEOMETRY_TYPE,
      pgGISGeographyType: GEOGRAPHY_TYPE,
      pgGISExtension: POSTGIS,
    });
  });
  builder.hook("init", (_, build) => {
    const {
      newWithHooks,
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      graphql: {
        GraphQLNonNull,
        GraphQLFloat,
        GraphQLObjectType,
        GraphQLInputObjectType,
        GraphQLInterfaceType,
      },
      pgRegisterGqlTypeByTypeId,
      pgRegisterGqlInputTypeByTypeId,
      pgTweaksByTypeIdAndModifer,
      getTypeByName,
      pgSql: sql,
      pg2gql,
      inflection,
      pgGISGraphQLTypesByTypeAndSubtype: constructedTypes,
      pgGISGraphQLInterfaceTypesByType: _interfaces,
      pgGISGeometryType: GEOMETRY_TYPE,
      pgGISGeographyType: GEOGRAPHY_TYPE,
      pgGISExtension: POSTGIS,
    } = build;
    if (!GEOMETRY_TYPE || !GEOGRAPHY_TYPE) {
      return _;
    }
    debug("PostGIS plugin enabled");

    const GraphQLJSON = getTypeByName("JSON");
    const geojsonFieldName = inflection.geojsonFieldName();

    function getGisInterface(type) {
      if (!_interfaces[type.id]) {
        _interfaces[type.id] = newWithHooks(GraphQLInterfaceType, {
          name: inflection.gisInterfaceName(type),
          fields: {
            [geojsonFieldName]: {
              type: GraphQLJSON,
              description: "Converts the object to GeoJSON",
            },
          },
          resolveType(value, info) {
            const subtype = subtypeByPgGeometryType[value.__gisType];
            const Type = constructedTypes[type.id] && constructedTypes[type.id][subtype];
            return Type;
          },
          description: "All PostGIS geography types implement this interface",
        }, {
          isPgGISGeographyInterface: true,
        });
      }
      return _interfaces[type.id];
    }
    function getGisType(type, typeModifier) {
      const typeId = type.id;
      const { subtype, subtypeString } = getSubtypeAndSridFromModifier(
        true,
        typeModifier
      );
      debug(`Getting type ${typeModifier} / ${subtype} / ${subtypeString}`);
      if (!constructedTypes[type.id]) {
        constructedTypes[type.id] = {};
      }
      if (!constructedTypes[type.id][subtype]) {
        if (!pgTweaksByTypeIdAndModifer[typeId]) {
          pgTweaksByTypeIdAndModifer[typeId] = {};
        }
        const typeModifierKey = typeModifier != null ? typeModifier : -1;
        pgTweaksByTypeIdAndModifer[typeId][typeModifierKey] = (
          fragment,
          resolveData
        ) => {
          const params = [
            sql.literal("__gisType"),
            sql.fragment`${sql.identifier(
              POSTGIS.namespace.name,
              "geometrytype" // MUST be lowercase!
            )}(${fragment})`,
            sql.literal("__geojson"),
            sql.fragment`${sql.identifier(
              POSTGIS.namespace.name,
              "st_asgeojson" // MUST be lowercase!
            )}(${fragment})::JSON`,
          ];
          return sql.fragment`json_build_object(
            ${sql.join(params, ", ")}
          )`;
        };
        const jsonType = introspectionResultsByKind.type.find(
          t => t.name === "json" && t.namespaceName === "pg_catalog"
        );
        if (subtype === 0) {
          constructedTypes[type.id][subtype] = getGisInterface(type);
        } else {
          constructedTypes[type.id][subtype] = newWithHooks(
            GraphQLObjectType,
            {
              name: inflection.gisType(type, subtype),
              interfaces: [
                getGisInterface(type),
              ],
              fields: {
                [geojsonFieldName]: {
                  type: GraphQLJSON,
                  resolve: (data, _args, _context, _resolveInfo) => {
                    return pg2gql(data.__geojson, jsonType);
                  },
                },
              },
            },
            {
              isPgGISGeographyType: true,
              pgGISType: type,
              pgGISSubtype: subtype,
            }
          );
        }
      }
      return constructedTypes[type.id][subtype];
    }

    debug(`Registering handler for ${GEOGRAPHY_TYPE.id}`);
    pgRegisterGqlTypeByTypeId(GEOGRAPHY_TYPE.id, (_set, typeModifier) => {
      return getGisType(GEOGRAPHY_TYPE, typeModifier);
    });
    debug(`Registering handler for ${GEOMETRY_TYPE.id}`);
    pgRegisterGqlTypeByTypeId(GEOMETRY_TYPE.id, (_set, typeModifier) => {
      return getGisType(GEOMETRY_TYPE, typeModifier);
    });
    return _;
  });

  builder.hook('GraphQLObjectType:fields', function AddLatitudeAndLongitudeToPointType(fields, build, context) {
    const {
      scope: {
        isPgGISGeographyType,
        pgGISSubtype,
      }
    } = context;
    if (!isPgGISGeographyType || pgGISSubtype !== 1) {
      return fields;
    }
    const {
      extend,
      graphql: {
        GraphQLNonNull,
        GraphQLFloat,
      },
    } = build;
    return extend(fields, {
      longitude: {
        type: new GraphQLNonNull(GraphQLFloat),
        resolve(data) {
          return data.__geojson.coordinates[0];
        }
      },
      latitude: {
        type: new GraphQLNonNull(GraphQLFloat),
        resolve(data) {
          return data.__geojson.coordinates[1];
        }
      },
    });
  });

  builder.hook('GraphQLObjectType:fields', function AddGeometriesToGeometryCollection(fields, build, context) {
    const {
      scope: {
        isPgGISGeographyType,
        pgGISType,
        pgGISSubtype,
      }
    } = context;
    if (!isPgGISGeographyType || pgGISSubtype !== 7) {
      return fields;
    }
    const {
      extend,
      pgGISGraphQLInterfaceTypesByType,
      graphql: {
        GraphQLList,
      }
    } = build;
    const Interface = pgGISGraphQLInterfaceTypesByType[pgGISType.id];
    if (!Interface) {
      debug("Unexpectedly couldn't find the interface");
      return fields;
    }

    return extend(fields, {
      geometries: {
        type: new GraphQLList(Interface),
        resolve(data) {
          return data.__geojson.geometries.map(geom => {
            const subtype = subtypeByGeojsonType[geom.type];
            const pgGeometryType = Object.keys(subtypeByPgGeometryType).find(k => subtypeByPgGeometryType[k] === subtype);
            return {
              __gisType: pgGeometryType,
              __geojson: geom,
            }
          });
        }
      },
    });
  });
};

exports.default = GeographyPointPlugin;
