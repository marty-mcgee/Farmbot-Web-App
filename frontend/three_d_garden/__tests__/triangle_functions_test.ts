import { getZFunc, precomputeTriangles } from "../triangle_functions";

describe("precomputeTriangles()", () => {
  it("computes triangles: zero", () => {
    expect(precomputeTriangles([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ], [0, 1, 2])).toEqual([]);
  });

  it("computes triangles", () => {
    expect(precomputeTriangles([
      [1, 1, 0],
      [4, 1, 0],
      [2, 3, 0],
    ], [0, 1, 2])).toEqual([{
      a: [1, 1, 0],
      b: [4, 1, 0],
      c: [2, 3, 0],
      det: 6,
      x1: 1,
      x2: 4,
      x3: 2,
      y1: 1,
      y2: 1,
      y3: 3,
    }]);
  });
});

describe("getZFunc()", () => {
  it("gets Z: falls back", () => {
    expect(getZFunc([], -100)(0, 0)).toEqual(-100);
  });

  it("gets Z", () => {
    expect(getZFunc([{
      a: [0, 0, 10],
      b: [2, 0, 20],
      c: [0, 2, 30],
      det: 4,
      x1: 0,
      x2: 2,
      x3: 0,
      y1: 0,
      y2: 0,
      y3: 2,
    }], -100)(1, 1)).toEqual(25);
  });
});
