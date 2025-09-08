module Tools
  class Create < Mutations::Command
    required do
      string :name
      model :device, class: Device
    end

    optional do
      integer :flow_rate_ml_per_s
      float :seeder_tip_z_offset
    end

    def execute
      Tool.create!(inputs)
    end
  end
end
