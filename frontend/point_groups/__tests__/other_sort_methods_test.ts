import { distance } from "../other_sort_methods";

describe("distance()", () => {
  it("calculates distance", () => {
    expect(distance({ x: 0, y: 0 }, { x: 1, y: 0 })).toEqual(1);
  });
});
