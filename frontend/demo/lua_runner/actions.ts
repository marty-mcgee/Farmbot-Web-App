import {
  ALLOWED_GROUPING,
  ALLOWED_ROUTE,
  Identifier, MoveBodyItem, ParameterApplication, PercentageProgress,
  Xyz,
} from "farmbot";
import { info } from "../../toast/toast";
import { store } from "../../redux/store";
import { Actions } from "../../constants";
import { TOAST_OPTIONS } from "../../toast/constants";
import { Action, XyzNumber } from "./interfaces";
import { edit, initSave, save } from "../../api/crud";
import {
  getDeviceAccountSettings,
  maybeFindPointById,
  maybeFindSlotByToolId,
} from "../../resources/selectors";
import { UnknownAction } from "redux";
import {
  getFirmwareSettings, getGardenSize, getSafeZ, getSoilHeight,
} from "./stubs";
import { clamp, clone } from "lodash";
import { validBotLocationData } from "../../util/location";
import { Point } from "farmbot/dist/resources/api_resources";

const almostEqual = (a: XyzNumber, b: XyzNumber) => {
  const epsilon = 0.01;
  return Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon;
};

const movementChunks = (
  current: XyzNumber,
  target: XyzNumber,
  mmPerTimeStep: number,
): XyzNumber[] => {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const dz = target.z - current.z;

  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (length === 0) { return [target]; }
  const direction = {
    x: dx / length,
    y: dy / length,
    z: dz / length,
  };
  const steps = Math.floor(length / mmPerTimeStep);
  const chunks: XyzNumber[] = [];
  for (let i = 1; i <= steps; i++) {
    const step = {
      x: current.x + direction.x * mmPerTimeStep * i,
      y: current.y + direction.y * mmPerTimeStep * i,
      z: current.z + direction.z * mmPerTimeStep * i,
    };
    chunks.push(step);
  }
  if (chunks.length === 0 || !almostEqual(chunks[chunks.length - 1], target)) {
    chunks.push(target);
  }
  return chunks;
};

const clampTarget = (target: XyzNumber): XyzNumber => {
  const firmwareConfig = getFirmwareSettings();
  const bounds = getGardenSize();
  const clamped = {
    x: clamp(target.x, 0, bounds.x),
    y: clamp(target.y, 0, bounds.y),
    z: firmwareConfig.movement_home_up_z
      ? clamp(target.z, -bounds.z, 0)
      : clamp(target.z, 0, bounds.z),
  };
  return clamped;
};

const current = {
  x: 0,
  y: 0,
  z: 0,
};

export const setCurrent = (position: XyzNumber) => {
  current.x = position.x;
  current.y = position.y;
  current.z = position.z;
};

