const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: ["https://www.byh-cm.com", "https://byh-cm.com", "https://batilink-woad.vercel.app", "https://www.batilink.org", "http://localhost:3000", "http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
};

app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.options("*", cors(corsOptions));

const limiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20 });
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/artisans", require("./routes/artisans"));
app.use("/api/entreprises", require("./routes/entreprises"));
app.use("/api/missions", require("./routes/missions"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/devis", require("./routes/devis"));
app.use("/api/contrats", require("./routes/contrats"));
app.use("/api/jalons", require("./routes/jalons"));
app.use("/api/litiges", require("./routes/litiges"));
app.use("/api/avis", require("./routes/avis"));
app.use("/api/visites", require("./routes/visites"));
app.use("/api/signalements", require("./routes/signalements"));
app.use("/api/photos-chantier", require("./routes/photos-chantier"));
app.use("/api/historique", require("./routes/historique"));
app.use("/api/demandes-personnel", require("./routes/demandes-personnel"));
app.use("/api/admin", require("./routes/admin"));

app.get("/api/health", (req, res) => res.json({ status: "OK", message: "B.Y.H API running" }));

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/batilink")
  .then(() => console.log("MongoDB connecte"))
  .catch(err => console.error("Erreur MongoDB:", err));

const { lancerTousLesRappels } = require("./utils/rappels");
// Rappels toutes les 6h - uniquement si heure ronde (evite doublons au redemarrage)
setInterval(() => {
  const h = new Date().getHours();
  if (h === 6 || h === 12 || h === 18 || h === 0) lancerTousLesRappels();
}, 60 * 60 * 1000);
const http = require("http");
const { initSocket } = require("./socket");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => console.log("Serveur B.Y.H sur port " + PORT));



