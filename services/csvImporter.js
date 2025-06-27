const csv = require('csv-parser');
const fs = require('fs');
const Traveler = require('../models/traveler');

class CSVImporter {
  static async importFromFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let processedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          try {
            // Map CSV columns to our data structure
            // Adjust these mappings based on your actual CSV structure
            const travelerData = {
              name: data.guest_name || data.name || data['Guest Name'],
              email: data.guest_email || data.email || data['Guest Email'],
              phone: data.guest_phone || data.phone || data['Guest Phone'],
              status: 'normal' // Default status
            };

            const stayData = {
              check_in_date: data.check_in || data.checkin || data['Check-in Date'],
              check_out_date: data.check_out || data.checkout || data['Check-out Date'],
              booking_reference: data.booking_id || data.reference || data['Booking ID'],
              notes: data.notes || data.comments || ''
            };

            // Process this record
            const result = await this.processRecord(travelerData, stayData);
            results.push(result);
            
            if (result.action === 'created') createdCount++;
            if (result.action === 'updated') updatedCount++;
            processedCount++;

          } catch (error) {
            errors.push({
              row: processedCount + 1,
              error: error.message,
              data: data
            });
          }
        })
        .on('end', () => {
          resolve({
            processed: processedCount,
            created: createdCount,
            updated: updatedCount,
            errors: errors,
            results: results
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static async processRecord(travelerData, stayData) {
    // Check if traveler already exists by email
    let traveler = null;
    if (travelerData.email) {
      traveler = await Traveler.findByEmail(travelerData.email);
    }

    if (traveler) {
      // Traveler exists, add stay if it doesn't exist
      const stayId = await Traveler.addStay(traveler.id, stayData);
      return {
        action: 'updated',
        travelerId: traveler.id,
        stayId: stayId,
        message: `Stay added to existing traveler: ${travelerData.name}`
      };
    } else {
      // Create new traveler
      const travelerId = await Traveler.create(travelerData);
      const stayId = await Traveler.addStay(travelerId, stayData);
      return {
        action: 'created',
        travelerId: travelerId,
        stayId: stayId,
        message: `New traveler created: ${travelerData.name}`
      };
    }
  }

  // Helper method to preview CSV structure
  static previewCSV(filePath, maxRows = 5) {
    return new Promise((resolve, reject) => {
      const results = [];
      let rowCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          if (rowCount < maxRows) {
            results.push(data);
            rowCount++;
          }
        })
        .on('end', () => {
          resolve({
            headers: Object.keys(results[0] || {}),
            sampleData: results,
            totalRows: rowCount
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

module.exports = CSVImporter; 