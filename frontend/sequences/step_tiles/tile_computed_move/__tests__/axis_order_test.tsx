let mockDev = false;
jest.mock("../../../../settings/dev/dev_support", () => ({
  DevSettings: { allOrderOptionsEnabled: () => mockDev },
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  axisOrder, AxisOrderInputRow, getAxisGroupingState, getAxisRouteState,
} from "../axis_order";
import { AxisGrouping, AxisOrderInputRowProps, AxisRoute } from "../interfaces";
import { Move } from "farmbot";

describe("<AxisOrderInputRow />", () => {
  beforeEach(() => {
    mockDev = false;
  });

  const fakeProps = (): AxisOrderInputRowProps => ({
    grouping: undefined,
    route: undefined,
    safeZ: false,
    onChange: jest.fn(),
  });

  it.each<[boolean, AxisGrouping, AxisRoute, string]>([
    [false, "x,y,z", "high", "One at a time"],
    [false, "xy,z", "high", "X and Y together"],
    [false, "xyz", "high", "All at once"],
    [false, undefined, undefined, "All at once"],
    [false, "x", "low", "x;low"],
    [true, "x", "low", "Safe Z"],
  ])("renders order: safe_z=%s %s %s", (safeZ, grouping, route, label) => {
    const p = fakeProps();
    p.grouping = grouping;
    p.route = route;
    p.safeZ = safeZ;
    render(<AxisOrderInputRow {...p} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("changes item", () => {
    const p = fakeProps();
    render(<AxisOrderInputRow {...p} />);
    const dropdown = screen.getByRole("button");
    fireEvent.click(dropdown);
    const item = screen.getByRole("menuitem", { name: "X and Y together" });
    fireEvent.click(item);
    expect(p.onChange).toHaveBeenCalledWith({
      label: "X and Y together",
      value: "xy,z;high",
    });
  });

  it("shows all order options", () => {
    mockDev = true;
    const p = fakeProps();
    render(<AxisOrderInputRow {...p} />);
    const dropdown = screen.getByRole("button");
    fireEvent.click(dropdown);
    expect(screen.getByRole("menuitem", { name: "x,yz;high" })).toBeInTheDocument();
  });
});

describe("axisOrder()", () => {
  it("returns node list", () => {
    expect(axisOrder(undefined, undefined)).toEqual([]);
    expect(axisOrder("xyz", "in_order")).toEqual([
      { kind: "axis_order", args: { grouping: "xyz", route: "in_order" } },
    ]);
  });
});

describe("getAxisGroupingState()", () => {
  it("returns state: axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [{ kind: "axis_order", args: { grouping: "z,y,x", route: "in_order" } }],
    };
    expect(getAxisGroupingState(move)).toEqual("z,y,x");
  });

  it("returns state: no axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [],
    };
    expect(getAxisGroupingState(move)).toEqual(undefined);
  });
});


describe("getAxisRouteState()", () => {
  it("returns state: axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [{ kind: "axis_order", args: { grouping: "z,y,x", route: "in_order" } }],
    };
    expect(getAxisRouteState(move)).toEqual("in_order");
  });

  it("returns state: no axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [],
    };
    expect(getAxisRouteState(move)).toEqual(undefined);
  });
});
