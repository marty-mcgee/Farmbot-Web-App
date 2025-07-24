import { Move, SafeZ } from "farmbot";

export const getSafeZState = (step: Move) => {
  const safeZ = step.body?.find(x => x.kind == "safe_z");
  return safeZ?.kind == "safe_z";
};

export const SAFE_Z: SafeZ = { kind: "safe_z", args: {} };
