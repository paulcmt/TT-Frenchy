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
            // Map Superhote booking CSV columns to our data structure
            const travelerData = {
              first_name: data['guest first name'] || data['Guest first name'] || data.first_name,
              name: data['guest last name'] || data['Guest last name'] || data.last_name || data.name,
              email: data['guest email'] || data['Guest email'] || data.email,
              phone: data['guest phone number'] || data['Guest phone number'] || data.phone,
              status: this.determineStatus(data['status'] || data.status),
              internal_notes: this.formatTravelerNotes(data)
            };

            const stayData = {
              check_in_date: data['checkin'] || data['Checkin'] || data.check_in_date,
              check_out_date: data['checkout'] || data['Checkout'] || data.check_out_date,
              booking_reference: data['id'] || data['booking id'] || data.booking_reference,
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

  static determineStatus(status) {
    if (!status) return 'normal';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'confirmed' || statusLower === 'confirmé') {
      return 'normal';
    } else if (statusLower === 'cancelled' || statusLower === 'annulé') {
      return 'complique';
    } else if (statusLower === 'vip' || statusLower === 'premium') {
      return 'vip';
    }
    
    return 'normal';
  }

  static formatTravelerNotes(data) {
    const notes = [];
    
    // Add address information if available
    if (data['address'] && data['address'].trim() !== '') {
      const address = data['address'].trim();
      const city = data['city'] ? data['city'].trim() : '';
      const postCode = data['post code'] ? data['post code'].trim() : '';
      
      if (address !== '.' && address !== ',') {
        const fullAddress = [address, city, postCode].filter(Boolean).join(', ');
        notes.push(`Adresse: ${fullAddress}`);
      }
    }
    
    // Add alternative email if different from main email
    if (data['guest alternative email'] && 
        data['guest alternative email'].trim() !== '' && 
        data['guest alternative email'] !== data['guest email']) {
      notes.push(`Email alternatif: ${data['guest alternative email']}`);
    }
    
    // Add channel information
    if (data['channel']) {
      notes.push(`Canal: ${data['channel']}`);
    }
    
    return notes.length > 0 ? notes.join(' | ') : null;
  }

  static formatStayNotes(data) {
    const notes = [];
    
    // Add rental property information
    if (data['rental']) {
      notes.push(`Propriété: ${data['rental']}`);
    }
    
    // Add guest count information
    if (data['nbr adults'] || data['people']) {
      const adults = data['nbr adults'] || data['people'];
      const children = data['nbr children'] || '0';
      notes.push(`Voyageurs: ${adults} adultes, ${children} enfants`);
    }
    
    // Add pricing information
    if (data['night price']) {
      notes.push(`Prix/nuit: ${data['night price']}€`);
    }
    
    if (data['total price']) {
      notes.push(`Prix total: ${data['total price']}€`);
    }
    
    // Add fees and charges
    if (data['city taxes'] && parseFloat(data['city taxes']) > 0) {
      notes.push(`Taxes: ${data['city taxes']}€`);
    }
    
    if (data['cleaning fees'] && parseFloat(data['cleaning fees']) > 0) {
      notes.push(`Ménage: ${data['cleaning fees']}€`);
    }
    
    if (data['service charge'] && parseFloat(data['service charge']) > 0) {
      notes.push(`Frais de service: ${data['service charge']}€`);
    }
    
    if (data['commission'] && parseFloat(data['commission']) > 0) {
      notes.push(`Commission: ${data['commission']}€`);
    }
    
    // Add payment information
    if (data['payment status']) {
      notes.push(`Statut paiement: ${data['payment status']}`);
    }
    
    if (data['total payments'] && parseFloat(data['total payments']) > 0) {
      notes.push(`Paiements reçus: ${data['total payments']}€`);
    }
    
    // Add booking date
    if (data['booking date']) {
      notes.push(`Date réservation: ${data['booking date']}`);
    }
    
    // Add nights count
    if (data['nights']) {
      notes.push(`Nuits: ${data['nights']}`);
    }
    
    // Add original notes and comments
    if (data['notes'] && data['notes'].trim() !== '') {
      notes.push(`Notes: ${data['notes']}`);
    }
    
    if (data['comments'] && data['comments'].trim() !== '') {
      notes.push(`Commentaires: ${data['comments']}`);
    }
    
    // Add contract and invoice links if available
    if (data['contract link']) {
      notes.push(`Contrat: ${data['contract link']}`);
    }
    
    if (data['permalink']) {
      notes.push(`Facture: ${data['permalink']}`);
    }
    
    return notes.length > 0 ? notes.join(' | ') : null;
  }

  static async processRecord(travelerData, stayData) {
    // Check if stay already exists by booking reference
    if (stayData.booking_reference) {
      const existingStay = await Traveler.findStayByBookingReference(stayData.booking_reference);
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