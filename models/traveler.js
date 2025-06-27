const { db } = require('./database');

class Traveler {
  // Get all travelers with their stay count
  static getAll() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.*, COUNT(s.id) as stay_count 
        FROM travelers t 
        LEFT JOIN stays s ON t.id = s.traveler_id 
        GROUP BY t.id 
        ORDER BY t.first_name, t.name
      `;
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get traveler by ID with all stays
  static getById(id) {
    return new Promise((resolve, reject) => {
      // Get traveler info
      db.get('SELECT * FROM travelers WHERE id = ?', [id], (err, traveler) => {
        if (err) {
          reject(err);
        } else if (!traveler) {
          resolve(null);
        } else {
          // Get traveler's stays
          db.all('SELECT * FROM stays WHERE traveler_id = ? ORDER BY check_in_date DESC', [id], (err, stays) => {
            if (err) {
              reject(err);
            } else {
              traveler.stays = stays;
              resolve(traveler);
            }
          });
        }
      });
    });
  }

  // Create new traveler
  static create(travelerData) {
    return new Promise((resolve, reject) => {
      const { first_name, name, email, phone, status, internal_notes } = travelerData;
      const query = `
        INSERT INTO travelers (first_name, name, email, phone, status, internal_notes) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [first_name, name, email, phone, status || 'normal', internal_notes], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Update traveler
  static update(id, travelerData) {
    return new Promise((resolve, reject) => {
      const { first_name, name, email, phone, status, internal_notes } = travelerData;
      const query = `
        UPDATE travelers 
        SET first_name = ?, name = ?, email = ?, phone = ?, status = ?, internal_notes = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db.run(query, [first_name, name, email, phone, status, internal_notes, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Delete traveler
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM travelers WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Find traveler by email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM travelers WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find stay by booking reference
  static findStayByBookingReference(bookingReference) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM stays WHERE booking_reference = ?', [bookingReference], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get stay by ID
  static getStayById(stayId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM stays WHERE id = ?', [stayId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Update stay
  static updateStay(stayId, stayData) {
    return new Promise((resolve, reject) => {
      const { check_in_date, check_out_date, booking_reference, notes } = stayData;
      
      db.run(`
        UPDATE stays 
        SET check_in_date = ?, check_out_date = ?, booking_reference = ?, notes = ?
        WHERE id = ?
      `, [check_in_date, check_out_date, booking_reference, notes, stayId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Delete stay
  static deleteStay(stayId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM stays WHERE id = ?', [stayId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Add stay to traveler
  static addStay(travelerId, stayData) {
    return new Promise((resolve, reject) => {
      const { check_in_date, check_out_date, booking_reference, notes } = stayData;
      const query = `
        INSERT INTO stays (traveler_id, check_in_date, check_out_date, booking_reference, notes) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(query, [travelerId, check_in_date, check_out_date, booking_reference, notes], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  // Get all stays for a traveler
  static getStays(travelerId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM stays WHERE traveler_id = ? ORDER BY check_in_date DESC', [travelerId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Traveler; 