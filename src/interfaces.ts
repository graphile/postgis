export type Subtype = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SubtypeDetails {
  subtype: Subtype;
  hasZ: boolean;
  hasM: boolean;
  srid: number;
}
