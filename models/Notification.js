const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'mentorship_request',
        'mentorship_accepted',
        'mentorship_rejected',
        'session_created',
        'session_reminder',
        'resource_uploaded',
        'feedback_received'
      ],
      required: true,
      index: true
    },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
