const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    fileName: { type: String, trim: true },
    fileType: { type: String, enum: ['pdf', 'ppt', 'doc', 'image', 'video', 'link'], required: true },
    fileSize: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    downloads: { type: Number, default: 0, min: 0 },
    visibility: { type: String, enum: ['sessionOnly', 'public'], default: 'sessionOnly', index: true }
  },
  { timestamps: true }
);

resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
