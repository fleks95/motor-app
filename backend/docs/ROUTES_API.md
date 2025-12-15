# Routes Feature Implementation

## Overview

Backend implementation for motorcycle route management with GPX export functionality.

## Database Setup

Run the migration in your Supabase SQL editor:

```sql
-- Copy and paste the contents of backend/migrations/003_create_routes_tables.sql
```

This creates:

- `routes` table - stores route metadata
- `route_waypoints` table - stores GPS coordinates for each route
- `route_photos` table - optional, for future photo uploads
- `route_ratings` table - optional, for user reviews
- Adds `is_admin` column to `users` table

## API Endpoints

### Public Endpoints

- `GET /api/v1/routes` - Get all public routes (with filters)
- `GET /api/v1/routes/:id` - Get specific route details
- `GET /api/v1/routes/:id/export/gpx` - Export route as GPX file

### Protected Endpoints (require authentication)

- `POST /api/v1/routes` - Create new route
- `GET /api/v1/routes/user/me` - Get current user's routes
- `PUT /api/v1/routes/:id` - Update route (owner or admin only)
- `DELETE /api/v1/routes/:id` - Delete route (owner or admin only)

## Creating a Route

**POST** `/api/v1/routes`

```json
{
  "name": "Pacific Coast Highway",
  "description": "Scenic coastal ride with ocean views",
  "difficulty": "moderate",
  "road_type": "scenic",
  "is_public": true,
  "waypoints": [
    {
      "latitude": 34.0522,
      "longitude": -118.2437,
      "name": "Los Angeles Start",
      "description": "Starting point"
    },
    {
      "latitude": 34.4208,
      "longitude": -119.6982,
      "name": "Santa Barbara",
      "description": "Lunch stop"
    },
    {
      "latitude": 36.6002,
      "longitude": -121.8947,
      "name": "Monterey End",
      "description": "Destination"
    }
  ]
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Pacific Coast Highway",
    "description": "Scenic coastal ride with ocean views",
    "distance_km": 520.45,
    "estimated_duration_minutes": 1040,
    "difficulty": "moderate",
    "road_type": "scenic",
    "is_public": true,
    "creator_name": "John Doe",
    "creator_username": "johndoe",
    "waypoints": [...]
  },
  "message": "Route created successfully"
}
```

## Query Parameters

**GET** `/api/v1/routes?user_id=<uuid>&is_public=true&difficulty=moderate&limit=20&offset=0`

- `user_id` - Filter by creator
- `is_public` - Filter by visibility (true/false)
- `difficulty` - Filter by difficulty (easy, moderate, hard, expert)
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset (default: 0)

## Difficulty Levels

- `easy` - Gentle roads, suitable for beginners
- `moderate` - Some curves and elevation changes
- `hard` - Challenging roads with tight curves
- `expert` - Very technical, experienced riders only

## GPX Export

**GET** `/api/v1/routes/:id/export/gpx`

Returns a GPX file that can be imported into:

- Google Maps
- Apple Maps
- Waze
- Garmin devices
- TomTom
- Any GPS navigation app

## Permissions

- **Users** can:
  - Create routes
  - View public routes
  - View their own private routes
  - Edit/delete their own routes

- **Admins** can:
  - Edit any route
  - Delete any route
  - Change route visibility

## Distance Calculation

The service automatically calculates route distance using the Haversine formula, which provides accurate distance between GPS coordinates on Earth's surface.

## Next Steps (TODO)

1. **Google Maps URL Import** - Parse Google Maps share links to extract waypoints
2. **Route Photos** - Upload and attach photos to waypoints
3. **Route Ratings** - Allow users to rate and review routes
4. **Search Functionality** - Full-text search by name/description
5. **Route Cloning** - Allow users to copy and modify existing routes
6. **Elevation Data** - Integrate elevation profiles
7. **Weather Integration** - Show current weather along route
