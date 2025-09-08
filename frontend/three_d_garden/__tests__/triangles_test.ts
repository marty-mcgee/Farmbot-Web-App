import { computeSurface } from "../triangles";
import { INITIAL } from "../config";
import { clone } from "lodash";
import { fakePoint } from "../../__test_support__/fake_state/resources";
import { tagAsSoilHeight } from "../../points/soil_height";

const zs = (items: [number, number, number][]) => items.map(i => i[2]);

describe("computeSurface()", () => {
  it("computes surface: above bed top", () => {
    const config = clone(INITIAL);
    config.soilHeight = 300;
    config.columnLength = 1000;
    config.bedHeight = 1;
    const { vertexList } = computeSurface([], config);
    expect(zs(vertexList)).toEqual([-900, -900, -900, -900, -300, -300]);
  });

  it("computes surface: below bed bottom", () => {
    const config = clone(INITIAL);
    config.soilHeight = 500;
    config.columnLength = 100;
    config.bedHeight = 100;
    const { vertexList } = computeSurface([], config);
    expect(zs(vertexList)).toEqual([-100, -100, -100, -100, -500, -500]);
  });

  it("computes surface: no soil points", () => {
    const config = clone(INITIAL);
    config.soilHeight = 500;
    const { vertexList } = computeSurface(undefined, config);
    expect(zs(vertexList)).toEqual([-500, -500, -500, -500, -500, -500]);
  });

  it("computes surface: soil points", () => {
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = -400;
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    point0.body.x = 100;
    point0.body.y = 200;
    point0.body.z = -600;
    const soilPoints = [point0, point1];
    const config = clone(INITIAL);
    config.soilHeight = 500;
    const { vertexList } = computeSurface(soilPoints, config);
    expect(zs(vertexList)).toEqual([-600, 0, -500, -500, -500, -500]);
  });

  it("computes surface: exaggerated", () => {
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = -400;
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    point0.body.x = 100;
    point0.body.y = 200;
    point0.body.z = -600;
    const soilPoints = [point0, point1];
    const config = clone(INITIAL);
    config.soilHeight = 500;
    config.exaggeratedZ = true;
    config.perspective = true;
    const { vertexList } = computeSurface(soilPoints, config);
    expect(zs(vertexList)).toEqual([-1500, 4500, -500, -500, -500, -500]);
  });
});
