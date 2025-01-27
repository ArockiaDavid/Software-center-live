const getInstalledSoftware = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(`http://localhost:3007/api/user-software/user/${userId}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch installed software');
    }

    const data = await response.json();
    console.log('Received installed software data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching installed software:', error);
    throw error;
  }
};

const getUserDetails = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await fetch(`http://localhost:3007/api/users/${userId}`, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }

    const data = await response.json();
    console.log('Received user data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

module.exports = {
  getInstalledSoftware,
  getUserDetails
};
