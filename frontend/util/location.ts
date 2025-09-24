import { AxisState, Xyz } from "farmbot";
import { BotLocationData } from "../devices/interfaces";
import { forceOnline } from "../devices/must_be_online";
import { fullLocationData } from "./util";

type NumberRecord = Record<Xyz, number | undefined>;

export interface ValidLocationData {
  position: NumberRecord;
  scaled_encoders: NumberRecord;
  raw_encoders: NumberRecord;
  load: NumberRecord;
  axis_states: Record<Xyz, AxisState | undefined>;
}

export function validBotLocationData(
  botLocationData: BotLocationData | undefined,
  isExpress?: boolean,
): ValidLocationData {
  if (forceOnline()) {
    const load = isExpress ? 0 : undefined;
    return {
      position: {
        x: botLocationData?.position.x ?? 0,
        y: botLocationData?.position.y ?? 0,
        z: botLocationData?.position.z ?? 0,
      },
      scaled_encoders: { x: 0, y: 0, z: 0 },
      raw_encoders: { x: 0, y: 0, z: 0 },
      load: { x: load, y: load, z: load },
      axis_states: { x: "idle", y: "idle", z: "idle" },
    };
  }
  return fullLocationData(botLocationData);
}
