import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, setAccessToken, setInitialized, logout, getAuthState } from '../auth.store';

beforeEach(() => {
  useAuthStore.setState({
    accessToken: null,
    isAuthenticated: false,
    isInitialized: false,
  });
});

describe('auth.store', () => {
  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = getAuthState();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('setAccessToken', () => {
    it('sets token and marks as authenticated', () => {
      setAccessToken('my-token-123');

      const state = getAuthState();
      expect(state.accessToken).toBe('my-token-123');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setInitialized', () => {
    it('marks store as initialized', () => {
      setInitialized();

      expect(getAuthState().isInitialized).toBe(true);
    });

    it('does not affect other state fields', () => {
      setInitialized();

      const state = getAuthState();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears token and marks as unauthenticated', () => {
      setAccessToken('some-token');
      expect(getAuthState().isAuthenticated).toBe(true);

      logout();

      const state = getAuthState();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('does not reset isInitialized', () => {
      setInitialized();
      setAccessToken('some-token');

      logout();

      expect(getAuthState().isInitialized).toBe(true);
    });
  });
});