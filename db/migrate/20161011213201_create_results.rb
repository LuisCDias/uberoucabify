class CreateResults < ActiveRecord::Migration[5.0]
  def change
    create_table :results do |t|
      t.string :estimate
      t.float :distance
      t.float :average_estimate
      t.string :start_latitude
      t.string :start_longitude
      t.string :end_latitude
      t.string :end_longitude

      t.timestamps
    end
  end
end
