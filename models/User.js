const { db } = require('../utils/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = {
  async create({ username, email, password, full_name }) {
    const user_id = uuidv4();
    const password_hash = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (user_id, username, password_hash, email, full_name)
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, username, password_hash, email, full_name],
        function (err) {
          if (err) return reject(err);
          resolve({ user_id, username, email, full_name });
        }
      );
    });
  },

  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  async validatePassword(input, hash) {
    return bcrypt.compare(input, hash);
  }
};

module.exports = User;
