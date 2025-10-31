class AddAccountSeededAtToDevice < ActiveRecord::Migration[6.1]
  def up
    add_column :devices, :account_seeded_at, :datetime
  end

  def down
    remove_column :devices, :account_seeded_at
  end
end
