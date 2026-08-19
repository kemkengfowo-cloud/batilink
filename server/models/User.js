const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true, minlength: 6 },
  role:        { type: String, enum: ['client', 'artisan', 'entreprise', 'admin'], required: true },
  phone:       { type: String },
  city:        { type: String },
  avatar:      { type: String },
  matricule:   { type: String, unique: true, sparse: true },
  blocked:     { type: Boolean, default: false },
  estDiaspora: { type: Boolean, default: false },
  pays:        { type: String }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(p) {
  return bcrypt.compare(p, this.password);
};

userSchema.methods.toJSON = function() {
  const o = this.toObject();
  delete o.password;
  return o;
};

module.exports = mongoose.model('User', userSchema);
