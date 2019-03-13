import * as GraphQL from "graphql";
type Maybe<T> = null | undefined | T;

// This file is based on
// https://github.com/taion/graphql-type-json/blob/6e45ae4ee0a60f8f3565c8c980a82c7d9b98d3f5/src/index.js
/*
The MIT License (MIT)

Copyright (c) 2016 Jimmy Jia
Copyright (c) 2019 Benjie Gillam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
export default function makeGeoJSONType(graphql: any, name = "GeoJSON") {
  const Kind: typeof GraphQL.Kind = graphql.Kind;
  const GraphQLScalarType: typeof GraphQL.GraphQLScalarType =
    graphql.GraphQLScalarType;

  function identity<T>(value: T): T {
    return value;
  }

  function parseLiteral(
    ast: GraphQL.ValueNode,
    variables: Maybe<{ [key: string]: any }>
  ): any {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;

      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT: {
        const value = Object.create(null);
        ast.fields.forEach(field => {
          value[field.name.value] = parseLiteral(field.value, variables);
        });

        return value;
      }
      case Kind.LIST:
        return ast.values.map(n => parseLiteral(n, variables));
      case Kind.NULL:
        return null;
      case Kind.VARIABLE: {
        const variableName = ast.name.value;
        return variables ? variables[variableName] : undefined;
      }
      default:
        return undefined;
    }
  }

  return new GraphQLScalarType({
    name,
    description:
      `The \`${name}\` scalar type represents GeoJSON values as specified by` +
      "[RFC 7946](https://tools.ietf.org/html/rfc7946).",
    serialize: identity,
    parseValue: identity,
    parseLiteral,
  });
}
