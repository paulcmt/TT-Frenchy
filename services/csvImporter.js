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
      let skippedCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          try {
            // Map Superhote CSV columns to our data structure
            const travelerData = {
              first_name: data['Guest first name'] || data['Guest First Name'] || data.first_name,
              name: data['Guest last name'] || data['Guest Last Name'] || data.last_name || data.name,
              email: data['Email'] || data.email,
              phone: data['Téléphone'] || data['Phone'] || data.phone,
              status: 'normal' // Default status
            };

            const stayData = {
              check_in_date: data['Checkin'] || data['Check-in'] || data.checkin || data.check_in_date,
              check_out_date: data['Checkout'] || data['Check-out'] || data.checkout || data.check_out_date,
              booking_reference: data['Date de réservation'] || data['Booking Date'] || data.booking_date,
              notes: this.formatStayNotes(data)
            };

            // Process this record
            const result = await this.processRecord(travelerData, stayData);
            results.push(result);
            
            if (result.action === 'created') createdCount++;
            if (result.action === 'updated') updatedCount++;
            if (result.action === 'skipped') skippedCount++;
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
            skipped: skippedCount,
            errors: errors,
            results: results
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  static formatStayNotes(data) {
    const notes = [];
    
    // Add price information
    if (data['Price'] || data.price) {
      notes.push(`Prix: ${data['Price'] || data.price}€`);
    }
    
    // Add guest count information
    if (data['Nombre d\'adultes'] || data.adults) {
      notes.push(`Adultes: ${data['Nombre d\'adultes'] || data.adults}`);
    }
    if (data['Nombre d\'enfants'] || data.children) {
      notes.push(`Enfants: ${data['Nombre d\'enfants'] || data.children}`);
    }
    
    // Add commission information
    if (data['Commission'] || data.commission) {
      notes.push(`Commission: ${data['Commission'] || data.commission}€`);
    }
    
    // Add cleaning fees
    if (data['Frais de ménage'] || data.cleaning_fees) {
      notes.push(`Ménage: ${data['Frais de ménage'] || data.cleaning_fees}€`);
    }
    
    // Add stay taxes
    if (data['Taxes de séjour'] || data.stay_taxes) {
      notes.push(`Taxes: ${data['Taxes de séjour'] || data.stay_taxes}€`);
    }
    
    // Add original notes
    if (data['Notes'] || data.notes || data.comments) {
      notes.push(`Commentaires: ${data['Notes'] || data.notes || data.comments}`);
    }
    
    return notes.length > 0 ? notes.join(' | ') : null;
  }

  static async processRecord(travelerData, stayData) {
    // Check if stay already exists by booking reference
    if (stayData.booking_reference) {
      const existingStay = await this.findStayByBookingReference(stayData.booking_reference);
      if (existingStay) {
        return {
          action: 'skipped',
          travelerId: existingStay.traveler_id,
          stayId: existingStay.id,
          message: `Séjour ignoré - référence déjà existante: ${stayData.booking_reference}`
        };
      }
    }

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
        message: `Séjour ajouté au voyageur existant: ${travelerData.first_name || ''} ${travelerData.name}`.trim()
      };
    } else {
      // Create new traveler
      const travelerId = await Traveler.create(travelerData);
      const stayId = await Traveler.addStay(travelerId, stayData);
      return {
        action: 'created',
        travelerId: travelerId,
        stayId: stayId,
        message: `Nouveau voyageur créé: ${travelerData.first_name || ''} ${travelerData.name}`.trim()
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