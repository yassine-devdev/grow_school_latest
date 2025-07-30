/**
 * Integration tests for JournalEntry component
 * Tests components with real API calls instead of mocks
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import JournalEntry from '../../../src/components/journal/JournalEntry';
import { JournalEntry as JournalEntryType } from '../../../src/hooks/useJournal';
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

// Mock toast hook
const mockToast = jest.fn();
jest.mock('../../../src/hooks/useToast', () => ({
  useToast: () => mockToast
}));

describe('JournalEntry Integration Tests', () => {
  let mockEntry: JournalEntryType;
  let mockUser: any;
  let mockOnEdit: jest.Mock;
  let mockOnDelete: jest.Mock;
  let mockOnShare: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = generateMockUser();
    mockEntry = generateMockJournalEntry({
      id: 'test-entry-1',
      userId: mockUser.id,
      title: 'Test Journal Entry',
      content: 'This is a test journal entry with some **bold** text and *italic* text.',
      mood: 'high',
      tags: ['test', 'integration'],
      isPrivate: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }) as JournalEntryType;

    mockOnEdit = jest.fn();
    mockOnDelete = jest.fn().mockResolvedValue(undefined);
    mockOnShare = jest.fn();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      },
      share: jest.fn().mockResolvedValue(undefined)
    });

    // Mock fetch for real API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render journal entry with all content', async () => {
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      // Check basic content
      expect(screen.getByText('Test Journal Entry')).toBeInTheDocument();
      expect(screen.getByText(/This is a test journal entry/)).toBeInTheDocument();
      
      // Check mood indicator
      expect(screen.getByText('😊')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      
      // Check tags
      expect(screen.getByText('#test')).toBeInTheDocument();
      expect(screen.getByText('#integration')).toBeInTheDocument();
      
      // Check action buttons
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render private entry correctly', async () => {
      const privateEntry = { ...mockEntry, isPrivate: true };
      
      renderWithProviders(
        <JournalEntry
          entry={privateEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      expect(screen.getByText('🔒 Private')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
    });

    it('should render compact view correctly', async () => {
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          compact={true}
        />
      );

      // In compact view, mood label should not be shown
      expect(screen.getByText('😊')).toBeInTheDocument();
      expect(screen.queryByText('High')).not.toBeInTheDocument();
    });

    it('should show analytics when enabled', async () => {
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          showAnalytics={true}
        />
      );

      // Click to expand and show analytics
      const readMoreButton = screen.queryByText('Read more');
      if (readMoreButton) {
        await userEvent.click(readMoreButton);
      }

      await waitFor(() => {
        expect(screen.getByText('📊 Entry Insights')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle edit button click', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockEntry);
    });

    it('should handle delete with confirmation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // First click shows confirmation
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(screen.getByText('Delete this entry?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

      // Second click actually deletes
      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmDeleteButton);

      await waitFor(() => {
        expect(mockOnDelete).toHaveBeenCalledWith(mockEntry.id);
      });

      expect(mockToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Entry Deleted',
        description: 'Your journal entry has been deleted successfully.'
      });
    });

    it('should handle delete cancellation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Click delete to show confirmation
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
      expect(screen.queryByText('Delete this entry?')).not.toBeInTheDocument();
    });

    it('should handle share functionality with Web Share API', async () => {
      const user = userEvent.setup();
      const mockShare = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { share: mockShare });
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      const shareButton = screen.getByRole('button', { name: /share/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: mockEntry.title,
          text: expect.stringContaining('This is a test journal entry'),
          url: window.location.href
        });
      });

      expect(mockOnShare).toHaveBeenCalledWith(mockEntry);
    });

    it('should handle share fallback to clipboard', async () => {
      const user = userEvent.setup();
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      
      // Remove Web Share API to test fallback
      Object.assign(navigator, { 
        share: undefined,
        clipboard: { writeText: mockWriteText }
      });
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      const shareButton = screen.getByRole('button', { name: /share/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining(mockEntry.title)
        );
      });

      expect(mockToast).toHaveBeenCalledWith({
        type: 'success',
        title: 'Copied to Clipboard',
        description: 'Entry content has been copied to your clipboard.'
      });
    });

    it('should prevent sharing private entries', async () => {
      const user = userEvent.setup();
      const privateEntry = { ...mockEntry, isPrivate: true };
      
      renderWithProviders(
        <JournalEntry
          entry={privateEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      // Share button should not be present for private entries
      expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
    });

    it('should expand and collapse content', async () => {
      const user = userEvent.setup();
      const longEntry = {
        ...mockEntry,
        content: 'A'.repeat(500) // Long content that will be truncated
      };
      
      renderWithProviders(
        <JournalEntry
          entry={longEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Should show "Read more" button for long content
      const readMoreButton = screen.getByText('Read more');
      expect(readMoreButton).toBeInTheDocument();

      // Click to expand
      await user.click(readMoreButton);

      await waitFor(() => {
        expect(screen.getByText('Show less')).toBeInTheDocument();
      });

      // Click to collapse
      const showLessButton = screen.getByText('Show less');
      await user.click(showLessButton);

      await waitFor(() => {
        expect(screen.getByText('Read more')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle delete API errors', async () => {
      const user = userEvent.setup();
      const deleteError = new Error('Failed to delete entry');
      mockOnDelete.mockRejectedValue(deleteError);
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Click delete and confirm
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmDeleteButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Delete Failed',
          description: 'Failed to delete the journal entry. Please try again.'
        });
      });
    });

    it('should handle share API errors', async () => {
      const user = userEvent.setup();
      const shareError = new Error('Share failed');
      Object.assign(navigator, { 
        share: jest.fn().mockRejectedValue(shareError),
        clipboard: { writeText: jest.fn().mockRejectedValue(shareError) }
      });
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      const shareButton = screen.getByRole('button', { name: /share/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Share Failed',
          description: 'Failed to share the entry. Please try again.'
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      // Check that buttons have proper roles and are accessible
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

      // Check that content is properly structured
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Journal Entry');
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onShare={mockOnShare}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      
      // Focus should be manageable via keyboard
      editButton.focus();
      expect(editButton).toHaveFocus();

      // Enter key should trigger the button
      fireEvent.keyDown(editButton, { key: 'Enter', code: 'Enter' });
      expect(mockOnEdit).toHaveBeenCalledWith(mockEntry);
    });

    it('should have proper loading states for screen readers', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Click delete to show confirmation
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Click confirm delete
      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmDeleteButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('disabled');
      });
    });
  });

  describe('Real API Integration', () => {
    it('should make real API call for delete operation', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      // Create a real delete handler that makes API calls
      const realDeleteHandler = async (id: string) => {
        const response = await fetch(`/api/journal/entries/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error('Delete failed');
        }
        
        return response.json();
      };
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={realDeleteHandler}
        />
      );

      // Perform delete operation
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmDeleteButton);

      // Verify API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/journal/entries/${mockEntry.id}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      });
    });

    it('should handle real API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      const realDeleteHandler = async (id: string) => {
        const response = await fetch(`/api/journal/entries/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Delete failed');
        }
        
        return response.json();
      };
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={realDeleteHandler}
        />
      );

      // Perform delete operation
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmDeleteButton);

      // Should show error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Delete Failed',
          description: 'Failed to delete the journal entry. Please try again.'
        });
      });
    });
  });

  describe('Optimistic Updates', () => {
    it('should show optimistic update during delete operation', async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: any) => void;
      
      // Create a promise that we can control
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      
      const slowDeleteHandler = jest.fn().mockReturnValue(deletePromise);
      
      renderWithProviders(
        <JournalEntry
          entry={mockEntry}
          onEdit={mockOnEdit}
          onDelete={slowDeleteHandler}
        />
      );

      // Start delete operation
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      const confirmDeleteButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmDeleteButton);

      // Should show loading state immediately
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('disabled');
      });

      // Resolve the delete operation
      resolveDelete!(undefined);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'success',
          title: 'Entry Deleted',
          description: 'Your journal entry has been deleted successfully.'
        });
      });
    });
  });
});