export const expandActions = (
  actions: Action[],
  variables: ParameterApplication[] | undefined,
): Action[] => {
  const expanded: Action[] = [];
  const timeStepMs = parseInt(localStorage.getItem("timeStepMs") || "250");
  const mmPerSecond = parseInt(localStorage.getItem("mmPerSecond") || "500");
  const mmPerTimeStep = (mmPerSecond * timeStepMs) / 1000;
  const addPosition = (position: XyzNumber) => {
    expanded.push({
      type: "wait_ms",
      args: [timeStepMs],
    });
    expanded.push({
      type: "expanded_move_absolute",
      args: [position.x, position.y, position.z],
    });
  };
  actions.map(action => {
    switch (action.type) {
      case "move_absolute":
        const moveAbsoluteTarget = clampTarget({
          x: action.args[0] as number,
          y: action.args[1] as number,
          z: action.args[2] as number,
        });
        movementChunks(current, moveAbsoluteTarget, mmPerTimeStep).map(addPosition);
        setCurrent(moveAbsoluteTarget);
        break;
      case "move_relative":
        const moveRelativeTarget = clampTarget({
          x: current.x + (action.args[0] as number),
          y: current.y + (action.args[1] as number),
          z: current.z + (action.args[2] as number),
        });
        movementChunks(current, moveRelativeTarget, mmPerTimeStep).map(addPosition);
        setCurrent(moveRelativeTarget);
        break;
      case "_move":
        const moveItems = JSON.parse("" + action.args[0]) as MoveBodyItem[];
        const { moves, warnings } = calculateMove(moveItems, current, variables);
        warnings.length > 0 && expanded.push({
          type: "send_message",
          args: ["warn", `not yet supported: ${warnings.join(", ")}`],
        });
        const actualMoveTargets = moves.map(clampTarget);
        actualMoveTargets.map(actualMoveTarget => {
          movementChunks(current, actualMoveTarget, mmPerTimeStep).map(addPosition);
          setCurrent(actualMoveTarget);
        });
        break;
      case "find_home":
      case "go_to_home":
        const axisInput = action.args[0] as string;
        const axes = axisInput == "all" ? ["z", "y", "x"] : [axisInput];
        axes.map(axis => {
          const homeTarget = {
            x: axis == "x" ? 0 : current.x,
            y: axis == "y" ? 0 : current.y,
            z: axis == "z" ? 0 : current.z,
          };
          movementChunks(current, homeTarget, mmPerTimeStep).map(addPosition);
          setCurrent(homeTarget);
        });
        break;
      default:
        expanded.push(action);
        break;
    }
  });
  return expanded;
};

interface Scheduled {
  func(): void;
  timestamp: number;
}
const pending: Scheduled[] = [];
let latestActionMs = Date.now();
let currentTimer: ReturnType<typeof setTimeout> | undefined = undefined;

export const eStop = () => {
  latestActionMs = 0;
  pending.length = 0;
  console.log(`Queue length: ${pending.length}`);
  store.dispatch({
    type: Actions.DEMO_SET_ESTOP,
    payload: true,
  });
  const { position } = validBotLocationData(
    store.getState().bot.hardware.location_data);
  current.x = position.x as number;
  current.y = position.y as number;
  current.z = position.z as number;
};

export const runActions = (
  actions: Action[],
) => {
  let delay = 0;
  actions.map(action => {
    // eslint-disable-next-line complexity
    const getFunc = () => {
      const estopped = store.getState().bot.hardware.informational_settings.locked;
      if (estopped && action.type !== "emergency_unlock") {
        return;
      }
      switch (action.type) {
        case "wait_ms":
          const ms = action.args[0] as number;
          delay += ms;
          return undefined;
        case "send_message":
          const type = "" + action.args[0];
          const msg = "" + action.args[1];
          return () => {
            info(msg, TOAST_OPTIONS()[type]);
          };
        case "print":
          return () => {
            console.log(action.args[0]);
          };
        case "emergency_lock":
          return eStop;
        case "emergency_unlock":
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_ESTOP,
              payload: false,
            });
          };
        case "expanded_move_absolute":
          const x = action.args[0] as number;
          const y = action.args[1] as number;
          const z = action.args[2] as number;
          const position = { x, y, z };
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_POSITION,
              payload: position,
            });
          };
        case "toggle_pin":
          return () => {
            store.dispatch({
              type: Actions.DEMO_TOGGLE_PIN,
              payload: action.args[0] as number,
            });
          };
        case "write_pin":
          const pin = action.args[0] as number;
          const mode = action.args[1] as string;
          const value = action.args[2] as number;
          return () => {
            store.dispatch({
              type: Actions.DEMO_WRITE_PIN,
              payload: { pin, mode, value },
            });
          };
        case "set_job_progress":
          const job = "" + action.args[0];
          const percent = action.args[1] as number;
          const status = "" + action.args[2];
          const time = action.args[3];
          const progress: PercentageProgress = {
            unit: "percent",
            percent,
            status: status as "working",
            type: "",
            file_type: "",
            updated_at: (new Date()).valueOf() / 1000,
            time: (status == "Complete" ? undefined : time) as string,
          };
          return () => {
            store.dispatch({
              type: Actions.DEMO_SET_JOB_PROGRESS,
              payload: [job, progress],
            });
          };
        case "create_point":
          const point = JSON.parse("" + action.args[0]) as Point;
          point.meta = point.meta || {};
          return () => {
            store.dispatch(initSave("Point", point) as unknown as UnknownAction);
          };
        case "update_device":
          return () => {
            const device =
              getDeviceAccountSettings(store.getState().resources.index);
            store.dispatch(edit(device, {
              mounted_tool_id: action.args[1] as number,
            }) as unknown as UnknownAction);
            store.dispatch(save(device.uuid) as unknown as UnknownAction);
          };
      }
    };
    const func = getFunc();
    if (func) {
      latestActionMs = Math.max(latestActionMs, Date.now()) + delay;
      const item = { func, timestamp: latestActionMs };
      pending.push(item);
      delay = 0;
      runNext();
    }
  });
};

