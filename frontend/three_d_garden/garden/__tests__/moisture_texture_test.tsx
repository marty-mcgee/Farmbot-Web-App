import React from "react";
import { render } from "@testing-library/react";
import { MoistureTexture, MoistureTextureProps } from "../moisture_texture";
import { clone } from "lodash";
import { INITIAL } from "../../config";
import {
  fakeSensor, fakeSensorReading,
} from "../../../__test_support__/fake_state/resources";

describe("<MoistureTexture />", () => {
  const fakeProps = (): MoistureTextureProps => ({
    config: clone(INITIAL),
    sensors: [],
    sensorReadings: [],
    showMoistureReadings: true,
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
    const { container } = render(<MoistureTexture {...p} />);
    expect(container).toContainHTML("render-texture");
  });

  it("renders without readings", () => {
    const p = fakeProps();
    p.showMoistureReadings = false;
    const { container } = render(<MoistureTexture {...p} />);
    expect(container).toContainHTML("render-texture");
  });
});
