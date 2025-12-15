const { supabase } = require('../config/database');
const axios = require('axios');

class RouteService {
  // Create a new route
  async createRoute(userId, routeData) {
    const { name, description, difficulty, road_type, is_public = false, waypoints } = routeData;

    // Validate waypoints
    if (!waypoints || waypoints.length < 2) {
      throw new Error('Route must have at least 2 waypoints (start and end)');
    }

    try {
      // Calculate distance and duration using routing service
      const routeInfo = await this.calculateRoadDistance(waypoints);
      const distance_km = routeInfo.distance;
      const estimated_duration_minutes = routeInfo.duration;

      // Insert route
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .insert({
          user_id: userId,
          name,
          description,
          distance_km,
          estimated_duration_minutes,
          difficulty,
          road_type,
          is_public,
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Insert waypoints
      const waypointsToInsert = waypoints.map((waypoint, i) => {
        const stop_type = i === 0 ? 'start' : i === waypoints.length - 1 ? 'end' : 'waypoint';
        return {
          route_id: route.id,
          sequence_order: i,
          latitude: waypoint.latitude,
          longitude: waypoint.longitude,
          name: waypoint.name || null,
          description: waypoint.description || null,
          stop_type,
        };
      });

      const { error: waypointsError } = await supabase
        .from('route_waypoints')
        .insert(waypointsToInsert);

      if (waypointsError) {
        // Rollback: delete the route if waypoints insertion fails
        await supabase.from('routes').delete().eq('id', route.id);
        throw waypointsError;
      }

      // Fetch complete route with waypoints
      return await this.getRouteById(route.id, userId);
    } catch (error) {
      throw error;
    }
  }

  // Get route by ID
  async getRouteById(routeId, userId = null) {
    const { data: route, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        creator:users!routes_user_id_fkey(full_name, username)
      `
      )
      .eq('id', routeId)
      .or(`is_public.eq.true,user_id.eq.${userId || 0}`)
      .single();

    if (error || !route) {
      return null;
    }

    // Get waypoints
    const { data: waypoints } = await supabase
      .from('route_waypoints')
      .select('*')
      .eq('route_id', routeId)
      .order('sequence_order');

    route.waypoints = waypoints || [];
    route.creator_name = route.creator?.full_name;
    route.creator_username = route.creator?.username;
    delete route.creator;

    return route;
  }

  // Get all routes (with filters)
  async getRoutes(filters = {}) {
    const { userId, isPublic, difficulty, limit = 50, offset = 0 } = filters;

    let query = `
      SELECT r.*, u.full_name as creator_name, u.username as creator_username,
             (SELECT COUNT(*) FROM route_waypoints WHERE route_id = r.id) as waypoint_count
      FROM routes r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND r.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (isPublic !== undefined) {
      query += ` AND r.is_public = $${paramCount}`;
      params.push(isPublic);
      paramCount++;
    }

    if (difficulty) {
      query += ` AND r.difficulty = $${paramCount}`;
      params.push(difficulty);
      paramCount++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Update route
  async updateRoute(routeId, userId, isAdmin, updateData) {
    const route = await this.getRouteById(routeId, userId);

    if (!route) {
      throw new Error('Route not found');
    }

    // Check permissions
    if (route.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to update this route');
    }

    const { name, description, difficulty, road_type, is_public, waypoints } = updateData;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update route metadata
      const updateFields = [];
      const updateParams = [routeId];
      let paramCount = 2;

      if (name !== undefined) {
        updateFields.push(`name = $${paramCount}`);
        updateParams.push(name);
        paramCount++;
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramCount}`);
        updateParams.push(description);
        paramCount++;
      }
      if (difficulty !== undefined) {
        updateFields.push(`difficulty = $${paramCount}`);
        updateParams.push(difficulty);
        paramCount++;
      }
      if (road_type !== undefined) {
        updateFields.push(`road_type = $${paramCount}`);
        updateParams.push(road_type);
        paramCount++;
      }
      if (is_public !== undefined) {
        updateFields.push(`is_public = $${paramCount}`);
        updateParams.push(is_public);
        paramCount++;
      }

      if (updateFields.length > 0) {
        await client.query(
          `UPDATE routes SET ${updateFields.join(', ')} WHERE id = $1`,
          updateParams
        );
      }

      // Update waypoints if provided
      if (waypoints && waypoints.length >= 2) {
        // Delete old waypoints
        await client.query('DELETE FROM route_waypoints WHERE route_id = $1', [routeId]);

        // Insert new waypoints
        const distance_km = this.calculateDistance(waypoints);
        const estimated_duration_minutes = Math.round(distance_km * 2);

        await client.query(
          'UPDATE routes SET distance_km = $1, estimated_duration_minutes = $2 WHERE id = $3',
          [distance_km, estimated_duration_minutes, routeId]
        );

        for (let i = 0; i < waypoints.length; i++) {
          const waypoint = waypoints[i];
          const stop_type = i === 0 ? 'start' : i === waypoints.length - 1 ? 'end' : 'waypoint';

          await client.query(
            `INSERT INTO route_waypoints (route_id, sequence_order, latitude, longitude, name, description, stop_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              routeId,
              i,
              waypoint.latitude,
              waypoint.longitude,
              waypoint.name || null,
              waypoint.description || null,
              stop_type,
            ]
          );
        }
      }

      await client.query('COMMIT');

      return await this.getRouteById(routeId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete route
  async deleteRoute(routeId, userId, isAdmin) {
    const route = await pool.query('SELECT user_id FROM routes WHERE id = $1', [routeId]);

    if (route.rows.length === 0) {
      throw new Error('Route not found');
    }

    // Check permissions
    if (route.rows[0].user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this route');
    }

    await pool.query('DELETE FROM routes WHERE id = $1', [routeId]);
    return true;
  }

  // Calculate distance between waypoints (Haversine formula)
  calculateDistance(waypoints) {
    let totalDistance = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const lat1 = waypoints[i].latitude;
      const lon1 = waypoints[i].longitude;
      const lat2 = waypoints[i + 1].latitude;
      const lon2 = waypoints[i + 1].longitude;

      const R = 6371; // Earth's radius in km
      const dLat = this.toRadians(lat2 - lat1);
      const dLon = this.toRadians(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRadians(lat1)) *
          Math.cos(this.toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      totalDistance += distance;
    }

    return Math.round(totalDistance * 100) / 100; // Round to 2 decimals
  }

  // Calculate actual road distance and duration using OSRM routing service (free)
  async calculateRoadDistance(waypoints) {
    try {
      // Build OSRM route request URL
      const coordinates = waypoints.map((wp) => `${wp.longitude},${wp.latitude}`).join(';');

      const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;

      const response = await axios.get(osrmUrl, { timeout: 5000 });

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        // OSRM returns distance in meters and duration in seconds
        const distanceKm = Math.round(route.distance / 10) / 100; // Convert m to km, round to 2 decimals
        const durationMinutes = Math.round(route.duration / 60); // Convert seconds to minutes
        return { distance: distanceKm, duration: durationMinutes };
      }

      // Fallback
      const distance = this.calculateDistance(waypoints);
      return { distance, duration: Math.round(distance * 2) };
    } catch (error) {
      console.error('OSRM routing failed, using straight-line distance:', error.message);
      const distance = this.calculateDistance(waypoints);
      return { distance, duration: Math.round(distance * 2) };
    }
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Export route to GPX format
  async exportToGPX(routeId, userId) {
    const route = await this.getRouteById(routeId, userId);

    if (!route) {
      throw new Error('Route not found');
    }

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="motoR" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${this.escapeXml(route.name)}</name>
    <desc>${this.escapeXml(route.description || '')}</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${this.escapeXml(route.name)}</name>
    <desc>${this.escapeXml(route.description || '')}</desc>
    <trkseg>
${route.waypoints
  .map(
    (wp) =>
      `      <trkpt lat="${wp.latitude}" lon="${wp.longitude}">
        <name>${this.escapeXml(wp.name || '')}</name>
        <desc>${this.escapeXml(wp.description || '')}</desc>
      </trkpt>`
  )
  .join('\n')}
    </trkseg>
  </trk>
</gpx>`;

    return gpx;
  }

  escapeXml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

module.exports = new RouteService();
