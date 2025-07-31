import { lua, to_jsstring, to_luastring } from "fengari-web";
import { Action } from "./interfaces";
import { RpcRequestBodyItem } from "farmbot";
import { maybeFindPeripheralById } from "../../resources/selectors_by_id";
import { store } from "../../redux/store";

export const createRecursiveNotImplemented = (
  L: unknown,
  actions: Action[],
  path: string[],
) => {
  lua.lua_newtable(L);
  lua.lua_newtable(L);
  lua.lua_pushjsfunction(L, () => {
    const key = luaToJs(L, 2) as string;
    return createRecursiveNotImplemented(L, actions, [...path, key]);
  });
  lua.lua_setfield(L, -2, to_luastring("__index"));

  lua.lua_pushjsfunction(L, () => {
    const fullPath = path.join(".");
    actions.push({
      type: "send_message",
      args: [
        "error",
        `Lua function "${fullPath}" is not implemented.`,
      ],
    });
    jsToLua(L, false);
    return 1;
  });
  lua.lua_setfield(L, -2, to_luastring("__call"));

  lua.lua_setmetatable(L, -2);
  return 1;
};

export const luaToJs = (L: unknown, idx: number): unknown => {
  const type = lua.lua_type(L, idx);
  switch (type) {
    case lua.LUA_TNIL:
      return undefined;
    case lua.LUA_TBOOLEAN:
      return lua.lua_toboolean(L, idx);
    case lua.LUA_TNUMBER:
      return lua.lua_tonumber(L, idx);
    case lua.LUA_TSTRING:
      return to_jsstring(lua.lua_tostring(L, idx));
    case lua.LUA_TTABLE:
      return luaTableToJs(L, idx);
    default:
      return `<${to_jsstring(lua.lua_typename(L, type))}>`;
  }
};

const luaTableToJs = (L: unknown, idx: number): unknown => {
  const absIndex = lua.lua_absindex(L, idx);
  const keyVals: [string | number, unknown][] = [];

  lua.lua_pushnil(L);
  while (lua.lua_next(L, absIndex)) {
    const key = luaToJs(L, -2) as (string | number);
    const val = luaToJs(L, -1);
    keyVals.push([key, val]);
    lua.lua_pop(L, 1);
  }
  const isArrayLike =
    keyVals.every(([k]) => typeof k === "number");
  if (isArrayLike) {
    return keyVals.map(([, v]) => v).filter(v => v !== undefined);
  } else {
    const result: Record<string, unknown> = {};
    for (const [key, value] of keyVals) {
      result["" + key] = value;
    }
    return result;
  }
};

export const jsToLua = (L: unknown, value: unknown): void => {
  if (value === undefined) {
    lua.lua_pushnil(L);
  } else if (typeof value === "boolean") {
    lua.lua_pushboolean(L, value);
  } else if (typeof value === "number") {
    lua.lua_pushnumber(L, value);
  } else if (typeof value === "string") {
    lua.lua_pushstring(L, to_luastring(value));
  } else if (Array.isArray(value)) {
    lua.lua_newtable(L);
    for (let i = 0; i < value.length; i++) {
      jsToLua(L, value[i]);
      lua.lua_rawseti(L, -2, i + 1);
    }
  } else if (typeof value === "object") {
    lua.lua_newtable(L);
    for (const key in value) {
      jsToLua(L, (value as Record<string, unknown>)[key]);
      lua.lua_setfield(L, -2, to_luastring(key));
    }
  } else {
    jsToLua(L, `<${typeof value}>`);
  }
};

// eslint-disable-next-line complexity
export const csToLua = (command: RpcRequestBodyItem): string => {
  const { kind, args, body } = command;
  switch (kind) {
    case "emergency_lock":
      return "emergency_lock()";
    case "emergency_unlock":
      return "emergency_unlock()";
    case "find_home":
      return `find_home("${args.axis}")`;
    case "home":
      return `go_to_home("${args.axis}")`;
    case "wait":
      return `wait(${args.milliseconds})`;
    case "send_message":
      return `send_message("${args.message_type}", "${args.message}")`;
    case "take_photo":
      return "take_photo()";
    case "execute_script":
      if (args.label == "plant-detection") {
        return "detect_weeds()";
      }
      if (args.label == "Measure Soil Height") {
        return "measure_soil_height()";
      }
      return "";
    case "move_relative":
      return `move_relative(${args.x}, ${args.y}, ${args.z})`;
    case "move_absolute":
      const lKind = args.location.kind;
      if (lKind == "coordinate") {
        const cArgs = args.location.args;
        return `move_absolute(${cArgs.x}, ${cArgs.y}, ${cArgs.z})`;
      }
      return `toast("move_absolute ${lKind} is not implemented", "error")`;
    case "move":
      const jsonString = JSON.stringify(JSON.stringify(body || []));
      return `_move(${jsonString})`;
    case "write_pin":
      let pin = undefined;
      if (typeof args.pin_number == "object") {
        const namedPin = maybeFindPeripheralById(
          store.getState().resources.index,
          args.pin_number.args.pin_id);
        if (!namedPin) { return ""; }
        pin = namedPin.body.pin;
      } else {
        pin = args.pin_number;
      }
      const mode = args.pin_mode ? "analog" : "digital";
      return `write_pin(${pin}, "${mode}", ${args.pin_value})`;
    case "toggle_pin":
      return `toggle_pin(${args.pin_number})`;
    case "lua":
      return args.lua;
    default:
      return `toast("celeryscript ${kind} is not implemented", "error")`;
  }
};
