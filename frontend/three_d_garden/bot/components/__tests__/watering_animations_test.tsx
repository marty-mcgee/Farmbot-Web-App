import React from "react";
import { render } from "@testing-library/react";
import {
  WateringAnimations, WateringAnimationsProps,
} from "../watering_animations";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<WateringAnimations />", () => {
  const fakeProps = (): WateringAnimationsProps => ({
    waterFlow: true,
    config: clone(INITIAL),
    getZ: () => 0,
  });

  it("renders", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    const { container, rerender } = render(<WateringAnimations {...p} />);
    jest.runAllTimers();
    rerender(<WateringAnimations {...p} />);
    const streams = container.querySelectorAll("[name*='water-stream']");
    expect(streams.length).toEqual(16);

    const clouds = container.querySelectorAll("[name*='waterfall-mist-cloud']");
    expect(clouds.length).toEqual(2);
  });
});
