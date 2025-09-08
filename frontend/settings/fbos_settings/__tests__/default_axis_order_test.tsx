jest.mock("../../../devices/actions", () => ({
  updateConfig: jest.fn(),
}));

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DefaultAxisOrder } from "../default_axis_order";
import { DefaultAxisOrderProps } from "../interfaces";
import { updateConfig } from "../../../devices/actions";

describe("<DefaultAxisOrder />", () => {
  const fakeProps = (): DefaultAxisOrderProps => ({
    sourceFbosConfig: () => ({ value: "safe_z", consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    render(<DefaultAxisOrder {...fakeProps()} />);
    expect(screen.getByText("Safe Z")).toBeInTheDocument();
    const dropdown = screen.getByRole("button");
    fireEvent.click(dropdown);
    const item = screen.getByRole("menuitem", { name: "X and Y together" });
    fireEvent.click(item);
    expect(updateConfig).toHaveBeenCalledWith({ default_axis_order: "xy,z;high" });
  });
});
