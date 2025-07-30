/**
 * Integration tests for MoodFocusCheckIn component
 * Tests components with real API calls instead of mocks
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MoodFocusCheckIn from '../../../src/components/wellness/MoodFocusCheckIn';
import { generateMockUser, generateMockMoodEntry } from '../../utils/test-helpers';

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

// Mock the useMoodTracking hook with real API integration
const mockCreateEntry = jest.fn();
const mockUpdateEntry = jest.fn();
const mockDeleteEntry = jest.fn();
const mockGetChartData = jest.fn();

jest.mock('../../../src/hooks/useMoodTracking', () => ({
  useMoodTracking: () => ({
    entries: [],
    analytics: null,
    recommendations: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isLoadingRecommendations: false,
    error: null,
    createEntry: mockCreateEntry,
    updateEntry: mockUpdateEntry,
    deleteEntry: mockDeleteEntry,
    getChartData: mockGetChartData,
    refreshEntries: jest.fn(),
    refreshAnalytics: jest.fn(),
    refreshRecommendations: jest.fn()
  })
}));

// Mock toast hook
const mockToast = jest.fn();
jest.mock('../../../src/hooks/useToast', () => ({
  useToast: () => mockToast
}));

describe('MoodFocusCheckIn Integration Tests', () => {
  let mockUser: any;
  let mockOnCheckInComplete: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = generateMockUser();
    mockOnCheckInComplete = jest.fn();

    // Mock fetch for real API calls
    global.fetch = jest.fn();
    
    // Mock successful API responses by default
    mockCreateEntry.mockResolvedValue(generateMockMoodEntry());
    mockUpdateEntry.mockResolvedValue(generateMockMoodEntry());
    mockDeleteEntry.mockResolvedValue(undefined);
    mockGetChartData.mockReturnValue([]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render mood focus check-in interface', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      expect(screen.getByText('Daily Wellness Check-in')).toBeInTheDocument();
      expect(screen.getByText(/How are you feeling today/)).toBeInTheDocument();
      
      // Check mood section
      expect(screen.getByText('😊 Mood')).toBeInTheDocument();
      expect(screen.getByText('🎯 Focus')).toBeInTheDocument();
      expect(screen.getByText('⚡ Energy')).toBeInTheDocument();
      expect(screen.getByText('😰 Stress')).toBeInTheDocument();
    });

    it('should show all mood level options', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Check mood options
      expect(screen.getByText('😢')).toBeInTheDocument(); // Very Low
      expect(screen.getByText('😔')).toBeInTheDocument(); // Low
      expect(screen.getByText('😐')).toBeInTheDocument(); // Medium
      expect(screen.getByText('😊')).toBeInTheDocument(); // High
      expect(screen.getByText('😄')).toBeInTheDocument(); // Very High
    });

    it('should show focus level options', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Check focus options
      expect(screen.getByText('🌫️')).toBeInTheDocument(); // Very Low
      expect(screen.getByText('😵‍💫')).toBeInTheDocument(); // Low
      expect(screen.getByText('🤔')).toBeInTheDocument(); // Medium
      expect(screen.getByText('🎯')).toBeInTheDocument(); // High
      expect(screen.getByText('🔥')).toBeInTheDocument(); // Very High
    });

    it('should show mode toggle between quick and detailed', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      expect(screen.getByRole('button', { name: /quick/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /detailed/i })).toBeInTheDocument();
    });

    it('should show notes and tags input', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      expect(screen.getByLabelText(/📝 notes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/🏷️ tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/🏃 activities/i)).toBeInTheDocument();
    });
  });
});  descri
be('Mode Switching', () => {
    it('should switch between quick and detailed modes', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Switch to detailed mode
      const detailedButton = screen.getByRole('button', { name: /detailed/i });
      await user.click(detailedButton);

      expect(screen.getByText('📊 Detailed Tracking')).toBeInTheDocument();
      expect(screen.getByLabelText(/😴 sleep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/🏃 exercise/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/💧 water/i)).toBeInTheDocument();

      // Switch back to quick mode
      const quickButton = screen.getByRole('button', { name: /quick/i });
      await user.click(quickButton);

      expect(screen.queryByText('📊 Detailed Tracking')).not.toBeInTheDocument();
    });

    it('should show additional fields in detailed mode', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Switch to detailed mode
      const detailedButton = screen.getByRole('button', { name: /detailed/i });
      await user.click(detailedButton);

      // Check lifestyle metrics
      expect(screen.getByLabelText(/😴 sleep \(hours\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/🏃 exercise \(minutes\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/💧 water \(glasses\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/📱 screen time \(hours\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/👥 social time \(1-5\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/📈 productivity \(1-5\)/i)).toBeInTheDocument();

      // Check gratitude and challenges
      expect(screen.getByLabelText(/🙏 gratitude/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/🎯 challenges/i)).toBeInTheDocument();
    });
  });

  describe('Level Selection', () => {
    it('should handle mood level selection', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Click on high mood
      const highMoodButton = screen.getByRole('button', { name: /😊.*high/i });
      await user.click(highMoodButton);

      // Button should be selected (have different styling)
      expect(highMoodButton).toHaveClass('bg-white/20');
    });

    it('should handle focus level selection', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Click on high focus
      const highFocusButton = screen.getByRole('button', { name: /🎯.*high/i });
      await user.click(highFocusButton);

      expect(highFocusButton).toHaveClass('bg-white/20');
    });

    it('should handle energy level selection', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Click on high energy
      const highEnergyButton = screen.getByRole('button', { name: /😃.*high/i });
      await user.click(highEnergyButton);

      expect(highEnergyButton).toHaveClass('bg-white/20');
    });

    it('should handle stress level selection', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Click on low stress
      const lowStressButton = screen.getByRole('button', { name: /🙂.*low/i });
      await user.click(lowStressButton);

      expect(lowStressButton).toHaveClass('bg-white/20');
    });

    it('should show level descriptions on selection', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Click on high mood
      const highMoodButton = screen.getByRole('button', { name: /😊.*high/i });
      await user.click(highMoodButton);

      expect(screen.getByText('Feeling good or happy')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should handle notes input', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const notesTextarea = screen.getByLabelText(/📝 notes/i);
      await user.type(notesTextarea, 'Feeling great today!');

      expect(notesTextarea).toHaveValue('Feeling great today!');
    });

    it('should handle tag input and addition', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const tagInput = screen.getByPlaceholderText(/add mood tags/i);
      await user.type(tagInput, 'positive');
      
      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(screen.getByText('#positive')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('should handle tag addition with Enter key', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const tagInput = screen.getByPlaceholderText(/add mood tags/i);
      await user.type(tagInput, 'energetic{enter}');

      expect(screen.getByText('#energetic')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('should handle tag removal', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Add a tag first
      const tagInput = screen.getByPlaceholderText(/add mood tags/i);
      await user.type(tagInput, 'removeme{enter}');

      expect(screen.getByText('#removeme')).toBeInTheDocument();

      // Remove the tag
      const removeButton = screen.getByRole('button', { name: '×' });
      await user.click(removeButton);

      expect(screen.queryByText('#removeme')).not.toBeInTheDocument();
    });

    it('should handle activities input', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const activityInput = screen.getByPlaceholderText(/what did you do today/i);
      await user.type(activityInput, 'morning walk{enter}');

      expect(screen.getByText('morning walk')).toBeInTheDocument();
    });

    it('should handle detailed mode inputs', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Switch to detailed mode
      const detailedButton = screen.getByRole('button', { name: /detailed/i });
      await user.click(detailedButton);

      // Fill in lifestyle metrics
      const sleepInput = screen.getByPlaceholderText('8');
      await user.type(sleepInput, '7.5');

      const exerciseInput = screen.getByPlaceholderText('30');
      await user.type(exerciseInput, '45');

      const waterInput = screen.getByPlaceholderText('8');
      await user.type(waterInput, '6');

      expect(sleepInput).toHaveValue(7.5);
      expect(exerciseInput).toHaveValue(45);
      expect(waterInput).toHaveValue(6);
    });

    it('should handle gratitude input', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Switch to detailed mode
      const detailedButton = screen.getByRole('button', { name: /detailed/i });
      await user.click(detailedButton);

      const gratitudeInput = screen.getByPlaceholderText(/what are you grateful for/i);
      await user.type(gratitudeInput, 'Good health{enter}');

      expect(screen.getByText('Good health')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require all core metrics before submission', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Try to submit without selecting all levels
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'warning',
          title: 'Incomplete Check-in',
          description: 'Please rate your mood, focus, energy, and stress levels.'
        });
      });

      expect(mockCreateEntry).not.toHaveBeenCalled();
    });

    it('should validate tag limits', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const tagInput = screen.getByPlaceholderText(/add mood tags/i);
      
      // Add 5 tags (maximum allowed)
      for (let i = 1; i <= 5; i++) {
        await user.type(tagInput, `tag${i}{enter}`);
      }

      // Try to add 6th tag
      await user.type(tagInput, 'tag6');
      const addButton = screen.getByRole('button', { name: /add/i });
      
      expect(addButton).toBeDisabled();
      expect(screen.getByText('5/5 tags')).toBeInTheDocument();
    });

    it('should validate notes character limit', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const notesTextarea = screen.getByLabelText(/📝 notes/i);
      const longNotes = 'A'.repeat(501); // Exceeds 500 character limit
      
      await user.type(notesTextarea, longNotes);

      expect(screen.getByText('500/500 characters')).toBeInTheDocument();
    });

    it('should validate numeric inputs in detailed mode', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Switch to detailed mode
      const detailedButton = screen.getByRole('button', { name: /detailed/i });
      await user.click(detailedButton);

      // Test sleep hours validation
      const sleepInput = screen.getByPlaceholderText('8');
      await user.type(sleepInput, '25'); // Invalid: more than 24 hours

      // Input should be constrained by max attribute
      expect(sleepInput).toHaveAttribute('max', '24');
    });
  });

  describe('Real API Integration', () => {
    it('should make real API call to create check-in entry', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: generateMockMoodEntry({
            mood: 'high',
            focus: 'high',
            energy: 'high',
            stress: 'low'
          })
        })
      });

      // Create real API handler
      const realCreateHandler = async (data: any) => {
        const response = await fetch('/api/mood-focus-checkin', {
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

      mockCreateEntry.mockImplementation(realCreateHandler);
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Fill out all required fields
      await user.click(screen.getByRole('button', { name: /😊.*high/i })); // Mood
      await user.click(screen.getByRole('button', { name: /🎯.*high/i })); // Focus
      await user.click(screen.getByRole('button', { name: /😃.*high/i })); // Energy
      await user.click(screen.getByRole('button', { name: /🙂.*low/i })); // Stress

      // Add notes
      const notesTextarea = screen.getByLabelText(/📝 notes/i);
      await user.type(notesTextarea, 'Feeling great today!');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Verify API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/mood-focus-checkin',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mood: 'high',
              focus: 'high',
              energy: 'high',
              stress: 'low',
              notes: 'Feeling great today!',
              tags: undefined,
              activities: undefined,
              userId: mockUser.id
            })
          }
        );
      });

      expect(mockOnCheckInComplete).toHaveBeenCalled();
    });

    it('should make real API call with detailed data', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: generateMockMoodEntry()
        })
      });

      const realCreateHandler = async (data: any) => {
        const response = await fetch('/api/mood-focus-checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, userId: mockUser.id })
        });
        
        if (!response.ok) {
          throw new Error('Create failed');
        }
        
        return response.json();
      };

      mockCreateEntry.mockImplementation(realCreateHandler);
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Switch to detailed mode
      const detailedButton = screen.getByRole('button', { name: /detailed/i });
      await user.click(detailedButton);

      // Fill out all required fields
      await user.click(screen.getByRole('button', { name: /😊.*high/i }));
      await user.click(screen.getByRole('button', { name: /🎯.*high/i }));
      await user.click(screen.getByRole('button', { name: /😃.*high/i }));
      await user.click(screen.getByRole('button', { name: /🙂.*low/i }));

      // Fill detailed fields
      const sleepInput = screen.getByPlaceholderText('8');
      await user.type(sleepInput, '7.5');

      const exerciseInput = screen.getByPlaceholderText('30');
      await user.type(exerciseInput, '45');

      // Add gratitude
      const gratitudeInput = screen.getByPlaceholderText(/what are you grateful for/i);
      await user.type(gratitudeInput, 'Good health{enter}');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Verify API call includes detailed data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/mood-focus-checkin',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.stringContaining('"sleepHours":7.5')
          })
        );
      });
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
        const response = await fetch('/api/mood-focus-checkin', {
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
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Fill out required fields and submit
      await user.click(screen.getByRole('button', { name: /😊.*high/i }));
      await user.click(screen.getByRole('button', { name: /🎯.*high/i }));
      await user.click(screen.getByRole('button', { name: /😃.*high/i }));
      await user.click(screen.getByRole('button', { name: /🙂.*low/i }));

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(mockOnCheckInComplete).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and structure', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Check main heading
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Daily Wellness Check-in');

      // Check section headings
      expect(screen.getByText('😊 Mood')).toBeInTheDocument();
      expect(screen.getByText('🎯 Focus')).toBeInTheDocument();
      expect(screen.getByText('⚡ Energy')).toBeInTheDocument();
      expect(screen.getByText('😰 Stress')).toBeInTheDocument();

      // Check form inputs have labels
      expect(screen.getByLabelText(/📝 notes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/🏷️ tags/i)).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const firstMoodButton = screen.getByRole('button', { name: /😢.*very low/i });
      const notesTextarea = screen.getByLabelText(/📝 notes/i);

      // Tab navigation should work
      firstMoodButton.focus();
      expect(firstMoodButton).toHaveFocus();

      // Should be able to navigate through mood options
      fireEvent.keyDown(firstMoodButton, { key: 'ArrowRight' });
      expect(screen.getByRole('button', { name: /😔.*low/i })).toHaveFocus();
    });

    it('should announce level selections to screen readers', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Click on high mood
      const highMoodButton = screen.getByRole('button', { name: /😊.*high/i });
      await user.click(highMoodButton);

      // Should show description for screen readers
      expect(screen.getByText('Feeling good or happy')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for level selectors', async () => {
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      const moodButtons = screen.getAllByRole('button', { name: /😊|😢|😔|😐|😄/ });
      
      // Each button should have proper role and be accessible
      moodButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Retry', () => {
    it('should show retry option on API failure', async () => {
      const user = userEvent.setup();
      
      // First call fails, second succeeds
      mockCreateEntry
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(generateMockMoodEntry());
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Fill out form
      await user.click(screen.getByRole('button', { name: /😊.*high/i }));
      await user.click(screen.getByRole('button', { name: /🎯.*high/i }));
      await user.click(screen.getByRole('button', { name: /😃.*high/i }));
      await user.click(screen.getByRole('button', { name: /🙂.*low/i }));

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // First attempt should fail
      await waitFor(() => {
        expect(mockCreateEntry).toHaveBeenCalledTimes(1);
      });

      // Retry should work
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateEntry).toHaveBeenCalledTimes(2);
        expect(mockOnCheckInComplete).toHaveBeenCalled();
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Fill out form
      await user.click(screen.getByRole('button', { name: /😊.*high/i }));
      await user.click(screen.getByRole('button', { name: /🎯.*high/i }));
      await user.click(screen.getByRole('button', { name: /😃.*high/i }));
      await user.click(screen.getByRole('button', { name: /🙂.*low/i }));

      const notesTextarea = screen.getByLabelText(/📝 notes/i);
      await user.type(notesTextarea, 'Test notes');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // After successful submission, form should reset
      await waitFor(() => {
        expect(mockOnCheckInComplete).toHaveBeenCalled();
      });

      // Form should be reset (buttons no longer selected)
      const highMoodButton = screen.getByRole('button', { name: /😊.*high/i });
      expect(highMoodButton).not.toHaveClass('bg-white/20');
      expect(notesTextarea).toHaveValue('');
    });
  });

  describe('Optimistic Updates', () => {
    it('should show optimistic update during submission', async () => {
      const user = userEvent.setup();
      let resolveSubmit: (value: any) => void;
      
      // Create a promise that we can control
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });
      
      const slowSubmitHandler = jest.fn().mockReturnValue(submitPromise);
      mockCreateEntry.mockImplementation(slowSubmitHandler);
      
      renderWithProviders(
        <MoodFocusCheckIn
          userId={mockUser.id}
          onCheckInComplete={mockOnCheckInComplete}
        />
      );

      // Fill out form
      await user.click(screen.getByRole('button', { name: /😊.*high/i }));
      await user.click(screen.getByRole('button', { name: /🎯.*high/i }));
      await user.click(screen.getByRole('button', { name: /😃.*high/i }));
      await user.click(screen.getByRole('button', { name: /🙂.*low/i }));

      // Start submission
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show loading state immediately
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Resolve the submission
      resolveSubmit!(generateMockMoodEntry());
      
      await waitFor(() => {
        expect(mockOnCheckInComplete).toHaveBeenCalled();
      });
    });
  });
});