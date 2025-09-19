import React from "react";
import { DemoAccountBase } from "../demo/demo_iframe";
import { t } from "../i18next_wrapper";
import { Widget, WidgetBody, WidgetHeader } from "../ui";

export class DemoLoginOption extends DemoAccountBase {
  ok = () => {
    return <Widget>
      <WidgetHeader title={t("Demo the app")} />
      <WidgetBody>
        <div className="demo-widget-body grid">
          <div>
            <label>{t("FarmBot Model").toUpperCase()}</label>
            {this.seedDataSelect()}
          </div>
          <div className="demo-widget-actions">
            {this.demoButton("fb-button dark-blue")}
          </div>
        </div>
      </WidgetBody>
    </Widget>;
  };
}
