// Simple authentication utility for the migration
export const initializeDefaultUser = () => {
  // Check if user already exists in localStorage
  const existingUser = localStorage.getItem('user');
  
  if (!existingUser) {
    // Create default user session
    const defaultUser = {
      id: 1,
      username: 'default',
      email: 'default@example.com',
      createdAt: new Date().toISOString(),
    };
    
    localStorage.setItem('user', JSON.stringify(defaultUser));
    console.log('Default user session initialized');
  }
  
  return JSON.parse(localStorage.getItem('user') || '{}');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user') || '{}');
};

export const clearUserSession = () => {
  localStorage.removeItem('user');
};