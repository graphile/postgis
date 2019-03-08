## GEOGRAPHY(type, srid)

All the GEOGRAPHY types are stored as one type in PostgreSQL and they use the
type modifier (a 4 byte integer) to determine the subtype. For example:

```sql
geography(point, 4326)
```

These results in the PostgreSQL type modifier value (stored in pg_attribute)
of `1107460`:

```
atttypmod: 1107460
```

We can extract the `srid` from this 4-byte integer as follows:

```
(1107460 >> 8) & (2 ** 16 - 1): 4326
```

So the SRID is `4326`.

We can extract the type of geography as follows:

```
(atttypmod && 255) >> 2: 1
```

The meanings of this value are as follows:

```
1 - point
2 - linestr
3 - polygon
4 - multipoint
5 - multilinestr
6 - multipolygon
7 - geometrycollection
```
