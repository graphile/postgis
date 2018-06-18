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
  0: "generic",
  1: "point",
  2: "linestr",
  3: "polygon",
  4: "multipoint",
  5: "multilinestr",
  6: "multipolygon",
  7: "geometrycollection",
};

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
  builder.hook("build", build => {
    const {
      newWithHooks,
      pgIntrospectionResultsByKind: introspectionResultsByKind,
      graphql: {
        GraphQLNonNull,
        GraphQLFloat,
        GraphQLObjectType,
        GraphQLInputObjectType,
      },
      pgRegisterGqlTypeByTypeId,
      pgRegisterGqlInputTypeByTypeId,
      pgTweaksByTypeIdAndModifer,
      getTypeByName,
      pgSql: sql,
      pg2gql,
    } = build;
    debug("PostGIS plugin enabled");
    // Check we have the postgis extension
    const POSTGIS = introspectionResultsByKind.extension.find(
      e => e.name === "postgis"
    );
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
    let constructedTypes = {};
    let _interface;

    const GraphQLJSON = getTypeByName("JSON");

    function getGeographyInterface() {
      if (!_interface) {
        _interface = newWithHooks(GraphQLInterfaceType, {
          name,
          fields: {
            geojson: {
              type: GraphQLJSON,
              description: "Converts the object to GeoJSON",
            },
          },
          resolveType(value, info) {
            // FIXME!
            return getGeographyType(value.__geotype);
          },
          description: "All PostGIS geography types implement this interface",
        });
      }
      return _interface;
    }
    function getGeographyType(type, typeModifier) {
      const typeId = type.id;
      const { subtype, subtypeString } = getSubtypeAndSridFromModifier(
        true,
        typeModifier
      );
      debug(`Getting type ${typeModifier} / ${subtype} / ${subtypeString}`);
      const key = `geography_output_${subtype}`;
      if (!constructedTypes[key]) {
        if (!pgTweaksByTypeIdAndModifer[typeId]) {
          pgTweaksByTypeIdAndModifer[typeId] = {};
        }
        const typeModifierKey = typeModifier != null ? typeModifier : -1;
        pgTweaksByTypeIdAndModifer[typeId][typeModifierKey] = (
          fragment,
          resolveData
        ) => {
          const params = [
            sql.literal("__geometryType"),
            sql.fragment`${sql.identifier(
              POSTGIS.namespace.name,
              "geometrytype" // MUST be lowercase!
            )}(${fragment})`,
            sql.literal("geojson"),
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
        constructedTypes[key] = build.newWithHooks(
          GraphQLObjectType,
          {
            // TODO: use inflector
            name: `Geography_${TYPE_LOOKUP[subtype]}`,
            fields: {
              geojson: {
                type: GraphQLJSON,
                resolve: (data, _args, _context, _resolveInfo) => {
                  return pg2gql(data.geojson, jsonType);
                },
              },
              /*
                longitude: {
                  type: new GraphQLNonNull(GraphQLFloat),
                },
                latitude: {
                  type: new GraphQLNonNull(GraphQLFloat),
                },
              */
            },
          },
          {
            isPgGISGeographyType: true,
            pgGISSubtype: subtype,
          }
        );
      }
      return constructedTypes[key];
    }
    function getGeographyInputType() {
      const key = `geography_input_${subtype}`;
      if (!constructedTypes[key]) {
        constructedTypes[key] = newWithHooks(GraphQLInputObjectType, {
          name: "GeographyPointInput",
          fields: {
            longitude: {
              type: new GraphQLNonNull(GraphQLFloat),
            },
            latitude: {
              type: new GraphQLNonNull(GraphQLFloat),
            },
          },
        });
      }
      return constructedTypes[key];
    }

    debug(`Registering handler for ${GEOGRAPHY_TYPE.id}`);
    pgRegisterGqlTypeByTypeId(GEOGRAPHY_TYPE.id, (_set, typeModifier) => {
      return getGeographyType(GEOGRAPHY_TYPE, typeModifier);
    });
    return build;
  });
};

exports.default = GeographyPointPlugin;
