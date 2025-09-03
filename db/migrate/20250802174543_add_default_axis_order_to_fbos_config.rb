class AddDefaultAxisOrderToFbosConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :fbos_configs, :default_axis_order, :string, default: "xy,z;high", limit: 10
  end

  def down
    remove_column :fbos_configs, :default_axis_order
  end
end
