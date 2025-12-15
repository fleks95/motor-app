const request = require('supertest');
const app = require('../src/app');

describe('Routes API', () => {
  let authToken;
  let userId;
  let routeId;

  // Register and login before tests
  beforeAll(async () => {
    // Register a test user
    const registerRes = await request(app).post('/api/v1/auth/register').send({
      email: 'routetest@example.com',
      password: 'Test1234!',
      full_name: 'Route Tester',
    });

    authToken = registerRes.body.data.token;
    userId = registerRes.body.data.user.id;
  });

  describe('POST /api/v1/routes', () => {
    it('should create a new route with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Route',
          description: 'A test motorcycle route',
          difficulty: 'moderate',
          road_type: 'scenic',
          is_public: true,
          waypoints: [
            {
              latitude: 34.0522,
              longitude: -118.2437,
              name: 'Start Point',
            },
            {
              latitude: 34.4208,
              longitude: -119.6982,
              name: 'End Point',
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Route');
      expect(response.body.data.waypoints).toHaveLength(2);
      expect(response.body.data.distance_km).toBeGreaterThan(0);

      routeId = response.body.data.id;
    });

    it('should fail with less than 2 waypoints', async () => {
      const response = await request(app)
        .post('/api/v1/routes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Route',
          waypoints: [
            {
              latitude: 34.0522,
              longitude: -118.2437,
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('at least 2 waypoints');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/routes')
        .send({
          name: 'Test Route',
          waypoints: [
            { latitude: 34.0522, longitude: -118.2437 },
            { latitude: 34.4208, longitude: -119.6982 },
          ],
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/routes', () => {
    it('should get all public routes', async () => {
      const response = await request(app).get('/api/v1/routes');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('count');
    });

    it('should filter routes by difficulty', async () => {
      const response = await request(app).get('/api/v1/routes?difficulty=moderate');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/routes/:id', () => {
    it('should get a specific route by ID', async () => {
      const response = await request(app).get(`/api/v1/routes/${routeId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(routeId);
      expect(response.body.data.waypoints).toHaveLength(2);
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(app).get(
        '/api/v1/routes/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/routes/:id', () => {
    it('should update own route', async () => {
      const response = await request(app)
        .put(`/api/v1/routes/${routeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Route Name',
          difficulty: 'hard',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Route Name');
      expect(response.body.data.difficulty).toBe('hard');
    });

    it('should fail to update without authentication', async () => {
      const response = await request(app).put(`/api/v1/routes/${routeId}`).send({
        name: 'Unauthorized Update',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/routes/:id/export/gpx', () => {
    it('should export route as GPX file', async () => {
      const response = await request(app).get(`/api/v1/routes/${routeId}/export/gpx`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/gpx+xml');
      expect(response.text).toContain('<?xml version="1.0"');
      expect(response.text).toContain('<gpx');
      expect(response.text).toContain('Test Route');
    });
  });

  describe('DELETE /api/v1/routes/:id', () => {
    it('should delete own route', async () => {
      const response = await request(app)
        .delete(`/api/v1/routes/${routeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 for already deleted route', async () => {
      const response = await request(app)
        .delete(`/api/v1/routes/${routeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
    });
  });
});
