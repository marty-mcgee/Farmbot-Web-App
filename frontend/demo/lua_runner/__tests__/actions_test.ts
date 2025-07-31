import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig,
  fakeFirmwareConfig,
  fakeWebAppConfig,
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

import { TOAST_OPTIONS } from "../../../toast/constants";
import { info } from "../../../toast/toast";
import { eStop, expandActions, runActions, setCurrent } from "../actions";

describe("runActions()", () => {
  beforeEach(() => {
    console.log = jest.fn();
  });

  it("runs actions", () => {
    jest.useFakeTimers();
    runActions(
      [
        { type: "send_message", args: ["info", "Hello, world!", "toast"] },
      ],
    );
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith("Hello, world!", TOAST_OPTIONS().info);
  });

  it("runs actions: missing", () => {
    jest.useFakeTimers();
    runActions(
      [
        { type: "wait_ms", args: [10000] },
        { type: "send_message", args: ["info", "Hello, world!", "toast"] },
      ],
    );
    eStop();
    jest.runAllTimers();
    expect(info).not.toHaveBeenCalled();
  });
});

describe("expandActions()", () => {
  beforeEach(() => {
    setCurrent({ x: 0, y: 0, z: 0 });
    localStorage.removeItem("timeStepMs");
    localStorage.removeItem("mmPerSecond");
    console.log = jest.fn();
    mockResources = buildResourceIndex([
      fakeFirmwareConfig(),
      fakeFbosConfig(),
      fakeWebAppConfig(),
    ]);
  });

  it("chunks movements: default", () => {
    expect(expandActions([
      { type: "move_absolute", args: [300, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [125, 0, 0] },
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [250, 0, 0] },
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [300, 0, 0] },
    ]);
  });

  it("chunks movements: lands on target", () => {
    expect(expandActions([
      { type: "move_absolute", args: [125, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [125, 0, 0] },
    ]);
  });

  it("chunks movements: custom", () => {
    localStorage.setItem("timeStepMs", "1000");
    localStorage.setItem("mmPerSecond", "1000");
    expect(expandActions([
      { type: "move_absolute", args: [300, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [1000] },
      { type: "expanded_move_absolute", args: [300, 0, 0] },
    ]);
  });

  it("doesn't chunk movements", () => {
    localStorage.setItem("DISABLE_CHUNKING", "true");
    expect(expandActions([
      { type: "move_absolute", args: [2000, 0, 0] },
    ], [])).toEqual([
      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [2000, 0, 0] },
    ]);
  });

  it("chunks movements: warns", () => {
    expect(expandActions([
      { type: "_move", args: [JSON.stringify([{ kind: "foo", args: {} }])] },
    ], [])).toEqual([
      { type: "send_message", args: ["warn", "not yet supported: item kind: foo"] },

      { type: "wait_ms", args: [250] },
      { type: "expanded_move_absolute", args: [0, 0, 0] },
    ]);
  });
});
