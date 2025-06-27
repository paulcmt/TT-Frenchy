const Traveler = require('../models/traveler');
const CSVImporter = require('../services/csvImporter');

class TravelerController {
  // GET /travelers - Liste tous les voyageurs
  static async index(req, res) {
    try {
      const travelers = await Traveler.getAll();
      res.render('travelers/index', { 
        travelers,
        title: 'Gestion des Voyageurs'
      });
    } catch (error) {
      console.error('Error fetching travelers:', error);
      req.flash('error', 'Erreur lors du chargement des voyageurs');
      res.render('travelers/index', { 
        travelers: [],
        title: 'Gestion des Voyageurs'
      });
    }
  }

  // GET /travelers/new - Formulaire de création
  static async new(req, res) {
    res.render('travelers/new', { 
      title: 'Nouveau Voyageur',
      traveler: {},
      errors: {}
    });
  }

  // POST /travelers - Créer un voyageur
  static async create(req, res) {
    try {
      const { first_name, name, email, phone, status, internal_notes } = req.body;
      
      // Validation
      const errors = {};
      
      // First name validation
      if (!first_name || first_name.trim().length === 0) {
        errors.first_name = 'Le prénom est obligatoire';
      } else if (first_name.trim().length < 2) {
        errors.first_name = 'Le prénom doit contenir au moins 2 caractères';
      }
      
      // Name validation
      if (!name || name.trim().length === 0) {
        errors.name = 'Le nom est obligatoire';
      } else if (name.trim().length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères';
      }
      
      // Phone validation
      if (phone && phone.trim().length > 0) {
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          errors.phone = 'Le numéro de téléphone doit contenir au moins 10 chiffres';
        }
      }
      
      // Email validation
      if (email && email.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'Veuillez entrer une adresse email valide';
        }
      }
      
      if (Object.keys(errors).length > 0) {
        return res.render('travelers/new', {
          title: 'Nouveau Voyageur',
          traveler: req.body,
          errors
        });
      }

      const travelerId = await Traveler.create({
        first_name: first_name.trim(),
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        status: status || 'normal',
        internal_notes: internal_notes?.trim() || null
      });

