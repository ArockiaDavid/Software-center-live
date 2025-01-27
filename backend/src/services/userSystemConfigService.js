const { exec } = require('child_process');
const os = require('os');
const UserSystemConfig = require('../models/UserSystemConfig');

const promiseExec = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
};

const getSystemInfo = async (userEmail) => {
  try {
    console.log('Getting system info for user:', userEmail);
    
    const [osVersion, kernelVersion, diskInfo] = await Promise.all([
      promiseExec('sw_vers -productVersion').catch(err => {
        console.error('Error getting OS version:', err);
        return 'Unknown';
      }),
      promiseExec('uname -r').catch(err => {
        console.error('Error getting kernel version:', err);
        return 'Unknown';
      }),
      promiseExec('df -k / | tail -1 | awk \'{print $2,$4}\'').catch(err => {
        console.error('Error getting disk info:', err);
        return '0 0';
      })
    ]);

    console.log('Raw system info:', { osVersion, kernelVersion, diskInfo });

    // Parse disk space info (convert from KB to GB)
    const [totalDiskKB, freeDiskKB] = diskInfo.split(' ').map(Number);
    const totalDiskSpace = Math.round(totalDiskKB / 1024 / 1024) || 0;
    const freeDiskSpace = Math.round(freeDiskKB / 1024 / 1024) || 0;

    // Convert memory from bytes to GB
    const totalMemoryGB = Math.round(os.totalmem() / 1024 / 1024 / 1024);
    const freeMemoryGB = Math.round(os.freemem() / 1024 / 1024 / 1024);

    const systemInfo = {
      userEmail,
      osVersion,
      osName: 'macOS',
      architecture: os.arch(),
      kernelVersion,
      hostname: os.hostname(),
      platform: os.platform(),
      cpuModel: os.cpus()[0].model,
      cpuCores: os.cpus().length,
      totalMemory: totalMemoryGB,
      freeMemory: freeMemoryGB,
      totalDiskSpace,
      freeDiskSpace,
      lastUpdated: new Date()
    };

    console.log('Processed system info:', systemInfo);
    return systemInfo;
  } catch (error) {
    console.error('Error getting system info:', error);
    throw error;
  }
};

const updateUserSystemConfig = async (userId, userEmail) => {
  try {
    console.log('Updating system config for user:', userEmail);
    
    // First try to find existing config
    let config = await UserSystemConfig.findOne({ userId });
    
    if (!config) {
      // If no config exists, create one with default values
      config = new UserSystemConfig({
        userId,
        userEmail,
        osName: 'macOS',
        osVersion: 'Unknown',
        totalMemory: 16,
        freeMemory: 8,
        totalDiskSpace: 460,
        freeDiskSpace: 230,
        cpuModel: 'Unknown',
        cpuCores: 8
      });
      await config.save();
      console.log('Created default config:', config);
    }

    // Then try to update with real system info
    try {
      const systemInfo = await getSystemInfo(userEmail);
      if (systemInfo) {
        Object.assign(config, systemInfo);
        await config.save();
        console.log('Updated config with real values:', config);
      }
    } catch (error) {
      console.error('Error getting real system info:', error);
      // Continue with default/existing values
    }

    return config;
  } catch (error) {
    console.error('Error updating user system config:', error);
    throw error;
  }
};

const getUserSystemConfig = async (userId) => {
  try {
    let config = await UserSystemConfig.findOne({ userId });
    if (!config) {
      // Return a default config if none exists
      config = new UserSystemConfig({
        userId,
        osName: 'macOS',
        osVersion: 'Unknown',
        totalMemory: 16,
        freeMemory: 8,
        totalDiskSpace: 460,
        freeDiskSpace: 230,
        cpuModel: 'Unknown',
        cpuCores: 8
      });
    }
    return config;
  } catch (error) {
    console.error('Error getting user system config:', error);
    throw error;
  }
};

module.exports = {
  updateUserSystemConfig,
  getUserSystemConfig
};
