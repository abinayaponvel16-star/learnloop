const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    skill: { type: String, required: true, trim: true, index: true },
    skillLevelRequired: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    requestMessage: { type: String, trim: true, maxlength: 1000 },
    matchScore: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending', index: true },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    rejectionReason: { type: String, trim: true }
  },
  { timestamps: true }
);

mentorshipSchema.index({ mentor: 1, learner: 1, skill: 1, status: 1 });

module.exports = mongoose.model('Mentorship', mentorshipSchema);
