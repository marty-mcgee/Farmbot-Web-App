class ChangeSoilHeightDefault < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:fbos_configs, :soil_height, from: 0, to: -500)
  end
end
