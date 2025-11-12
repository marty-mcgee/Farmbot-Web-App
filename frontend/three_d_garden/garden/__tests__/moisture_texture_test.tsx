import React from "react";
import { render } from "@testing-library/react";
import { MoistureTexture, MoistureTextureProps } from "../moisture_texture";
import { clone } from "lodash";
import { INITIAL } from "../../config";
import { BufferGeometry } from "three";

describe("<MoistureTexture />", () => {
  const fakeProps = (): MoistureTextureProps => ({
    config: clone(INITIAL),
    geometry: new BufferGeometry(),
    sensorReadings: [],
    showMoistureReadings: true,
  });

  it("renders", () => {
    const { container } = render(<MoistureTexture {...fakeProps()} />);
    expect(container).toContainHTML("render-texture");
  });

  it("renders without readings", () => {
    const p = fakeProps();
    p.showMoistureReadings = false;
    const { container } = render(<MoistureTexture {...p} />);
    expect(container).toContainHTML("render-texture");
  });
});
