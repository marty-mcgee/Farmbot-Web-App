import React from "react";
import { render } from "@testing-library/react";
import { HeightMaterial, HeightMaterialProps } from "../height_material";
import { Color } from "three";

describe("<HeightMaterial />", () => {
  const fakeProps = (): HeightMaterialProps => ({
    min: 0,
    max: 1,
    lowColor: new Color(0, 0, 0),
    highColor: new Color(1, 0, 0),
  });

  it("renders", () => {
    const { container } = render(<HeightMaterial {...fakeProps()} />);
    expect(container).toContainHTML("heightshadermaterial");
  });
});