const runNext = () => {
  if (currentTimer || pending.length === 0) {
    return;
  }
  const next = pending[0];
  const delay = Math.max(next.timestamp - Date.now(), 0);

  currentTimer = setTimeout(() => {
    currentTimer = undefined;
    const task = pending.shift();
    task?.func();
    console.log(`Queue length: ${pending.length}`);
    runNext();
  }, delay);
};

export const calculateMove = (
  body: MoveBodyItem[] | undefined,
  current: XyzNumber,
  variables: ParameterApplication[] | undefined,
): { moves: XyzNumber[], warnings: string[] } => {
  const pos = clone(current);
  const warnings: string[] = [];
  const moveBodyItems = body || [];
  // eslint-disable-next-line complexity
  moveBodyItems.map(item => {
    switch (item.kind) {
      case "axis_addition":
        switch (item.args.axis_operand.kind) {
          case "numeric":
            if (item.args.axis == "all") {
              pos.x += item.args.axis_operand.args.number;
              pos.y += item.args.axis_operand.args.number;
              pos.z += item.args.axis_operand.args.number;
            } else {
              pos[item.args.axis] += item.args.axis_operand.args.number;
            }
            break;
          case "coordinate":
            if (item.args.axis == "all") {
              pos.x += item.args.axis_operand.args.x;
              pos.y += item.args.axis_operand.args.y;
              pos.z += item.args.axis_operand.args.z;
            } else {
              pos[item.args.axis] += item.args.axis_operand.args[item.args.axis];
            }
            break;
          default:
            warnings.push(
              `axis_addition axis_operand kind: ${item.args.axis_operand.kind}`);
            break;
        }
        return;
      case "axis_overwrite":
        switch (item.args.axis_operand.kind) {
          case "numeric":
            if (item.args.axis == "all") {
              pos.x = item.args.axis_operand.args.number;
              pos.y = item.args.axis_operand.args.number;
              pos.z = item.args.axis_operand.args.number;
            } else {
              pos[item.args.axis] = item.args.axis_operand.args.number;
            }
            break;
          case "coordinate":
            if (item.args.axis == "all") {
              pos.x = item.args.axis_operand.args.x;
              pos.y = item.args.axis_operand.args.y;
              pos.z = item.args.axis_operand.args.z;
            } else {
              pos[item.args.axis] = item.args.axis_operand.args[item.args.axis];
            }
            break;
          case "tool":
            const toolSlot = maybeFindSlotByToolId(
              store.getState().resources.index,
              item.args.axis_operand.args.tool_id);
            if (!toolSlot) {
              break;
            }
            if (item.args.axis == "all") {
              pos.x = toolSlot.body.x;
              pos.y = toolSlot.body.y;
              pos.z = toolSlot.body.z;
            } else {
              pos[item.args.axis] = toolSlot.body[item.args.axis];
            }
            break;
          case "identifier":
            const location = (variables || []).filter(v => {
              const identifier = item.args.axis_operand as Identifier;
              return v.args.label == identifier.args.label;
            })
              .map(v => v.args.data_value)[0];
            if (location?.kind == "coordinate") {
              pos.x = location.args.x;
              pos.y = location.args.y;
              pos.z = location.args.z;
            } else if (location?.kind == "point") {
              const point = maybeFindPointById(
                store.getState().resources.index,
                location.args.pointer_id);
              if (!point) { break; }
              pos.x = point.body.x;
              pos.y = point.body.y;
              pos.z = point.body.z;
            } else {
              warnings.push(`identifier location kind: ${location?.kind}`);
            }
            break;
          case "special_value":
            if (item.args.axis_operand.args.label == "soil_height"
              && item.args.axis == "z") {
              pos.z = getSoilHeight(pos.x, pos.y);
            } else if (item.args.axis_operand.args.label == "safe_height"
              && item.args.axis == "z") {
              pos.z = getSafeZ();
            } else {
              warnings.push(
                `special_value label: ${item.args.axis_operand.args.label}`);
            }
            break;
          default:
            warnings.push(
              `axis_overwrite axis_operand kind: ${item.args.axis_operand.kind}`);
            break;
        }
        return;
      case "speed_overwrite":
        return;
      case "safe_z":
        return;
      case "axis_order":
        return;
      default:
        warnings.push(`item kind: ${(item as MoveBodyItem).kind}`);
        return;
    }
  });
  if (moveBodyItems.some(item => item.kind === "safe_z")) {
    const safeZ = getSafeZ();
    return {
      moves: [
        { x: current.x, y: current.y, z: safeZ },
        { x: pos.x, y: pos.y, z: safeZ },
        pos,
      ],
      warnings,
    };
  }
  const axisOrderItems = moveBodyItems.filter(item => item.kind === "axis_order");
  if (axisOrderItems.length > 0) {
    const { grouping, route } = axisOrderItems[0].args;
    const moves = generateMoves(grouping, route, current, pos);
    return { moves, warnings };
  }
  return { moves: [pos], warnings };
};

