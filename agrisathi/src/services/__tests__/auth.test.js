import { describe, it, expect, beforeEach } from 'vitest';
import { signup, login, logout, getCurrentUser, updateUserProfile } from '../auth.js';

describe('auth service', () => {
  const testUser = {
    fullName: 'Ramesh Kumar',
    email: 'ramesh@example.com',
    mobile: '9876543210',
    password: 'test1234',
    state: 'Haryana',
    district: 'Jind',
    soilType: 'Loamy',
  };

  describe('signup', () => {
    it('stores user in localStorage and returns session without password', async () => {
      const result = await signup(testUser);

      expect(result.fullName).toBe('Ramesh Kumar');
      expect(result.email).toBe('ramesh@example.com');
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBeTruthy();
      expect(result.createdAt).toBeTruthy();

      // Verify users array was saved
      const usersRaw = localStorage.getItem('agrisathi_users');
      const users = JSON.parse(usersRaw);
      expect(users).toHaveLength(1);
      // Password should be hashed, not plaintext
      expect(users[0].password).not.toBe('test1234');
    });

    it('sets current user in localStorage', async () => {
      await signup(testUser);
      const currentRaw = localStorage.getItem('agrisathi_current_user');
      const current = JSON.parse(currentRaw);
      expect(current.email).toBe('ramesh@example.com');
    });

    it('allows multiple signups', async () => {
      await signup(testUser);
      await signup({ ...testUser, email: 'second@example.com', mobile: '1111111111' });
      const users = JSON.parse(localStorage.getItem('agrisathi_users'));
      expect(users).toHaveLength(2);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await signup(testUser);
      // Clear the current user so we can test login fresh
      localStorage.removeItem('agrisathi_current_user');
    });

    it('logs in with correct email and password', async () => {
      const result = await login('ramesh@example.com', 'test1234');
      expect(result.email).toBe('ramesh@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('logs in with correct mobile and password', async () => {
      const result = await login('9876543210', 'test1234');
      expect(result.mobile).toBe('9876543210');
    });

    it('throws for wrong password', async () => {
      await expect(login('ramesh@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('throws for non-existent user', async () => {
      await expect(login('nobody@example.com', 'test1234')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    it('sets current user in localStorage on success', async () => {
      await login('ramesh@example.com', 'test1234');
      const current = JSON.parse(localStorage.getItem('agrisathi_current_user'));
      expect(current.email).toBe('ramesh@example.com');
    });
  });

  describe('logout', () => {
    it('removes current user from localStorage', async () => {
      await signup(testUser);
      expect(getCurrentUser()).not.toBeNull();

      logout();
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no session exists', () => {
      expect(getCurrentUser()).toBeNull();
    });

    it('returns user object when session exists', async () => {
      await signup(testUser);
      const user = getCurrentUser();
      expect(user.email).toBe('ramesh@example.com');
    });
  });

  describe('updateUserProfile', () => {
    it('merges updates into the current user', async () => {
      await signup(testUser);
      const updated = updateUserProfile({ soilType: 'Sandy', farmSize: '5 acres' });
      expect(updated.soilType).toBe('Sandy');
      expect(updated.farmSize).toBe('5 acres');
      expect(updated.email).toBe('ramesh@example.com');
    });

    it('persists updates to localStorage', async () => {
      await signup(testUser);
      updateUserProfile({ soilType: 'Black' });
      const stored = JSON.parse(localStorage.getItem('agrisathi_current_user'));
      expect(stored.soilType).toBe('Black');
    });

    it('throws when no user is logged in', () => {
      expect(() => updateUserProfile({ soilType: 'Red' })).toThrow('No user logged in');
    });
  });
});
