const mongoose = require('mongoose');

const installedSoftwareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  appId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['installed', 'updating', 'failed', 'uninstalled'],
    default: 'installed'
  },
  installDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  lastUpdateCheck: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound index to ensure unique software per user
installedSoftwareSchema.index({ user: 1, appId: 1 }, { unique: true });

const InstalledSoftware = mongoose.model('InstalledSoftware', installedSoftwareSchema);

module.exports = InstalledSoftware;
