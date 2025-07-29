import React from "react";
import { Row, Help, FBSelect, DropDownItem } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { ToolTips } from "../../../constants";
import { Move, AxisOrder } from "farmbot";
import {
  AxisGrouping, AxisOrderInputRowProps, AxisRoute,
} from "./interfaces";

export const axisOrder = (
  grouping: AxisGrouping,
  route: AxisRoute,
): AxisOrder[] =>
  !(grouping && route) ? [] : [{ kind: "axis_order", args: { grouping, route } }];

export const AxisOrderInputRow = (props: AxisOrderInputRowProps) =>
  <Row className={"row move-location-grid"}>
    <div className={"row"}>
      <label className={"axis-order"}>{t("Axis Order")}</label>
      <Help text={ToolTips.AXIS_ORDER} customClass={"help-icon"} />
    </div>
    <FBSelect
      selectedItem={getSelectedItem(props.safeZ, props.grouping, props.route)}
      list={DDIS()}
      allowEmpty={true}
      onChange={props.onChange} />
  </Row>;

const getSelectedItem = (
  safeZ: boolean,
  grouping: AxisGrouping,
  route: AxisRoute,
) => {
  if (safeZ) { return DDI_LOOKUP().safe_z; }
  if (grouping && route) { return DDI_LOOKUP()[ddiValue(grouping, route)]; }
  return undefined;
};

const ddiValue = (grouping: AxisGrouping, route: AxisRoute): string =>
  [grouping, route].join(";");

const DDIS = (): DropDownItem[] => [
  DDI_LOOKUP().safe_z,
  DDI_LOOKUP()[ddiValue("x,y,z", "high")],
  DDI_LOOKUP()[ddiValue("xy,z", "high")],
];

const getLabel = (value: string): string => {
  switch (value) {
    case ddiValue("x,y,z", "high"):
      return t("One at a time");
    case ddiValue("xy,z", "high"):
      return t("X and Y together");
    case ddiValue("xyz", "high"):
      return t("All at once");
    case "safe_z":
      return t("Safe Z");
    default:
      return value;
  }
};

const GROUPINGS: AxisGrouping[] = [
  "x",
  "x,y",
  "x,y,z",
  "x,yz",
  "x,z",
  "x,z,y",
  "xy",
  "xy,z",
  "xyz",
  "xz",
  "xz,y",
  "y",
  "y,x",
  "y,x,z",
  "y,xz",
  "y,z",
  "y,z,x",
  "yz",
  "yz,x",
  "z",
  "z,x",
  "z,x,y",
  "z,xy",
  "z,y",
  "z,y,x",
];

const ROUTES: AxisRoute[] = [
  "high",
  "low",
  "in_order",
];

const getAllDdiValues = (): string[] => {
  const ddiValues: string[] = ["safe_z"];
  GROUPINGS.map(grouping =>
    ROUTES.map(route => {
      ddiValues.push(ddiValue(grouping, route));
    }));
  return ddiValues;
};

const DDI_LOOKUP = (): Record<string, DropDownItem> => {
  return getAllDdiValues()
    .reduce(
      (acc, value) => {
        acc[value] = { label: getLabel(value), value };
        return acc;
      },
      {} as Record<string, DropDownItem>);
};

export const getAxisGroupingState = (step: Move) => {
  const axisOrder = step.body?.find(x => x.kind == "axis_order");
  if (axisOrder?.kind == "axis_order") {
    return axisOrder.args.grouping;
  }
};

export const getAxisRouteState = (step: Move) => {
  const axisOrder = step.body?.find(x => x.kind == "axis_order");
  if (axisOrder?.kind == "axis_order") {
    return axisOrder.args.route;
  }
};

export const getNewAxisOrderState = (ddi: DropDownItem) => {
  const safeZ = ddi.value == "safe_z";
  const [grouping, route] = ("" + ddi.value).split(";");
  return {
    axisGrouping: safeZ ? undefined : grouping as AxisGrouping,
    axisRoute: safeZ ? undefined : route as AxisRoute,
    safeZ,
  };
};
