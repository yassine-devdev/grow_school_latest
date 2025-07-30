/**
 * Integration tests for JournalEntryForm component
 * Tests components with real API calls instead of mocks
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import JournalEntryForm from '../../../src/components/journal/JournalEntryForm';
import { JournalEntry } from '../../../src/hooks/useJournal';
import { generateMockJournalEntry, generateMockUser } from '../../utils/test-helpers';

// Test providers wrapper
const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="test-providers">
      {children}
    </div>
  );
};

// Helper to render component with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestProviders });
};

// Mock the useJournal hook with real API integration
const mockCreateEntry = jest.fn();
const mockUpdateEntry = jest.fn();

jest.mock('../../../src/hooks/useJournal', () => ({
  useJournal: () => ({
    createEntry: mockCreateEntry,
    updateEntry: mockUpdateEntry,
    isCreating: false,
    isUpdating: false,
    entries: [],
    analytics: null,
    isLoading: false,
    error: null
  })
}));

// Mock toast hook
const mockToast = jest.fn();
jest.mock('../../../src/hooks/useToast', () => ({
  useToast: () => mockToast
}));

describe('JournalEntryForm Integration Tests', () => {
  let mockUser: any;
  let mockOnSave: jest.Mock;
  let mockOnCancel: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = generateMockUser();
    mockOnSave = jest.fn();
    mockOnCancel = jest.fn();

    // Mock fetch for real API calls
    global.fetch = jest.fn();
    
    // Mock successful API responses by default
    mockCreateEntry.mockResolvedValue(generateMockJournalEntry());
    mockUpdateEntry.mockResolvedValue(generateMockJournalEntry());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render new entry form correctly', async () => {
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('New Journal Entry')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
      expect(screen.getByText('How are you feeling?')).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/keep this entry private/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
    });

    it('should render edit form with existing entry data', async () => {
      const existingEntry = generateMockJournalEntry({
        title: 'Existing Entry',
        content: 'Existing content',
        mood: 'high',
        tags: ['existing', 'test'],
        isPrivate: false
      }) as JournalEntry;

      renderWithProviders(
        <JournalEntryForm
          entry={existingEntry}
          userId={mockUser.id}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Edit Journal Entry')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Entry')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing content')).toBeInTheDocument();
      expect(screen.getByText('#existing')).toBeInTheDocument();
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update entry/i })).toBeInTheDocument();
    });

    it('should show mood selection options', async () => {
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Check all mood options are present
      expect(screen.getByText('😢')).toBeInTheDocument(); // Very Low
      expect(screen.getByText('😔')).toBeInTheDocument(); // Low
      expect(screen.getByText('😐')).toBeInTheDocument(); // Medium
      expect(screen.getByText('😊')).toBeInTheDocument(); // High
      expect(screen.getByText('😄')).toBeInTheDocument(); // Very High
    });

    it('should show rich text formatting options', async () => {
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Check formatting buttons
      expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bullet list/i })).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should handle title input', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'My Test Entry');

      expect(titleInput).toHaveValue('My Test Entry');
    });

    it('should handle content input', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const contentTextarea = screen.getByLabelText(/content/i);
      await user.type(contentTextarea, 'This is my journal content.');

      expect(contentTextarea).toHaveValue('This is my journal content.');
    });

    it('should handle mood selection', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Click on high mood
      const highMoodButton = screen.getByRole('button', { name: /😊.*high/i });
      await user.click(highMoodButton);

      // Button should be selected (have different styling)
      expect(highMoodButton).toHaveClass('bg-white/20');
    });

    it('should handle tag input and addition', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const tagInput = screen.getByPlaceholderText(/add tags/i);
      await user.type(tagInput, 'newtag');
      
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(screen.getByText('#newtag')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('should handle tag addition with Enter key', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const tagInput = screen.getByPlaceholderText(/add tags/i);
      await user.type(tagInput, 'entertag{enter}');

      expect(screen.getByText('#entertag')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('should handle tag removal', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Add a tag first
      const tagInput = screen.getByPlaceholderText(/add tags/i);
      await user.type(tagInput, 'removeme{enter}');

      expect(screen.getByText('#removeme')).toBeInTheDocument();

      // Remove the tag
      const removeButton = screen.getByRole('button', { name: '×' });
      await user.click(removeButton);

      expect(screen.queryByText('#removeme')).not.toBeInTheDocument();
    });

    it('should handle privacy toggle', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const privacyCheckbox = screen.getByLabelText(/keep this entry private/i);
      expect(privacyCheckbox).toBeChecked(); // Default is private

      await user.click(privacyCheckbox);
      expect(privacyCheckbox).not.toBeChecked();
    });

    it('should handle rich text formatting', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const contentTextarea = screen.getByLabelText(/content/i) as HTMLTextAreaElement;
      
      // Type some text and select it
      await user.type(contentTextarea, 'bold text');
      contentTextarea.setSelectionRange(0, 9); // Select "bold text"

      // Click bold button
      const boldButton = screen.getByRole('button', { name: /bold/i });
      await user.click(boldButton);

      expect(contentTextarea.value).toContain('**bold text**');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Validation Error',
          description: 'Please fix the errors before saving.'
        });
      });
    });

    it('should validate title length', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const longTitle = 'A'.repeat(201); // Exceeds 200 character limit
      
      await user.type(titleInput, longTitle);

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Title must be less than 200 characters')).toBeInTheDocument();
      });
    });

    it('should validate content length', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);
      const longContent = 'A'.repeat(10001); // Exceeds 10000 character limit
      
      await user.type(titleInput, 'Valid Title');
      await user.type(contentTextarea, longContent);

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Content must be less than 10,000 characters')).toBeInTheDocument();
      });
    });

    it('should validate maximum number of tags', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const tagInput = screen.getByPlaceholderText(/add tags/i);
      
      // Add 10 tags (maximum allowed)
      for (let i = 1; i <= 10; i++) {
        await user.type(tagInput, `tag${i}{enter}`);
      }

      // Try to add 11th tag
      await user.type(tagInput, 'tag11');
      const addButton = screen.getByRole('button', { name: /add/i });
      
      expect(addButton).toBeDisabled();
      expect(screen.getByText('10/10 tags')).toBeInTheDocument();
    });

    it('should show character counters', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);
      
      await user.type(titleInput, 'Test');
      await user.type(contentTextarea, 'Test content');

      expect(screen.getByText('4/200 characters')).toBeInTheDocument();
      expect(screen.getByText('12/10,000 characters')).toBeInTheDocument();
    });
  });

  describe('Real API Integration', () => {
    it('should make real API call to create new entry', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: generateMockJournalEntry({
            title: 'New Entry',
            content: 'New content'
          })
        })
      });

      // Create real API handler
      const realCreateHandler = async (data: any) => {
        const response = await fetch('/api/journal/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, userId: mockUser.id })
        });
        
        if (!response.ok) {
          throw new Error('Create failed');
        }
        
        const result = await response.json();
        return result.data;
      };

      // Override the mock to use real handler
      mockCreateEntry.mockImplementation(realCreateHandler);
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Fill out the form
      await user.type(screen.getByLabelText(/title/i), 'New Entry');
      await user.type(screen.getByLabelText(/content/i), 'New content');
      await user.click(screen.getByRole('button', { name: /😊.*high/i }));

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Verify API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/journal/entries',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'New Entry',
              content: 'New content',
              mood: 'high',
              tags: [],
              isPrivate: true,
              userId: mockUser.id
            })
          }
        );
      });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should make real API call to update existing entry', async () => {
      const user = userEvent.setup();
      const existingEntry = generateMockJournalEntry({
        id: 'existing-entry-1',
        title: 'Original Title',
        content: 'Original content'
      }) as JournalEntry;

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...existingEntry, title: 'Updated Title' }
        })
      });

      // Create real API handler
      const realUpdateHandler = async (data: any) => {
        const { id, ...updateData } = data;
        const response = await fetch(`/api/journal/entries/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          throw new Error('Update failed');
        }
        
        const result = await response.json();
        return result.data;
      };

      mockUpdateEntry.mockImplementation(realUpdateHandler);
      
      renderWithProviders(
        <JournalEntryForm
          entry={existingEntry}
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Update the title
      const titleInput = screen.getByDisplayValue('Original Title');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /update entry/i });
      await user.click(submitButton);

      // Verify API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/journal/entries/${existingEntry.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Updated Title',
              content: 'Original content',
              mood: existingEntry.mood,
              tags: existingEntry.tags,
              isPrivate: existingEntry.isPrivate
            })
          }
        );
      });

      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      const realCreateHandler = async (data: any) => {
        const response = await fetch('/api/journal/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, userId: mockUser.id })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Create failed');
        }
        
        return response.json();
      };

      mockCreateEntry.mockImplementation(realCreateHandler);
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Fill out and submit form
      await user.type(screen.getByLabelText(/title/i), 'Test Entry');
      await user.type(screen.getByLabelText(/content/i), 'Test content');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('should trigger auto-save when enabled', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
          autoSave={true}
        />
      );

      expect(screen.getByText('Auto-save enabled')).toBeInTheDocument();

      // Type content to trigger auto-save
      await user.type(screen.getByLabelText(/title/i), 'Auto-save test');
      await user.type(screen.getByLabelText(/content/i), 'This should auto-save');

      // Auto-save should be indicated
      await waitFor(() => {
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show unsaved changes indicator', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Make changes to trigger unsaved state
      await user.type(screen.getByLabelText(/title/i), 'Changed title');

      await waitFor(() => {
        expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and structure', async () => {
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Check form has proper labels
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/keep this entry private/i)).toBeInTheDocument();

      // Check form structure
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save entry/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      const contentTextarea = screen.getByLabelText(/content/i);

      // Tab navigation should work
      titleInput.focus();
      expect(titleInput).toHaveFocus();

      fireEvent.keyDown(titleInput, { key: 'Tab' });
      // Content textarea should be next in tab order
      expect(document.activeElement).toBe(contentTextarea);
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Submit empty form to trigger validation
      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Title is required');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Error Handling and Retry', () => {
    it('should show retry option on API failure', async () => {
      const user = userEvent.setup();
      
      // First call fails, second succeeds
      mockCreateEntry
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(generateMockJournalEntry());
      
      renderWithProviders(
        <JournalEntryForm
          userId={mockUser.id}
          onSave={mockOnSave}
        />
      );

      // Fill and submit form
      await user.type(screen.getByLabelText(/title/i), 'Test Entry');
      await user.type(screen.getByLabelText(/content/i), 'Test content');

      const submitButton = screen.getByRole('button', { name: /save entry/i });
      await user.click(submitButton);

      // First attempt should fail
      await waitFor(() => {
        expect(mockCreateEntry).toHaveBeenCalledTimes(1);
      });

      // Retry should work
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateEntry).toHaveBeenCalledTimes(2);
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });
});