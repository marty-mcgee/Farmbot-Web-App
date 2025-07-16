import {
  maybeFindGenericPointerById,
  maybeFindPeripheralById,
  maybeFindPlantTemplateById,
  maybeFindPointById,
  maybeFindSavedGardenById,
  maybeFindSensorById,
  maybeFindSequenceById,
  maybeFindWeedPointerById,
} from "../selectors_by_id";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

describe("maybeFindPointById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindPointById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});

describe("maybeFindPlantTemplateById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindPlantTemplateById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});

describe("maybeFindGenericPointerById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindGenericPointerById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});

describe("maybeFindWeedPointerById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindWeedPointerById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});

describe("maybeFindSavedGardenById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindSavedGardenById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});

describe("maybeFindSequenceById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindSequenceById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});

describe("maybeFindPeripheralById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindPeripheralById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});

describe("maybeFindSensorById()", () => {
  it("handles missing uuid", () => {
    expect(maybeFindSensorById(buildResourceIndex([]).index, 1))
      .toEqual(undefined);
  });
});
