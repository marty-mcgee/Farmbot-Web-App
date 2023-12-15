import React from "react";
import { Position } from "@blueprintjs/core";
import { t } from "../../../i18next_wrapper";
import { DeviceSetting } from "../../../constants";
import { getModifiedClassName } from "../../../settings/default_values";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { Popover } from "../../../ui";

export interface LayerToggleProps {
  settingName: BooleanConfigKey;
  label: DeviceSetting;
  value: boolean | undefined;
  onClick(): void;
  popover?: JSX.Element | undefined;
  submenuTitle?: string;
}

/** A flipper type switch for showing/hiding the layers of the garden map. */
export function LayerToggle(props: LayerToggleProps) {
  const { label, value, onClick, popover, submenuTitle } = props;
  const title = submenuTitle || t("more");
  const classNames = [
    "fb-button",
    "fb-toggle-button",
    value ? "green" : "red",
    getModifiedClassName(props.settingName),
  ].join(" ");
  return <fieldset>
    <label>
      <span>
        {t(label)}
        {popover &&
          <Popover
            position={Position.BOTTOM_RIGHT}
            className={"caret-menu-button"}
            target={<i className={"fa fa-caret-down fb-icon-button"}
              title={t(title)} />}
            content={popover} />}
      </span>
    </label>
    <button className={classNames} onClick={onClick}
      title={`${value ? t("hide") : t("show")} ${t(label.replace("?", ""))}`} />
  </fieldset>;
}
