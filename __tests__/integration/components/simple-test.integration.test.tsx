/**
 * Simple integration test to verify setup
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test component
const TestComponent: React.FC<{ message: string }> = ({ message }) => {
  return <div data-testid="test-message">{message}</div>;
};

describe('Simple Integration Test', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render test component', () => {
    render(<TestComponent message="Hello Integration Test" />);
    
    expect(screen.getByTestId('test-message')).toBeInTheDocument();
    expect(screen.getByText('Hello Integration Test')).toBeInTheDocument();
  });

  it('should mock fetch for API calls', async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: 'test data' })
    });

    // Make API call
    const response = await fetch('/api/test');
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith('/api/test');
    expect(data).toEqual({ success: true, data: 'test data' });
  });

  it('should handle API errors', async () => {
    // Mock API error response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    });

    // Make API call
    const response = await fetch('/api/test');
    const data = await response.json();

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Internal server error' });
  });
});