class AddSeederTipZOffset < ActiveRecord::Migration[6.1]
  def up
    add_column :tools, :seeder_tip_z_offset, :float, default: 80
  end

  def down
    remove_column :tools, :seeder_tip_z_offset
  end
end
