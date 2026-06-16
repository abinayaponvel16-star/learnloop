const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, trim: true },
    startTime: { type: String, trim: true },
    endTime: { type: String, trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
  type: String,
  required: true,
  unique: true
},
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 1000 },
    role: { type: String, enum: ['learner', 'mentor', 'admin'], default: 'learner', index: true },
    skillsToLearn: [{ type: String, trim: true }],
    skillsToTeach: [{ type: String, trim: true }],
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    experienceYears: { type: Number, default: 0, min: 0 },
    education: { type: String, trim: true, default: '' },
    college: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    languages: [{ type: String, trim: true }],
    availability: [availabilitySchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
    sessionsCompleted: { type: Number, default: 0, min: 0 },
    resourcesShared: { type: Number, default: 0, min: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', email: 'text', skillsToLearn: 'text', skillsToTeach: 'text', college: 'text' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
