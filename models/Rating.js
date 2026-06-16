const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    teachingQuality: { type: Number, min: 1, max: 5 },
    knowledgeLevel: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 },
    feedback: { type: String, trim: true, maxlength: 2000 },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date }
  },
  { timestamps: true }
);

ratingSchema.index({ sessionId: 1, fromUser: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
