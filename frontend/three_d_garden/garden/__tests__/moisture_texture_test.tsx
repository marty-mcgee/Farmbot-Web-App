import React from "react";
import { render } from "@testing-library/react";
import { MoistureSurface, MoistureSurfaceProps } from "../moisture_texture";
import { clone } from "lodash";
import { INITIAL } from "../../config";
import {
  fakeSensor, fakeSensorReading,
} from "../../../__test_support__/fake_state/resources";

describe("<MoistureSurface />", () => {
  const fakeProps = (): MoistureSurfaceProps => ({
    config: clone(INITIAL),
    sensors: [],
    sensorReadings: [],
    showMoistureReadings: true,
    showMoistureMap: true,
    position: [0, 0, 0],
    color: "black",
    radius: 10,
  });

  it("renders with readings", () => {
    const p = fakeProps();
    p.showMoistureReadings = true;
    const reading = fakeSensorReading();
    reading.body.pin = 1;
    reading.body.mode = 1;
    p.sensorReadings = [reading];
    const sensor = fakeSensor();
    sensor.body.pin = 1;
    sensor.body.label = "soil moisture";
    p.sensors = [sensor];
    const { container } = render(<MoistureSurface {...p} />);
    expect(container).toContainHTML("moisture-layer");
  });

  it("renders without readings", () => {
    const p = fakeProps();
    p.showMoistureReadings = false;
    const { container } = render(<MoistureSurface {...p} />);
    expect(container).toContainHTML("moisture-layer");
  });
});
