import React from "react";
import { DemoAccountBase } from "../demo/demo_iframe";
import { t } from "../i18next_wrapper";
import { FBSelect, Widget, WidgetBody, WidgetHeader } from "../ui";
import { SEED_DATA_OPTIONS, SEED_DATA_OPTIONS_DDI } from "../messages/cards";

export class DemoLoginOption extends DemoAccountBase {
  ok = () => {
    const selection = this.state.productLine;
    return <Widget>
      <WidgetHeader title={t("Demo the app")} />
      <WidgetBody>
        <div className="demo-widget-body grid">
          <div>
            <label>{t("FarmBot Model").toUpperCase()}</label>
            <FBSelect
              key={selection}
              extraClass={"demo-widget-select"}
              list={SEED_DATA_OPTIONS(true).filter(x => x.value != "none")}
              customNullLabel={t("Select a model")}
              selectedItem={SEED_DATA_OPTIONS_DDI()[selection]}
              onChange={ddi => this.setState({ productLine: "" + ddi.value })} />
          </div>
          <div className="demo-widget-actions">
            <button className="fb-button dark-blue"
              type="button"
              title={t("demo the app")}
              onClick={this.requestAccount}>
              {this.state.stage}
            </button>
          </div>
        </div>
      </WidgetBody>
    </Widget>;
  };
}
