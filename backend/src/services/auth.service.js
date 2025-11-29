const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const config = require('../config/env');

class AuthService {
  async register(email, password, fullName, username) {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    // Check if username is taken (if provided)
    if (username) {
      const { data: existingUsername } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUsername) {
        const error = new Error('Username already taken');
        error.statusCode = 400;
        error.code = 'USERNAME_EXISTS';
        throw error;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          full_name: fullName,
          username: username || null,
        },
      ])
      .select('id, email, full_name, username, avatar_url, created_at')
      .single();

    if (insertError) {
      throw insertError;
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        avatar_url: user.avatar_url,
      },
      token,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  async login(email, password) {
    // Find user by email
    const { data: user, error: selectError } = await supabase
      .from('users')
      .select('id, email, password_hash, full_name, username, avatar_url')
      .eq('email', email)
      .single();

    if (selectError || !user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        username: user.username,
        avatar_url: user.avatar_url,
      },
      token,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  generateToken(userId, email) {
    return jwt.sign({ userId, email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  }
}

module.exports = new AuthService();
