import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakePlant,
  fakeTool,
  fakeToolSlot,
} from "../../../__test_support__/fake_state/resources";
let mockResources = buildResourceIndex([]);
jest.mock("../../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => ({
      resources: mockResources,
      bot: {
        hardware: {
          location_data: { position: { x: 0, y: 0, z: 0 } },
          informational_settings: { locked: false },
        },
      },
    }),
  },
}));

jest.mock("../../../three_d_garden/triangle_functions", () => ({
  getZFunc: jest.fn(() => () => 3),
}));

import { Move, ParameterApplication } from "farmbot";
import { TOAST_OPTIONS } from "../../../toast/constants";
import { info } from "../../../toast/toast";
import { calculateMove, runActions } from "../actions";

describe("runActions()", () => {
  it("runs actions", () => {
    jest.useFakeTimers();
    runActions(
      [
        { type: "send_message", args: ["info", "Hello, world!", "toast"] },
      ],
      []);
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith("Hello, world!", TOAST_OPTIONS().info);
  });
});

describe("calculateMove()", () => {
  it("handles number single axis addition", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "x",
            axis_operand: { kind: "numeric", args: { number: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ x: 2, y: 2, z: 3 });
  });

  it("handles number all axis addition", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ x: 2, y: 3, z: 4 });
  });

  it("handles coordinate single axis addition", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "x",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ x: 2, y: 2, z: 3 });
  });

  it("handles coordinate all axis addition", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_addition",
          args: {
            axis: "all",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ x: 2, y: 4, z: 6 });
  });

  it("handles number single axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "numeric", args: { number: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ x: 3, y: 2, z: 3 });
  });

  it("handles number all axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "numeric", args: { number: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 1, y: 2, z: 3 }, []))
      .toEqual({ x: 1, y: 1, z: 1 });
  });

  it("handles coordinate single axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 1, y: 0, z: 0 });
  });

  it("handles coordinate all axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 1, y: 2, z: 3 });
  });

  it("handles tool single axis overwrite", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    slot.body.x = 1;
    slot.body.y = 2;
    slot.body.z = 3;
    mockResources = buildResourceIndex([tool, slot]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "x",
            axis_operand: { kind: "tool", args: { tool_id: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 1, y: 0, z: 0 });
  });

  it("handles tool all axis overwrite", () => {
    const tool = fakeTool();
    tool.body.id = 1;
    const slot = fakeToolSlot();
    slot.body.tool_id = 1;
    slot.body.x = 1;
    slot.body.y = 2;
    slot.body.z = 3;
    mockResources = buildResourceIndex([tool, slot]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "tool", args: { tool_id: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 1, y: 2, z: 3 });
  });

  it("handles missing tool", () => {
    mockResources = buildResourceIndex([]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "tool", args: { tool_id: 1 } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 0, y: 0, z: 0 });
  });

  it("handles coordinate identifier all axis overwrite", () => {
    mockResources = buildResourceIndex([]);
    const variables: ParameterApplication[] = [
      {
        kind: "parameter_application",
        args: {
          label: "parent",
          data_value: {
            kind: "coordinate",
            args: { x: 1, y: 2, z: 3 },
          },
        },
      },
    ];
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, variables))
      .toEqual({ x: 1, y: 2, z: 3 });
  });

  it("handles point identifier all axis overwrite", () => {
    const point = fakePlant();
    point.body.id = 1;
    point.body.x = 1;
    point.body.y = 2;
    point.body.z = 3;
    mockResources = buildResourceIndex([point]);
    const variables: ParameterApplication[] = [
      {
        kind: "parameter_application",
        args: {
          label: "parent",
          data_value: {
            kind: "point",
            args: { pointer_id: 1, pointer_type: "Plant" },
          },
        },
      },
    ];
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, variables))
      .toEqual({ x: 1, y: 2, z: 3 });
  });

  it("handles missing point", () => {
    mockResources = buildResourceIndex([]);
    const variables: ParameterApplication[] = [
      {
        kind: "parameter_application",
        args: {
          label: "parent",
          data_value: {
            kind: "point",
            args: { pointer_id: 1, pointer_type: "Plant" },
          },
        },
      },
    ];
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, variables))
      .toEqual({ x: 0, y: 0, z: 0 });
  });

  it("handles missing variables", () => {
    mockResources = buildResourceIndex([]);
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "all",
            axis_operand: { kind: "identifier", args: { label: "parent" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, undefined))
      .toEqual({ x: 0, y: 0, z: 0 });
  });

  it("handles soil height z axis overwrite", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "z",
            axis_operand: { kind: "special_value", args: { label: "soil_height" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 0, y: 0, z: 3 });
  });

  it("handles soil height z axis overwrite: triangle data", () => {
    sessionStorage.setItem("triangles", "[\"foo\"]");
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "z",
            axis_operand: { kind: "special_value", args: { label: "soil_height" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 0, y: 0, z: 3 });
  });

  it("handles soil height z axis overwrite: wrong label", () => {
    const command: Move = {
      kind: "move",
      args: {},
      body: [
        {
          kind: "axis_overwrite",
          args: {
            axis: "z",
            axis_operand: { kind: "special_value", args: { label: "nope" } },
          },
        },
      ],
    };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 0, y: 0, z: 0 });
  });

  it("handles missing body", () => {
    const command: Move = { kind: "move", args: {} };
    expect(calculateMove(command.body, { x: 0, y: 0, z: 0 }, []))
      .toEqual({ x: 0, y: 0, z: 0 });
  });
});
