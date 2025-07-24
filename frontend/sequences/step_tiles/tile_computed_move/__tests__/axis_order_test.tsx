import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { axisOrder, AxisOrderInputRow, getAxisOrderState } from "../axis_order";
import { AxisOrderInputRowProps } from "../interfaces";
import { Move } from "farmbot";

describe("<AxisOrderInputRow />", () => {
  const fakeProps = (): AxisOrderInputRowProps => ({
    order: undefined,
    safeZ: false,
    onChange: jest.fn(),
  });

  it("renders order", () => {
    const p = fakeProps();
    p.order = "z,y,x";
    render(<AxisOrderInputRow {...p} />);
    expect(screen.getByText("Z then Y then X")).toBeInTheDocument();
  });

  it("changes item", () => {
    const p = fakeProps();
    render(<AxisOrderInputRow {...p} />);
    const dropdown = screen.getByRole("button");
    fireEvent.click(dropdown);
    const item = screen.getByRole("menuitem", { name: "Z then Y then X" });
    fireEvent.click(item);
    expect(p.onChange).toHaveBeenCalledWith({
      label: "Z then Y then X",
      value: "z,y,x",
    });
  });
});

describe("axisOrder()", () => {
  it("returns node list", () => {
    expect(axisOrder(undefined)).toEqual([]);
    expect(axisOrder("xyz")).toEqual([
      { kind: "axis_order", args: { order: "xyz" } },
    ]);
  });
});

describe("getAxisOrderState()", () => {
  it("returns state: axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [{ kind: "axis_order", args: { order: "z,y,x" } }],
    };
    expect(getAxisOrderState(move)).toEqual("z,y,x");
  });

  it("returns state: no axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [],
    };
    expect(getAxisOrderState(move)).toEqual(undefined);
  });
});
