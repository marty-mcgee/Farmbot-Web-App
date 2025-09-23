require "spec_helper"

describe "Rack::Attack configuration" do
  it "has correct throttling limits for demo accounts" do
    # Find the demo_accounts/ip throttle configuration
    demo_throttle = nil
    Rack::Attack.throttles.each do |name, throttle|
      if name == "demo_accounts/ip"
        demo_throttle = throttle
        break
      end
    end

    expect(demo_throttle).to be_present, "demo_accounts/ip throttle should be configured"
    expect(demo_throttle.limit).to eq(50), "limit should be 50 requests"
    expect(demo_throttle.period).to eq(1.hour), "period should be 1 hour"
  end

  it "applies throttling only to demo and try_farmbot paths" do
    # Create a mock request
    mock_request = double("request", path: "/demo", ip: "192.168.1.1")
    
    # Find and test the demo throttle block
    demo_throttle = nil
    Rack::Attack.throttles.each do |name, throttle|
      if name == "demo_accounts/ip"
        demo_throttle = throttle
        break
      end
    end

    # Test the block returns IP for demo path
    result = demo_throttle.block.call(mock_request)
    expect(result).to eq("192.168.1.1")

    # Test for try_farmbot path
    mock_request_try = double("request", path: "/try_farmbot", ip: "192.168.1.2")
    result_try = demo_throttle.block.call(mock_request_try)
    expect(result_try).to eq("192.168.1.2")

    # Test that other paths return nil (not throttled)
    mock_request_other = double("request", path: "/other", ip: "192.168.1.3")
    result_other = demo_throttle.block.call(mock_request_other)
    expect(result_other).to be_nil
  end
end