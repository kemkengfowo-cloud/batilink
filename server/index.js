const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/artisans', require('./routes/artisans'));
app.use('/api/entreprises', require('./routes/entreprises'));
app.use('/api/missions', require('./routes/missions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/devis', require('./routes/devis'));
app.use('/api/contrats', require('./routes/contrats'));
app.use('/api/jalons', require('./routes/jalons'));
app.use('/api/litiges', require('./routes/litiges'));
app.use('/api/avis', require('./routes/avis'));
app.use('/api/visites', require('./routes/visites'));
app.use('/api/signalements', require('./routes/signalements'));
app.use('/api/photos-chantier', require('./routes/photos-chantier'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Batilink API running' }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/batilink')
  .then(() => console.log('✅ MongoDB connecte'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

// Rappels automatiques toutes les 6 heures
const { lancerTousLesRappels } = require('./utils/rappels');
setTimeout(() => {
  lancerTousLesRappels();
  setInterval(lancerTousLesRappels, 6 * 60 * 60 * 1000);
}, 10000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur Batilink sur http://localhost:${PORT}`));
