const USERS_KEY = 'agrisathi_users';
const CURRENT_USER_KEY = 'agrisathi_current_user';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function signup(userData) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const hashedPassword = await hashPassword(userData.password);
  const newUser = {
    ...userData,
    password: hashedPassword,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    currentCrops: userData.currentCrops || [],
    previousCrops: userData.previousCrops || []
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // Store user without password for session
  const sessionUser = { ...newUser };
  delete sessionUser.password;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

export async function login(identifier, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const hashedPassword = await hashPassword(password);
  const user = users.find(u => (u.email === identifier || u.mobile === identifier) && u.password === hashedPassword);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  // Store session without password
  const sessionUser = { ...user };
  delete sessionUser.password;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function updateUserProfile(updates) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No user logged in');
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  const updatedUser = { ...currentUser, ...updates };
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

