const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    mentorshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentorship', index: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    scheduledTime: { type: Date, required: true, index: true },
    duration: { type: Number, default: 60, min: 15 },
    meetingLink: { type: String, trim: true },
    meetingPlatform: { type: String, enum: ['google-meet', 'zoom', 'microsoft-teams'], default: 'google-meet' },
    status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled', index: true },
    mentorJoined: { type: Boolean, default: false },
    learnerJoined: { type: Boolean, default: false },
    sessionStartedAt: { type: Date },
    sessionEndedAt: { type: Date },
    notes: { type: String, trim: true },
    recordingUrl: { type: String, trim: true },
    attendanceMarked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

sessionSchema.index({ topic: 'text', description: 'text', notes: 'text' });

module.exports = mongoose.model('Session', sessionSchema);
