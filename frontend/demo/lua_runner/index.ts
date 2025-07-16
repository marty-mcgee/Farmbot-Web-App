import { findSequenceById } from "../../resources/selectors";
import { ResourceIndex } from "../../resources/interfaces";
import { ParameterApplication, SequenceBodyItem } from "farmbot";
import { runLua } from "./run";
import { runActions } from "./actions";
import { Action } from "./interfaces";
import { csToLua } from "./util";
import { error } from "../../toast/toast";

export const runDemoLuaCode = (luaCode: string) => {
  const actions = runLua(0, luaCode, []);
  runActions(actions, []);
};

export const collectDemoSequenceActions = (
  depth: number,
  resources: ResourceIndex,
  sequenceId: number,
  variables: ParameterApplication[] | undefined,
) => {
  console.log(`Call depth: ${depth}`);
  if (depth > 100) {
    error("Maximum call depth exceeded.");
    return [];
  }
  const sequence = findSequenceById(resources, sequenceId);
  const actions: Action[] = [];
  (sequence.body.body as SequenceBodyItem[]).map(step => {
    if (step.kind == "execute") {
      const seqActions = collectDemoSequenceActions(
        depth + 1,
        resources,
        step.args.sequence_id,
        step.body);
      actions.push(...seqActions);
    } else {
      const lua = step.kind === "lua" ? step.args.lua : csToLua(step);
      const stepActions = runLua(depth, lua, variables || []);
      actions.push(...stepActions);
    }
  });
  return actions;
};

export const runDemoSequence = (
  resources: ResourceIndex,
  sequenceId: number,
  variables: ParameterApplication[] | undefined,
) => {
  const actions = collectDemoSequenceActions(0, resources, sequenceId, variables);
  runActions(actions, variables);
};

export { csToLua };
