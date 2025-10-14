const Smartphone = require('../models/smartphone');

// Ajouter un smartphone - CORRIGÉ (plus besoin d'id auto-incrément)
exports.addSmartphone = async (req, res) => {
  try {
    // Création du smartphone - MongoDB génère _id automatiquement
    const smartphone = await Smartphone.create(req.body);
    res.status(201).json(smartphone);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les smartphones - DÉJÀ CORRECT
exports.getAllSmartphones = async (req, res) => {
    try {
        const smartphones = await Smartphone.find(); // Tous les documents
        res.json(smartphones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un smartphone par ID - CORRIGÉ pour utiliser _id
exports.getSmartphoneById = async (req, res) => {
    try {
        const smartphone = await Smartphone.findById(req.params.id); // Utilise _id
        if (!smartphone) {
            return res.status(404).json({ message: 'Smartphone non trouvé' });
        }
        res.json(smartphone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Modifier un smartphone - CORRIGÉ pour utiliser _id
exports.updateSmartphone = async (req, res) => {
    try {
        const updatedSmartphone = await Smartphone.findByIdAndUpdate(
            req.params.id,    // Trouver par _id
            req.body,         // Nouveau contenu
            { new: true, runValidators: true } // Retourne le doc modifié + validation
        );

        if (!updatedSmartphone) {
            return res.status(404).json({ message: 'Smartphone non trouvé' });
        }
        res.json(updatedSmartphone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un smartphone - CORRIGÉ pour utiliser _id
exports.deleteSmartphone = async (req, res) => {
    try {
        const deletedSmartphone = await Smartphone.findByIdAndDelete(req.params.id); // Utilise _id
        if (!deletedSmartphone) {
            return res.status(404).json({ message: 'Smartphone non trouvé' });
        }
        res.json({ message: 'Smartphone supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};