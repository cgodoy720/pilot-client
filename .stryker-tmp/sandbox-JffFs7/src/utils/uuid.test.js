// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateUUID, isValidUUID, getUserId, resetUserId, clearUserData } from './uuid';

describe('UUID Utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUUID();
      expect(uuid).toBeDefined();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBeGreaterThan(0);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUID v4', () => {
      const validUUID = '550e8400-e29b-41d4-a716-446655440000';
      expect(isValidUUID(validUUID)).toBe(true);
    });

    it('should return false for invalid UUID', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('12345')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidUUID(null)).toBe(false);
      expect(isValidUUID(undefined)).toBe(false);
      expect(isValidUUID(123)).toBe(false);
    });
  });

  describe('getUserId', () => {
    it('should generate and store a new userId if none exists', () => {
      const userId = getUserId();
      expect(isValidUUID(userId)).toBe(true);
      expect(localStorage.getItem('userId')).toBe(userId);
    });

    it('should return existing userId if valid', () => {
      const existingId = '550e8400-e29b-41d4-a716-446655440000';
      localStorage.setItem('userId', existingId);
      
      const userId = getUserId();
      expect(userId).toBe(existingId);
    });

    it('should generate new userId if existing one is invalid', () => {
      localStorage.setItem('userId', 'invalid-id');
      
      const userId = getUserId();
      expect(isValidUUID(userId)).toBe(true);
      expect(userId).not.toBe('invalid-id');
    });
  });

  describe('resetUserId', () => {
    it('should remove old userId and generate new one', () => {
      const oldId = '550e8400-e29b-41d4-a716-446655440000';
      localStorage.setItem('userId', oldId);
      
      const newId = resetUserId();
      expect(newId).not.toBe(oldId);
      expect(isValidUUID(newId)).toBe(true);
    });
  });

  describe('clearUserData', () => {
    it('should clear all user data from localStorage', () => {
      localStorage.setItem('userId', 'test-id');
      localStorage.setItem('infoSessionStatus', 'completed');
      localStorage.setItem('workshopStatus', 'registered');
      
      clearUserData();
      
      expect(localStorage.getItem('infoSessionStatus')).toBeNull();
      expect(localStorage.getItem('workshopStatus')).toBeNull();
    });

    it('should generate a new userId after clearing', () => {
      const newId = clearUserData();
      expect(isValidUUID(newId)).toBe(true);
      expect(localStorage.getItem('userId')).toBe(newId);
    });
  });
});

