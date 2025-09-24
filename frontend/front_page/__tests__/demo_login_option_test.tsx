let mockResponse: string | Error = "12345";
jest.mock("axios", () => ({
  post: jest.fn(() =>
    typeof mockResponse === "string"
      ? Promise.resolve(mockResponse)
      : Promise.reject(mockResponse)),
}));

const mockMqttClient = {
  on: jest.fn((ev: string, cb: Function) => ev == "connect" && cb()),
  subscribe: jest.fn(),
};

jest.mock("mqtt", () => ({ connect: () => mockMqttClient }));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { shallow } from "enzyme";
import { DemoLoginOption } from "../demo_login_option";
import axios from "axios";
import { MQTT_CHAN } from "../../demo/demo_iframe";

describe("<DemoLoginOption />", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders demo controls", () => {
    mockResponse = "ok";
    render(<DemoLoginOption />);
    expect(screen.getByRole("heading", { name: /demo the app/i }))
      .toBeInTheDocument();
    expect(screen.getByRole("button", { name: /demo the app/i }))
      .toBeInTheDocument();
    expect(screen.getByText(/farmbot model/i)).toBeInTheDocument();
  });

  it("requests a demo account on click", async () => {
    mockResponse = "ok";

    render(<DemoLoginOption />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /demo the app/i }));

    await waitFor(() =>
      expect(mockMqttClient.subscribe)
        .toHaveBeenCalledWith(MQTT_CHAN, expect.any(Function)));
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "/api/demo_account",
        expect.objectContaining({ product_line: expect.any(String) })));
  });

  it("changes model", () => {
    const wrapper = shallow<DemoLoginOption>(<DemoLoginOption />);
    expect(wrapper.state().productLine).toEqual("genesis_1.8");
    wrapper.find("FBSelect").simulate("change", { value: "express_1.2" });
    expect(wrapper.state().productLine).toEqual("express_1.2");
  });
});
