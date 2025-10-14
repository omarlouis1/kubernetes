// connectdb.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // URL de MongoDB pour Kubernetes
        const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo-service:27017/smartphoneDB';
        
        console.log('Tentative de connexion à MongoDB avec URI:', mongoURI);
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB connecté avec succès');
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;