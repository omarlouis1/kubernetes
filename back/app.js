const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./connectdb');
const smartphoneRoutes = require('./routes/smartphoneRoutes');

dotenv.config();

// Connexion à MongoDB
connectDB();

// Création de l'application Express
const app = express();

// Configuration CORS COMPLÈTE
app.use(cors({
  origin: ['http://localhost:30002', 'http://192.168.49.2:30002', 'http://localhost:5173', 'http://127.0.0.1:30002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-delete-code']
}));

// Autoriser un body JSON plus gros (ex: 10mb)
app.use(express.json({ limit: "10mb" }));

// Routes API
app.use('/api', smartphoneRoutes);

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Serveur lancé sur http://0.0.0.0:${PORT}`));