      req.flash('success', 'Voyageur créé avec succès');
      res.redirect('/travelers');
    } catch (error) {
      console.error('Error creating traveler:', error);
      res.render('travelers/new', {
        title: 'Nouveau Voyageur',
        traveler: req.body,
        errors: { general: 'Erreur lors de la création du voyageur' }
      });
    }
  }

  // GET /travelers/:id - Afficher un voyageur
  static async show(req, res) {
    try {
      const traveler = await Traveler.getById(req.params.id);
      if (!traveler) {
        return res.status(404).render('error', {
          title: 'Voyageur non trouvé',
          message: 'Le voyageur demandé n\'existe pas'
        });
      }

      res.render('travelers/show', {
        title: `Détails de ${traveler.name}`,
        traveler,
        stayErrors: {},
        stayData: {}
      });
    } catch (error) {
      console.error('Error fetching traveler:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Erreur lors du chargement du voyageur'
      });
    }
  }

  // GET /travelers/:id/edit - Formulaire de modification
  static async edit(req, res) {
    try {
      const traveler = await Traveler.getById(req.params.id);
      if (!traveler) {
        return res.status(404).render('error', {
          title: 'Voyageur non trouvé',
          message: 'Le voyageur demandé n\'existe pas'
        });
      }

      res.render('travelers/edit', {
        title: `Modifier ${traveler.name}`,
        traveler,
        errors: {}
      });
    } catch (error) {
      console.error('Error fetching traveler for edit:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Erreur lors du chargement du voyageur'
      });
    }
  }

  // PUT /travelers/:id - Modifier un voyageur
  static async update(req, res) {
    try {
      const { first_name, name, email, phone, status, internal_notes } = req.body;
      
      // Validation
      const errors = {};
      
      // First name validation
      if (!first_name || first_name.trim().length === 0) {
        errors.first_name = 'Le prénom est obligatoire';
      } else if (first_name.trim().length < 2) {
        errors.first_name = 'Le prénom doit contenir au moins 2 caractères';
      }
      
      // Name validation
      if (!name || name.trim().length === 0) {
        errors.name = 'Le nom est obligatoire';
      } else if (name.trim().length < 2) {
        errors.name = 'Le nom doit contenir au moins 2 caractères';
      }
      
      // Phone validation
      if (phone && phone.trim().length > 0) {
        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
          errors.phone = 'Le numéro de téléphone doit contenir au moins 10 chiffres';
        }
      }
      
      // Email validation
      if (email && email.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.email = 'Veuillez entrer une adresse email valide';
        }
      }
      
      if (Object.keys(errors).length > 0) {
        const traveler = await Traveler.getById(req.params.id);
        return res.render('travelers/edit', {
          title: `Modifier ${traveler.name}`,
          traveler: { ...traveler, ...req.body },
          errors
        });
      }

      const success = await Traveler.update(req.params.id, {
        first_name: first_name.trim(),
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        status: status || 'normal',
        internal_notes: internal_notes?.trim() || null
      });

      if (!success) {
        return res.status(404).render('error', {
          title: 'Voyageur non trouvé',
          message: 'Le voyageur demandé n\'existe pas'
        });
      }

      req.flash('success', 'Voyageur modifié avec succès');
      res.redirect('/travelers');
    } catch (error) {
      console.error('Error updating traveler:', error);
      const traveler = await Traveler.getById(req.params.id);
      res.render('travelers/edit', {
        title: `Modifier ${traveler.name}`,
        traveler: { ...traveler, ...req.body },
        errors: { general: 'Erreur lors de la modification du voyageur' }
      });
    }
  }

  // DELETE /travelers/:id - Supprimer un voyageur
  static async destroy(req, res) {
    try {
      const success = await Traveler.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Voyageur non trouvé' });
      }

      req.flash('success', 'Voyageur supprimé avec succès');
      res.redirect('/travelers');
    } catch (error) {
      console.error('Error deleting traveler:', error);
      req.flash('error', 'Erreur lors de la suppression du voyageur');
      res.redirect('/travelers');
    }
  }

  // POST /travelers/:id/stays - Ajouter un séjour
  static async addStay(req, res) {
    try {
      const { check_in_date, check_out_date, booking_reference, notes } = req.body;
      
      // Validation
      const errors = {};
      if (!check_in_date) {
        errors.check_in_date = 'La date d\'arrivée est obligatoire';
      }
      if (!check_out_date) {
        errors.check_out_date = 'La date de départ est obligatoire';
      }
      if (check_in_date && check_out_date && new Date(check_in_date) >= new Date(check_out_date)) {
        errors.check_out_date = 'La date de départ doit être postérieure à la date d\'arrivée';
      }
      
      if (Object.keys(errors).length > 0) {
        const traveler = await Traveler.getById(req.params.id);
        return res.render('travelers/show', {
          title: `Détails de ${traveler.name}`,
          traveler,
          stayErrors: errors,
          stayData: req.body
        });
      }

      const stayId = await Traveler.addStay(req.params.id, {
        check_in_date,
        check_out_date,
        booking_reference: booking_reference?.trim() || null,
        notes: notes?.trim() || null
      });

      req.flash('success', 'Séjour ajouté avec succès');
      res.redirect(`/travelers/${req.params.id}`);
    } catch (error) {
      console.error('Error adding stay:', error);
      const traveler = await Traveler.getById(req.params.id);
      res.render('travelers/show', {
        title: `Détails de ${traveler.name}`,
        traveler,
        stayErrors: { general: 'Erreur lors de l\'ajout du séjour' },
        stayData: req.body
      });
    }
  }

  // GET /travelers/:id/stays/:stayId/edit - Formulaire de modification d'un séjour
  static async editStay(req, res) {
    try {
      const traveler = await Traveler.getById(req.params.id);
      if (!traveler) {
        return res.status(404).render('error', {
          title: 'Voyageur non trouvé',
          message: 'Le voyageur demandé n\'existe pas'
        });
      }

      const stay = await Traveler.getStayById(req.params.stayId);
      if (!stay || stay.traveler_id != req.params.id) {
        return res.status(404).render('error', {
          title: 'Séjour non trouvé',
          message: 'Le séjour demandé n\'existe pas'
        });
      }

      res.render('travelers/edit-stay', {
        title: `Modifier le séjour de ${traveler.name}`,
        traveler,
        stay,
        errors: {}
      });
    } catch (error) {
      console.error('Error fetching stay for edit:', error);
      res.status(500).render('error', {
        title: 'Erreur',
        message: 'Erreur lors du chargement du séjour'
      });
    }
  }

  // PUT /travelers/:id/stays/:stayId - Modifier un séjour
  static async updateStay(req, res) {
    try {
      const { check_in_date, check_out_date, booking_reference, notes } = req.body;
      
      // Validation
      const errors = {};
      if (!check_in_date) {
        errors.check_in_date = 'La date d\'arrivée est obligatoire';
      }
      if (!check_out_date) {
        errors.check_out_date = 'La date de départ est obligatoire';
      }
      if (check_in_date && check_out_date && new Date(check_in_date) >= new Date(check_out_date)) {
        errors.check_out_date = 'La date de départ doit être postérieure à la date d\'arrivée';
      }
      
      if (Object.keys(errors).length > 0) {
        const traveler = await Traveler.getById(req.params.id);
        const stay = await Traveler.getStayById(req.params.stayId);
        return res.render('travelers/edit-stay', {
          title: `Modifier le séjour de ${traveler.name}`,
          traveler,
          stay: { ...stay, ...req.body },
          errors
        });
      }

      const success = await Traveler.updateStay(req.params.stayId, {
        check_in_date,
        check_out_date,
        booking_reference: booking_reference?.trim() || null,
        notes: notes?.trim() || null
      });

      if (!success) {
        return res.status(404).render('error', {
          title: 'Séjour non trouvé',
          message: 'Le séjour demandé n\'existe pas'
        });
      }

      req.flash('success', 'Séjour modifié avec succès');
      res.redirect(`/travelers/${req.params.id}`);
    } catch (error) {
      console.error('Error updating stay:', error);
      const traveler = await Traveler.getById(req.params.id);
      const stay = await Traveler.getStayById(req.params.stayId);
      res.render('travelers/edit-stay', {
        title: `Modifier le séjour de ${traveler.name}`,
        traveler,
        stay: { ...stay, ...req.body },
        errors: { general: 'Erreur lors de la modification du séjour' }
      });
    }
  }

  // DELETE /travelers/:id/stays/:stayId - Supprimer un séjour
  static async deleteStay(req, res) {
    try {
      const success = await Traveler.deleteStay(req.params.stayId);
      if (!success) {
        return res.status(404).json({ error: 'Séjour non trouvé' });
      }

      req.flash('success', 'Séjour supprimé avec succès');
      res.redirect(`/travelers/${req.params.id}`);
    } catch (error) {
      console.error('Error deleting stay:', error);
      req.flash('error', 'Erreur lors de la suppression du séjour');
      res.redirect(`/travelers/${req.params.id}`);
    }
  }

  // GET /travelers/import - Page d'import CSV
  static async importForm(req, res) {
    res.render('travelers/import', {
      title: 'Importer des voyageurs',
      preview: null,
      errors: {}
    });
  }

  // POST /travelers/import - Importer CSV
  static async import(req, res) {
    try {
      if (!req.file) {
        return res.render('travelers/import', {
          title: 'Importer des voyageurs',
          preview: null,
          errors: { file: 'Veuillez sélectionner un fichier CSV' }
        });
      }

      const result = await CSVImporter.importFromFile(req.file.path);
      
      // Set flash messages
      let message = `Import terminé : ${result.processed} lignes traitées`;
      if (result.created > 0) {
        message += `, ${result.created} voyageur(s) créé(s)`;
      }
      if (result.updated > 0) {
        message += `, ${result.updated} séjour(s) ajouté(s)`;
      }
      if (result.skipped > 0) {
        message += `, ${result.skipped} séjour(s) ignoré(s) (références existantes)`;
      }
      if (result.errors.length > 0) {
        message += `, ${result.errors.length} erreur(s)`;
      }
      
      req.flash('success', message);
      
      res.render('travelers/import', {
        title: 'Import terminé',
        preview: null,
        importResult: result,
        errors: {}
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.render('travelers/import', {
        title: 'Importer des voyageurs',
        preview: null,
        errors: { general: 'Erreur lors de l\'import: ' + error.message }
      });
    }
  }

  // POST /travelers/import/preview - Prévisualiser CSV
  static async previewCSV(req, res) {
    try {
      if (!req.file) {
        return res.render('travelers/import', {
          title: 'Importer des voyageurs',
          preview: null,
          errors: { file: 'Veuillez sélectionner un fichier CSV' }
        });
      }

      const preview = await CSVImporter.previewCSV(req.file.path);
      
      res.render('travelers/import', {
        title: 'Prévisualisation CSV',
        preview,
        errors: {}
      });
    } catch (error) {
      console.error('Error previewing CSV:', error);
      res.render('travelers/import', {
        title: 'Importer des voyageurs',
        preview: null,
        errors: { general: 'Erreur lors de la prévisualisation: ' + error.message }
      });
    }
  }

  // API endpoints for AJAX requests
  static async apiIndex(req, res) {
    try {
      const travelers = await Traveler.getAll();
      res.json(travelers);
    } catch (error) {
      console.error('API Error fetching travelers:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async apiShow(req, res) {
    try {
      const traveler = await Traveler.getById(req.params.id);
      if (!traveler) {
        return res.status(404).json({ error: 'Traveler not found' });
      }
      res.json(traveler);
    } catch (error) {
      console.error('API Error fetching traveler:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async apiCreate(req, res) {
    try {
      const { name, email, phone, status, internal_notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const travelerId = await Traveler.create({
        name,
        email,
        phone,
        status,
        internal_notes
      });

      const traveler = await Traveler.getById(travelerId);
      res.status(201).json(traveler);
    } catch (error) {
      console.error('API Error creating traveler:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async apiUpdate(req, res) {
    try {
      const { name, email, phone, status, internal_notes } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const success = await Traveler.update(req.params.id, {
        name,
        email,
        phone,
        status,
        internal_notes
      });

      if (!success) {
        return res.status(404).json({ error: 'Traveler not found' });
      }

      const traveler = await Traveler.getById(req.params.id);
      res.json(traveler);
    } catch (error) {
      console.error('API Error updating traveler:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async apiDestroy(req, res) {
    try {
      const success = await Traveler.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Traveler not found' });
      }
      res.json({ message: 'Traveler deleted successfully' });
    } catch (error) {
      console.error('API Error deleting traveler:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TravelerController; 