# Admin & Google Maps Import Setup

## Admin System

### How Admin Works

1. **Admin Field**: The `is_admin` field in the users table determines admin status
2. **JWT Token**: Admin status is included in the JWT token payload
3. **Middleware**: Use `requireAdmin` middleware to protect admin-only routes

### Making a User Admin

Since we don't have a UI yet, you can promote a user to admin directly in Supabase:

```sql
-- Find your user
SELECT id, email, full_name, is_admin FROM users;

-- Make a user admin
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

### Admin Features

- **All User Permissions** - Everything regular users can do
- **Edit Any Route** - Can modify routes created by other users
- **Delete Any Route** - Can remove any route from the system
- **Future**: Manage users, moderate content, view analytics

### How to Check if User is Admin

The auth response now includes `is_admin`:

```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "full_name": "Admin User",
      "is_admin": true // <-- This field
    },
    "token": "jwt-token",
    "expiresIn": 3600
  }
}
```

---

## Google Maps Import

### Supported URL Formats

The system can parse these Google Maps URL types:

1. **Directions with Multiple Stops**

   ```
   https://www.google.com/maps/dir/Los+Angeles,+CA/Santa+Barbara,+CA/Monterey,+CA/@34.4208,-119.6982,7z
   ```

2. **Single Place**

   ```
   https://www.google.com/maps/place/Golden+Gate+Bridge/@37.8199,-122.4783,17z
   ```

3. **Shortened Links** (goo.gl)

   ```
   https://maps.app.goo.gl/abc123
   ```

4. **Coordinate URLs**
   ```
   https://www.google.com/maps/@37.7749,-122.4194,14z
   ```

### How to Use

**POST** `/api/v1/routes/import/google-maps`

```json
{
  "url": "https://www.google.com/maps/dir/Location1/Location2/Location3",
  "name": "My Imported Route",
  "description": "Route imported from Google Maps",
  "difficulty": "moderate",
  "road_type": "scenic",
  "is_public": true
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "My Imported Route",
    "waypoints": [
      {
        "latitude": 34.0522,
        "longitude": -118.2437,
        "name": "Location1",
        "stop_type": "start"
      }
      // ... more waypoints
    ],
    "distance_km": 450.23,
    "estimated_duration_minutes": 900
  },
  "message": "Route imported successfully from Google Maps"
}
```

### How to Get a Google Maps URL

1. **On Desktop**:
   - Plan your route in Google Maps
   - Click "Share" or copy the URL from the address bar
   - Paste into the import API

2. **On Mobile**:
   - Open route in Google Maps app
   - Tap "Share"
   - Copy link
   - Send to your backend (via app or curl)

### What Gets Extracted

- ✅ **GPS Coordinates** (latitude/longitude)
- ✅ **Location Names** (if available)
- ✅ **Waypoint Order** (maintained from Google Maps)
- ✅ **Automatic Distance Calculation**

### Limitations

- Must have at least 2 waypoints (start + end)
- Complex routes with many stops work best
- Some URLs may need coordinates visible in the URL
- If coordinates aren't in URL, you'll get an error asking for manual entry

---

## Testing

### 1. Test Admin Login

```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "full_name": "Test User"
  }'

# Check is_admin in response (should be false)

# Promote to admin in Supabase SQL editor:
# UPDATE users SET is_admin = true WHERE email = 'test@example.com';

# Login again
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'

# Check is_admin in response (should be true now)
```

### 2. Test Google Maps Import

```bash
# Get your JWT token from login response
TOKEN="your-jwt-token-here"

# Import a route
curl -X POST http://localhost:3000/api/v1/routes/import/google-maps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "url": "https://www.google.com/maps/dir/Los+Angeles,+CA/San+Francisco,+CA/@36.0,-120.0,7z",
    "name": "LA to SF",
    "difficulty": "easy",
    "is_public": true
  }'
```

---

## Next Steps

1. **Install Dependencies**:

   ```bash
   cd backend
   npm install axios
   ```

2. **Test the endpoints** with the examples above

3. **Frontend Integration**:
   - Add "Import from Google Maps" button
   - Paste URL input field
   - Show parsed waypoints before saving

4. **Future Enhancements**:
   - Geocoding API for location names without coordinates
   - Route optimization
   - Elevation data
   - Traffic/weather integration
