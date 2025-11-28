const supabase = require('../config/database');

class UserService {
  async getUserById(userId) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, username, avatar_url, bike_model, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    return user;
  }

  async updateUser(userId, updates) {
    const allowedFields = ['full_name', 'username', 'avatar_url', 'bike_model'];
    const filteredUpdates = {};

    // Only allow updating specific fields
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });

    filteredUpdates.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select('id, email, full_name, username, avatar_url, bike_model')
      .single();

    if (error) {
      throw error;
    }

    return user;
  }
}

module.exports = new UserService();
