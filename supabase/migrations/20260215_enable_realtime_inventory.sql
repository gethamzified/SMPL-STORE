-- Enable Realtime for inventory_levels to support instant stock updates
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_levels;
