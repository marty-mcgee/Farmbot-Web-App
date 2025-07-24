module Tools
  class Update < Mutations::Command
    required do
      model :tool, class: Tool
    end

    optional do
      string :name
      integer :flow_rate_ml_per_s
      float :seeder_tip_z_offset
    end

    def execute
      tool.update!(inputs.except(:tool)) && tool
    end
  end
end
