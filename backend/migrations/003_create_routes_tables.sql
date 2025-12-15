-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  distance_km DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'moderate', 'hard', 'expert')),
  road_type VARCHAR(100), -- e.g., 'scenic', 'highway', 'twisty', 'mixed'
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create route_waypoints table
CREATE TABLE IF NOT EXISTS route_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(11, 7) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  stop_type VARCHAR(50) CHECK (stop_type IN ('start', 'waypoint', 'end')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(route_id, sequence_order)
);

-- Create route_photos table (optional - for future use)
CREATE TABLE IF NOT EXISTS route_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  waypoint_id UUID REFERENCES route_waypoints(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create route_ratings table (optional - for future use)
CREATE TABLE IF NOT EXISTS route_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(route_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_routes_is_public ON routes(is_public);
CREATE INDEX idx_route_waypoints_route_id ON route_waypoints(route_id);
CREATE INDEX idx_route_waypoints_sequence ON route_waypoints(route_id, sequence_order);
CREATE INDEX idx_route_photos_route_id ON route_photos(route_id);
CREATE INDEX idx_route_ratings_route_id ON route_ratings(route_id);

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update timestamp trigger for routes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_ratings_updated_at BEFORE UPDATE ON route_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