const generateMoves = (
  grouping: ALLOWED_GROUPING,
  route: ALLOWED_ROUTE,
  current: XyzNumber,
  target: XyzNumber,
) => {
  const axes: Xyz[] = ["x", "y", "z"];
  const zGoingUp = Math.abs(target.z) < Math.abs(current.z);
  const groupsInput: string[] = grouping.split(",");
  const isZFirst = (groups: string[]): boolean =>
    !groups.join("").includes("z") || groups[0].includes("z");
  const zFirst = (groupsArg: string[]): string[] => {
    const groups = clone(groupsArg);
    const idx = groups.findIndex(s => s.includes("z"));
    if (idx > 0) {
      const [group] = groups.splice(idx, 1);
      groups.unshift(group);
    }
    return groups;
  };
  const reverse = (groupsArg: string[]): string[] => clone(groupsArg).reverse();
  const isOrderOk = (groups: string[]): boolean => {
    switch (route) {
      case "high":
        return isZFirst(zGoingUp ? groups : reverse(groups));
      case "low":
        return isZFirst(zGoingUp ? reverse(groups) : groups);
      default:
        return true;
    }
  };
  const reorder = (groups: string[]): string[] => {
    if (isOrderOk(groups)) { return groups; }
    if (isOrderOk(reverse(groups))) { return reverse(groups); }
    if (isOrderOk(zFirst(groups))) { return zFirst(groups); }
    return reverse(zFirst(groups));
  };
  const moves: XyzNumber[] = [];
  let lastState = { ...current };
  reorder(groupsInput).map(group => {
    const normalized = group.split("").sort().join("");
    const movement = { ...lastState };
    axes.map(axis => {
      if (normalized.includes(axis)) {
        movement[axis] = target[axis];
      }
    });
    moves.push(movement);
    lastState = movement;
  });
  return moves;
};
