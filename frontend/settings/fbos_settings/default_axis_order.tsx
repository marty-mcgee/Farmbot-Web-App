import React from "react";
import { t } from "../../i18next_wrapper";
import { Row, Help, FBSelect } from "../../ui";
import { DeviceSetting, ToolTips } from "../../constants";
import { Highlight } from "../maybe_highlight";
import { DefaultAxisOrderProps } from "./interfaces";
import { getModifiedClassName } from "./default_values";
import {
  getAxisOrderOptions,
  getSelectedAxisOrder,
} from "../../sequences/step_tiles/tile_computed_move/axis_order";
import {
  AxisGrouping, AxisRoute,
} from "../../sequences/step_tiles/tile_computed_move/interfaces";
import { updateConfig } from "../../devices/actions";

export const DefaultAxisOrder = (props: DefaultAxisOrderProps) => {
  const value = props.sourceFbosConfig("default_axis_order").value as string;
  const modified = getModifiedClassName("default_axis_order", value, undefined);
  const safeZ = value === "safe_z";
  const [grouping, route] = value.split(";") as [AxisGrouping, AxisRoute];
  return <Highlight settingName={DeviceSetting.defaultAxisOrder}>
    <Row>
      <div>
        <label>
          {t(DeviceSetting.defaultAxisOrder)}
        </label>
        <Help text={ToolTips.DEFAULT_AXIS_ORDER} />
      </div>
      <FBSelect
        extraClass={modified}
        selectedItem={getSelectedAxisOrder(safeZ, grouping, route)}
        list={getAxisOrderOptions()}
        onChange={ddi => {
          props.dispatch(updateConfig({ default_axis_order: "" + ddi.value }));
        }} />
    </Row>
  </Highlight>;
};
