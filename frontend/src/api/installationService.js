const API_BASE_URL = '/api';

const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
};

export const installationService = {
  async checkInstallation(appId) {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/software?appId=${appId}&action=check`
      );
      const data = await response.json();
      return data.installed;
    } catch (error) {
      console.error('Error checking installation:', error);
      return false;
    }
  },

  async installApp(appId) {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/software?appId=${appId}&action=install`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      return data.success;
    } catch (error) {
      console.error('Installation error:', error);
      throw error;
    }
  },

  async checkForUpdates(appId) {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/software?appId=${appId}&action=check-updates`
      );
      const data = await response.json();
      console.log('Version check response:', data);
      return {
        hasUpdate: data.hasUpdate,
        currentVersion: data.currentVersion,
        latestVersion: data.latestVersion
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return {
        hasUpdate: false,
        currentVersion: null,
        latestVersion: null
      };
    }
  },

  async updateApp(appId) {
    try {
      const response = await makeAuthenticatedRequest(
        `${API_BASE_URL}/software?appId=${appId}&action=update`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      return data.success;
    } catch (error) {
      console.error('Update error:', error);
      throw error;
    }
  }
};
