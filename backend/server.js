require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('./src/models/User');
const installedSoftwareRoutes = require('./src/routes/installedSoftwareRoutes');
const userRoutes = require('./src/routes/userRoutes');
const trackInstallationMiddleware = require('./src/middleware/installationTracking');
const { scanInstalledSoftware } = require('./src/services/softwareScanService');
const { updateUserSystemConfig, getUserSystemConfig } = require('./src/services/userSystemConfigService');
const UserSystemConfig = require('./src/models/UserSystemConfig');
const InstalledSoftware = require('./src/models/InstalledSoftware');

const app = express();

// Application constants from environment
const APP_NAME = process.env.APP_NAME || 'Software Center';
const API_VERSION = process.env.API_VERSION || '/api/v1';
const PORT = process.env.BACKEND_PORT || 3007;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const MAX_UPLOAD_SIZE = process.env.MAX_UPLOAD_SIZE || '10mb';

// Serve static files from public directory
app.use(express.static('public'));

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase payload size limit for image uploads
app.use(express.json({ limit: MAX_UPLOAD_SIZE }));

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByIdWithAvatar(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Add routes with versioning
app.use(`${API_VERSION}/user-software`, auth, installedSoftwareRoutes);
app.use(`${API_VERSION}/users`, userRoutes);

// Get all users (for Admins)
app.get(`${API_VERSION}/users`, auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({}, '-password -resetPasswordToken -resetPasswordExpires');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get specific user details (for Admins)
app.get(`${API_VERSION}/users/:userId`, auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Fetching user details for ID:', req.params.userId);

    const user = await User.findById(req.params.userId, '-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      console.error('User not found with ID:', req.params.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    const systemConfig = await UserSystemConfig.findOne({ userId: req.params.userId });
    let installedSoftware = [];
    
    try {
      const existingSoftware = await InstalledSoftware.find({ user: new mongoose.Types.ObjectId(req.params.userId) });
      if (existingSoftware.length === 0) {
        const testSoftware = [
          {
            user: new mongoose.Types.ObjectId(req.params.userId),
            appId: 'vscode',
            name: 'Visual Studio Code',
            version: '1.85.1',
            status: 'installed',
            installDate: new Date(),
            lastUpdateCheck: new Date()
          },
          {
            user: new mongoose.Types.ObjectId(req.params.userId),
            appId: 'chrome',
            name: 'Google Chrome',
            version: '120.0.6099.109',
            status: 'installed',
            installDate: new Date(),
            lastUpdateCheck: new Date()
          }
        ];
        await InstalledSoftware.insertMany(testSoftware);
      }

      installedSoftware = await InstalledSoftware.find({ user: new mongoose.Types.ObjectId(req.params.userId) })
        .select('name version status installDate lastUpdateCheck')
        .lean();
      
      installedSoftware = installedSoftware.map(item => ({
        ...item,
        installDate: item.installDate ? item.installDate.toISOString() : null,
        lastUpdateCheck: item.lastUpdateCheck ? item.lastUpdateCheck.toISOString() : null
      }));
    } catch (err) {
      console.error('Error fetching/creating installed software:', err);
    }

    let finalSystemConfig = systemConfig;
    if (!systemConfig) {
      const defaultConfig = new UserSystemConfig({
        userId: req.params.userId,
        userEmail: user.email,
        osName: 'macOS',
        osVersion: 'Unknown',
        totalMemory: 16,
        freeMemory: 8,
        totalDiskSpace: 460,
        freeDiskSpace: 230,
        cpuModel: 'Unknown',
        cpuCores: 8
      });
      finalSystemConfig = await defaultConfig.save();

      updateUserSystemConfig(req.params.userId, user.email)
        .then(updatedConfig => {
          console.log('Updated config with real values:', updatedConfig);
        })
        .catch(error => {
          console.error('Error updating config with real values:', error);
        });
    }

    const responseData = {
      ...user.toObject(),
      systemConfig: finalSystemConfig ? finalSystemConfig.toObject() : null,
      installedSoftware: installedSoftware || []
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Authentication routes
app.post(`${API_VERSION}/auth/forgot-password`, async (req, res) => {
  try {
    const { email, newPassword, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: `No ${role} account found with this email` });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

app.post(`${API_VERSION}/auth/signup`, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post(`${API_VERSION}/auth/login`, async (req, res) => {
  try {
    if (!req.body?.email || !req.body?.password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { email, password, role } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.role !== role) {
      return res.status(404).json({ message: `No ${role} account found with this email` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_TIMEOUT || '24h' }
    );

    // Post-login operations
    Promise.all([
      scanInstalledSoftware(user._id),
      updateUserSystemConfig(user._id, user.email)
    ]).catch(error => {
      console.error('Error in post-login operations:', error);
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Start HTTP server
console.log(`Starting ${APP_NAME} server...`);
app.listen(PORT, () => {
  console.log(`${APP_NAME} server running on port ${PORT}`);
});

// MongoDB connection
console.log('Connecting to MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority',
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
}).then(() => {
  console.log('Successfully connected to MongoDB Atlas');
}).catch((error) => {
  console.error('MongoDB Atlas connection error:', error);
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});
