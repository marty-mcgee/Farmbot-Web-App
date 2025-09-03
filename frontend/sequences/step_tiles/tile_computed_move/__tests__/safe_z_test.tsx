import { SAFE_Z } from "../safe_z";

describe("SAFE_Z", () => {
  it("returns node", () => {
    expect(SAFE_Z).toEqual({ kind: "safe_z", args: {} });
  });
});
