import { ErrorCodes, createAppError, extractErrorCode } from './errorCodes';

describe('ErrorCodes', () => {
  it('contains all required error code categories', () => {
    // Validation
    expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCodes.INVALID_STAGE).toBe('INVALID_STAGE');
    expect(ErrorCodes.MISSING_REQUIRED_FIELD).toBe('MISSING_REQUIRED_FIELD');

    // Entity
    expect(ErrorCodes.ENTITY_NOT_FOUND).toBe('ENTITY_NOT_FOUND');
    expect(ErrorCodes.ENTITY_CONFLICT).toBe('ENTITY_CONFLICT');

    // Business logic
    expect(ErrorCodes.CAPACITY_GATE).toBe('CAPACITY_GATE');
    expect(ErrorCodes.STAGE_TRANSITION_INVALID).toBe('STAGE_TRANSITION_INVALID');
    expect(ErrorCodes.SYNC_IN_PROGRESS).toBe('SYNC_IN_PROGRESS');
    expect(ErrorCodes.CUSTOMER_MAPPING_MISSING).toBe('CUSTOMER_MAPPING_MISSING');

    // Service
    expect(ErrorCodes.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
    expect(ErrorCodes.AUTHENTICATION_FAILED).toBe('AUTHENTICATION_FAILED');
    expect(ErrorCodes.EXTERNAL_API_ERROR).toBe('EXTERNAL_API_ERROR');

    // Data
    expect(ErrorCodes.CSV_PARSE_ERROR).toBe('CSV_PARSE_ERROR');
    expect(ErrorCodes.ENRICHMENT_FAILED).toBe('ENRICHMENT_FAILED');
  });

  it('error codes are unique', () => {
    const values = Object.values(ErrorCodes);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe('createAppError', () => {
  it('creates structured error with code and message', () => {
    const err = createAppError(ErrorCodes.VALIDATION_ERROR, 'Invalid input');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid input');
    expect(err.details).toBeUndefined();
  });

  it('includes details when provided', () => {
    const err = createAppError(ErrorCodes.ENTITY_NOT_FOUND, 'Not found', { id: '123' });
    expect(err.details).toEqual({ id: '123' });
  });
});

describe('extractErrorCode', () => {
  it('extracts known error code from Error message', () => {
    const error = new Error('CAPACITY_GATE: Cannot convert without score');
    expect(extractErrorCode(error)).toBe('CAPACITY_GATE');
  });

  it('returns null for unknown error messages', () => {
    const error = new Error('Something went wrong');
    expect(extractErrorCode(error)).toBeNull();
  });

  it('returns null for non-Error values', () => {
    expect(extractErrorCode('string error')).toBeNull();
    expect(extractErrorCode(null)).toBeNull();
    expect(extractErrorCode(42)).toBeNull();
  });

  it('extracts SERVICE_UNAVAILABLE from nested message', () => {
    const error = new Error('Request failed: SERVICE_UNAVAILABLE - MCP client down');
    expect(extractErrorCode(error)).toBe('SERVICE_UNAVAILABLE');
  });
});
