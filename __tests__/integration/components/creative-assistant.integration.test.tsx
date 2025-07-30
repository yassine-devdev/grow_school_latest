/**
 * Integration tests for CreativeAssistant component
 * Tests components with real API calls instead of mocks
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CreativeAssistant from '../../../src/components/creative/CreativeAssistant';
import { generateMockUser, generateMockCreativeProject } from '../../utils/test-helpers';

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

// Mock the useCreativeAssistant hook with real API integration
const mockBrainstorm = jest.fn();
const mockGenerateFeedback = jest.fn();
const mockGenerateOutline = jest.fn();
const mockGenerateContent = jest.fn();
const mockGeneratePrompts = jest.fn();
const mockCreateProject = jest.fn();

jest.mock('../../../src/hooks/useCreativeAssistant', () => ({
  useCreativeAssistant: () => ({
    sessions: [],
    projects: [],
    isLoading: false,
    isBrainstorming: false,
    isGeneratingFeedback: false,
    isGeneratingOutline: false,
    isGeneratingContent: false,
    isGeneratingPrompts: false,
    error: null,
    brainstorm: mockBrainstorm,
    generateFeedback: mockGenerateFeedback,
    generateOutline: mockGenerateOutline,
    generateContent: mockGenerateContent,
    generatePrompts: mockGeneratePrompts,
    createProject: mockCreateProject,
    refreshSessions: jest.fn(),
    refreshProjects: jest.fn()
  })
}));

// Mock toast hook
const mockToast = jest.fn();
jest.mock('../../../src/hooks/useToast', () => ({
  useToast: () => mockToast
}));

describe('CreativeAssistant Integration Tests', () => {
  let mockUser: any;
  let mockOnSessionCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUser = generateMockUser();
    mockOnSessionCreate = jest.fn();

    // Mock fetch for real API calls
    global.fetch = jest.fn();
    
    // Mock successful API responses by default
    mockBrainstorm.mockResolvedValue(['Idea 1', 'Idea 2', 'Idea 3']);
    mockGenerateFeedback.mockResolvedValue('Great feedback on your content!');
    mockGenerateOutline.mockResolvedValue('1. Introduction\n2. Main Content\n3. Conclusion');
    mockGenerateContent.mockResolvedValue('Generated creative content here.');
    mockGeneratePrompts.mockResolvedValue(['Prompt 1', 'Prompt 2', 'Prompt 3']);
    mockCreateProject.mockResolvedValue(generateMockCreativeProject());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render creative assistant interface', async () => {
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      expect(screen.getByText('🤖 Creative Assistant')).toBeInTheDocument();
      expect(screen.getByText(/AI-powered creative companion/)).toBeInTheDocument();
      
      // Check mode buttons
      expect(screen.getByRole('button', { name: /💡.*brainstorm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📝.*feedback/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /📋.*outline/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /✨.*generate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /🎯.*prompts/i })).toBeInTheDocument();
    });

    it('should show project type selection', async () => {
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Check project type options
      expect(screen.getByText('✍️')).toBeInTheDocument(); // Writing
      expect(screen.getByText('🎨')).toBeInTheDocument(); // Design
      expect(screen.getByText('🎬')).toBeInTheDocument(); // Video
      expect(screen.getByText('🎵')).toBeInTheDocument(); // Music
      expect(screen.getByText('🖼️')).toBeInTheDocument(); // Art
    });

    it('should show input area for most modes', async () => {
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      expect(screen.getByPlaceholderText(/describe your project or idea/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate ideas/i })).toBeInTheDocument();
    });
  });
});  desc
ribe('Mode Switching', () => {
    it('should switch between different modes', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Switch to feedback mode
      const feedbackButton = screen.getByRole('button', { name: /📝.*feedback/i });
      await user.click(feedbackButton);

      expect(screen.getByPlaceholderText(/paste your content here/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get feedback/i })).toBeInTheDocument();

      // Switch to outline mode
      const outlineButton = screen.getByRole('button', { name: /📋.*outline/i });
      await user.click(outlineButton);

      expect(screen.getByPlaceholderText(/enter your project title/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create outline/i })).toBeInTheDocument();
    });

    it('should show content style selector in generate mode', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Switch to generate mode
      const generateButton = screen.getByRole('button', { name: /✨.*generate/i });
      await user.click(generateButton);

      expect(screen.getByText('Content Style')).toBeInTheDocument();
      expect(screen.getByDisplayValue('professional')).toBeInTheDocument();
    });

    it('should not show input area in prompts mode', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Switch to prompts mode
      const promptsButton = screen.getByRole('button', { name: /🎯.*prompts/i });
      await user.click(promptsButton);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /get prompts/i })).toBeInTheDocument();
    });
  });

  describe('Real API Integration - Brainstorming', () => {
    it('should make real API call for brainstorming', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ideas: ['Creative idea 1', 'Creative idea 2', 'Creative idea 3']
        })
      });

      // Create real API handler
      const realBrainstormHandler = async (request: any) => {
        const response = await fetch('/api/creative-assistant/brainstorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        
        if (!response.ok) {
          throw new Error('Brainstorm failed');
        }
        
        const result = await response.json();
        return result.ideas;
      };

      mockBrainstorm.mockImplementation(realBrainstormHandler);
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Fill in prompt and submit
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'I want to create an educational game');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      // Verify API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/creative-assistant/brainstorm',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: 'I want to create an educational game',
              projectType: 'writing',
              projectId: undefined
            })
          }
        );
      });

      // Check results are displayed
      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('Creative idea 1')).toBeInTheDocument();
      });
    });

    it('should handle brainstorming API errors', async () => {
      const user = userEvent.setup();
      
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'AI service unavailable' })
      });

      const realBrainstormHandler = async (request: any) => {
        const response = await fetch('/api/creative-assistant/brainstorm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Brainstorm failed');
        }
        
        return response.json();
      };

      mockBrainstorm.mockImplementation(realBrainstormHandler);
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Fill in prompt and submit
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      // Should handle error gracefully
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Brainstorming Failed',
          description: 'AI service unavailable'
        });
      });
    });
  });

  describe('Real API Integration - Feedback', () => {
    it('should make real API call for feedback generation', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          feedback: 'Your content is well-structured and engaging. Consider adding more examples.'
        })
      });

      const realFeedbackHandler = async (request: any) => {
        const response = await fetch('/api/creative-assistant/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        
        if (!response.ok) {
          throw new Error('Feedback failed');
        }
        
        const result = await response.json();
        return result.feedback;
      };

      mockGenerateFeedback.mockImplementation(realFeedbackHandler);
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Switch to feedback mode
      const feedbackButton = screen.getByRole('button', { name: /📝.*feedback/i });
      await user.click(feedbackButton);

      // Fill in content and submit
      const contentInput = screen.getByPlaceholderText(/paste your content here/i);
      await user.type(contentInput, 'This is my creative content that needs feedback.');

      const getFeedbackButton = screen.getByRole('button', { name: /get feedback/i });
      await user.click(getFeedbackButton);

      // Verify API call was made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/creative-assistant/feedback',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: 'This is my creative content that needs feedback.',
              projectType: 'writing',
              projectId: undefined
            })
          }
        );
      });

      // Check results are displayed
      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText(/Your content is well-structured/)).toBeInTheDocument();
      });
    });
  });

  describe('Project Management', () => {
    it('should create new project', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Click new project button
      const newProjectButton = screen.getByRole('button', { name: /\+ new project/i });
      await user.click(newProjectButton);

      // Fill in project form
      expect(screen.getByText('Create New Project')).toBeInTheDocument();
      
      const titleInput = screen.getByPlaceholderText(/enter project title/i);
      await user.type(titleInput, 'My Creative Project');

      const descriptionInput = screen.getByPlaceholderText(/describe your project/i);
      await user.type(descriptionInput, 'This is a test project');

      // Submit project creation
      const createButton = screen.getByRole('button', { name: /create project/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          title: 'My Creative Project',
          description: 'This is a test project',
          type: 'writing',
          status: 'planning',
          userId: mockUser.id
        });
      });
    });

    it('should validate project creation form', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Click new project button
      const newProjectButton = screen.getByRole('button', { name: /\+ new project/i });
      await user.click(newProjectButton);

      // Try to submit without title
      const createButton = screen.getByRole('button', { name: /create project/i });
      expect(createButton).toBeDisabled();

      // Add title to enable button
      const titleInput = screen.getByPlaceholderText(/enter project title/i);
      await user.type(titleInput, 'Valid Title');

      expect(createButton).not.toBeDisabled();
    });

    it('should cancel project creation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Open project form
      const newProjectButton = screen.getByRole('button', { name: /\+ new project/i });
      await user.click(newProjectButton);

      // Cancel creation
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
      expect(mockCreateProject).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should validate prompt input', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Try to submit without prompt
      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'warning',
          title: 'Input Required',
          description: 'Please enter a prompt for brainstorming.'
        });
      });

      expect(mockBrainstorm).not.toHaveBeenCalled();
    });

    it('should enforce character limits', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      const longPrompt = 'A'.repeat(2001); // Exceeds 2000 character limit
      
      await user.type(promptInput, longPrompt);

      // Should show character count
      expect(screen.getByText('2000/2000 characters')).toBeInTheDocument();
    });
  });

  describe('Results Display and Interaction', () => {
    it('should display brainstorming results correctly', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Fill and submit
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      // Check results display
      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
        expect(screen.getByText('Idea 1')).toBeInTheDocument();
        expect(screen.getByText('Idea 2')).toBeInTheDocument();
        expect(screen.getByText('Idea 3')).toBeInTheDocument();
      });

      // Check action buttons
      expect(screen.getByRole('button', { name: /📋 copy/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /✨ clear/i })).toBeInTheDocument();
    });

    it('should copy results to clipboard', async () => {
      const user = userEvent.setup();
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, { clipboard: { writeText: mockWriteText } });
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Generate results first
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      // Copy results
      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /📋 copy/i });
        return user.click(copyButton);
      });

      expect(mockWriteText).toHaveBeenCalledWith('Idea 1\n\nIdea 2\n\nIdea 3');
    });

    it('should clear results', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Generate results first
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      // Clear results
      await waitFor(() => {
        const clearButton = screen.getByRole('button', { name: /✨ clear/i });
        return user.click(clearButton);
      });

      expect(screen.queryByText('Results')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Check main heading
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('🤖 Creative Assistant');

      // Check form elements
      expect(screen.getByLabelText(/project type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your prompt/i)).toBeInTheDocument();

      // Check buttons have proper roles
      expect(screen.getByRole('button', { name: /generate ideas/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      const generateButton = screen.getByRole('button', { name: /generate ideas/i });

      // Tab navigation should work
      promptInput.focus();
      expect(promptInput).toHaveFocus();

      fireEvent.keyDown(promptInput, { key: 'Tab' });
      // Generate button should be next in tab order
      expect(document.activeElement).toBe(generateButton);
    });

    it('should announce loading states to screen readers', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      let resolvePromise: (value: any) => void;
      const slowPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockBrainstorm.mockReturnValue(slowPromise);
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Start generation
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise!(['Idea 1', 'Idea 2']);

      await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Retry', () => {
    it('should show retry option on API failure', async () => {
      const user = userEvent.setup();
      
      // First call fails, second succeeds
      mockBrainstorm
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(['Retry idea 1', 'Retry idea 2']);
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Fill and submit
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      // First attempt should fail
      await waitFor(() => {
        expect(mockBrainstorm).toHaveBeenCalledTimes(1);
      });

      // Retry should work
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockBrainstorm).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Retry idea 1')).toBeInTheDocument();
      });
    });

    it('should handle network timeouts gracefully', async () => {
      const user = userEvent.setup();
      
      mockBrainstorm.mockRejectedValue(new Error('Request timeout'));
      
      renderWithProviders(
        <CreativeAssistant
          userId={mockUser.id}
          onSessionCreate={mockOnSessionCreate}
        />
      );

      // Fill and submit
      const promptInput = screen.getByPlaceholderText(/describe your project or idea/i);
      await user.type(promptInput, 'Test prompt');

      const generateButton = screen.getByRole('button', { name: /generate ideas/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          type: 'error',
          title: 'Brainstorming Failed',
          description: 'Request timeout'
        });
      });
    });
  });
});