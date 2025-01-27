const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  osVersion: String,
  installedApps: [{
    name: String,
    version: String,
    path: String,
    installedViaBrew: Boolean,
    brewName: String,
    lastUpdated: Date
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const SystemConfig = mongoose.model('SystemConfig', systemConfigSchema);

module.exports = SystemConfig;
