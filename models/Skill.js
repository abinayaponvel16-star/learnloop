const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

skillSchema.index({ name: 'text', category: 'text', description: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
