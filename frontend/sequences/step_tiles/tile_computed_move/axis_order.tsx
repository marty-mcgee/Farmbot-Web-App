import React from "react";
import { Row, Help, FBSelect, DropDownItem } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { ToolTips } from "../../../constants";
import { Move, AxisOrder } from "farmbot";
import { AxisOrderInputRowProps } from "./interfaces";

export const axisOrder = (
  order: string | undefined,
): AxisOrder[] =>
  !order ? [] : [{ kind: "axis_order", args: { order } }];

export const AxisOrderInputRow = (props: AxisOrderInputRowProps) =>
  <Row className={"row move-location-grid"}>
    <div className={"row"}>
      <label className={"axis-order"}>{t("Axis Order")}</label>
      <Help text={ToolTips.AXIS_ORDER} customClass={"help-icon"} />
    </div>
    <FBSelect
      selectedItem={getSelectedItem(props.safeZ, props.order)}
      list={DDIS()}
      allowEmpty={true}
      onChange={props.onChange} />
  </Row>;

const getSelectedItem = (safeZ: boolean, order: string | undefined) => {
  if (safeZ) { return DDI_LOOKUP()["safe_z"]; }
  if (order) { return DDI_LOOKUP()[order]; }
  return undefined;
};

const DDIS = (): DropDownItem[] => [
  DDI_LOOKUP().safe_z,
  DDI_LOOKUP()["z,y,x"],
  DDI_LOOKUP()["z,xy"],
];

const DDI_LOOKUP = (): Record<string, DropDownItem> => ({
  safe_z: { label: t("Safe Z"), value: "safe_z" },
  ["z,y,x"]: { label: t("Z then Y then X"), value: "z,y,x" },
  ["z,xy"]: { label: t("Z then X and Y"), value: "z,xy" },
  ["xyz"]: { label: t("X and Y and Z"), value: "xyz" },
});

export const getAxisOrderState = (step: Move) => {
  const axisOrder = step.body?.find(x => x.kind == "axis_order");
  if (axisOrder?.kind == "axis_order") {
    return axisOrder.args.order;
  }
};

export const getNewAxisOrderState = (ddi: DropDownItem) => {
  const safeZ = ddi.value == "safe_z";
  const axisOrder = "" + ddi.value;
  return { axisOrder: safeZ ? undefined : axisOrder, safeZ };
};
