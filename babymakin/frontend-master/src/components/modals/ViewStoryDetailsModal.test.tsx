import React from 'react';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ViewStoryDetailsModal } from './ViewStoryDetailsModal'; // Adjust the import path as necessary
import { StoryType } from "../../utils/types";

// Mock external dependencies
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  })),
}));

// Mock hooks
jest.mock('../../hooks/useUserGlobalState', () => ({
  useUserGlobalState: () => ([{}, jest.fn()]),
}));

// Mock the `useGetStoryData`
jest.mock('../../utils/hooks/query.hooks', () => ({
    ...jest.requireActual('../../utils/hooks/query.hooks'), // Use actual for other hooks
    useGetStoryData: () => ({
      story: mockStory,
      refetch: jest.fn()
    })
}));

// Mock the `_useMutateCollections`
jest.mock('../../utils/hooks/mutation.hooks', () => ({
    _useMutateCollections: () => ({
      handler: jest.fn(),
      isPending: false,
      mutationSuccess: true,
      mutationError: false
    })
}));

// Create a mock StoryType object for testing
const mockStory: StoryType = {
    type: "SW",
    author: {
      id: "randomIdForTesting",
      name: "Kippy Smith",
      permissionLevel: "Admin",
      email: "kippy@example.com",
      createdAt: new Date(),
    },
    storyAction: "Took action on feedback.",
    storyExperience: "Resulted in improved student engagement.",
    storyObservation: "Students participated more actively in class discussions.",
  
    promisingPractices: [
      { _id: "pp1", name: "Collaborative Learning", createdAt: new Date() },
      { _id: "pp2", name: "Inquiry-Based Instruction", createdAt: new Date() }
    ],
    successSigns: [
      { _id: "ss1", name: "Increased Engagement", createdAt: new Date() },
      { _id: "ss2", name: "Improved Test Scores", createdAt: new Date() }
    ],
    studentCharacteristics: [
      { _id: "sc1", name: "All Student", createdAt: new Date() },
      { _id: "sc2", name: "K12", createdAt: new Date() }
    ],
  
    files: [
      { _id: '1', url: 'https://localhost:8000/file1.pdf' },
      { _id: '2', url: 'https://localhost:8000/file2.jpg' }
    ],
  
    createdAt: new Date(),
    reactions: 5,
    likes: 3,
    high5s: 4,
    Insighfuls: 2,
};

// Set up rendering before each test
beforeEach(() => {
    jest.resetAllMocks();
    render(<ViewStoryDetailsModal story={mockStory} onClose={() => {}} />);
});

// Use afterEach to cleanup after each test
afterEach(cleanup);

describe('ViewStoryDetailsModal', () => {
    it('renders the author\'s name', () => {
        expect(screen.getByText(mockStory.author?.name ?? "Anonymous")).toBeInTheDocument();
    });

    it('renders the story action', () => {
        expect(screen.getByText(RegExp(mockStory.storyAction))).toBeInTheDocument();
    });

    it('renders the story experience', () => {
        expect(screen.getByText(RegExp(mockStory.storyExperience))).toBeInTheDocument();
    });

    it('renders the story observation', () => {
        expect(screen.getByText(RegExp(mockStory.storyObservation))).toBeInTheDocument();
    });

    it('renders the story action, experience, and observation as a combined text', () => {
        let combinedText = `${mockStory.storyAction} ${mockStory.storyObservation} ${mockStory.storyExperience}`;
        expect(screen.getByText(RegExp(combinedText))).toBeInTheDocument();
    });
});

describe('<ViewStoryDetailsModal /> attachments array', () => {
  
    it('checks length for attachments array', () => {
        const modalContainer = screen.getByTestId('modal-container');
        const attachmentElements = within(modalContainer).queryAllByTestId('attachment');

        // Check if the number of rendered attachments matches mockStory files
        expect(attachmentElements.length).toBe(mockStory.files?.length);
    });

    it('handles no attachments correctly', () => {
        cleanup(); // clear auto-generated component with attachments first

        const modifiedMockStory = { ...mockStory, files: [] };
        render(<ViewStoryDetailsModal story={modifiedMockStory} onClose={() => {}} />);

        // Attempt to query for attachments, expecting none to be found
        const modalContainer = screen.getByTestId('modal-container');
        const attachmentElements = within(modalContainer).queryAllByTestId('attachment');

        // Check if no attachments are rendered
        expect(attachmentElements).toHaveLength(0); // inspect length
        expect(screen.getByText(`No Attachment Available`)).toBeInTheDocument(); // inspect prompt
    });

    it('renders attachments with correct urls', () => {
        const attachmentElements = screen.getAllByTestId('attachment');
    
        // Check each attachment's URL
        mockStory.files?.forEach((attachment, index) => {
            expect(attachmentElements[index]).toHaveAttribute('href', attachment.url);
        });
    });
});

// Check numbers of reactions including likes, high5s, and insights
describe('AdminCustomStoryContainer reaction counts', () => {

    it('checks the number of likes', async () => {
        const modalContainer = screen.getByTestId('modal-container');
        const likesElement = within(modalContainer).getByTestId('modal-likes');

        await waitFor(() => {
            expect(likesElement).toHaveTextContent(mockStory.likes?.toString() ?? '0');
        });
    });
  
    it('checks the number of high5s', async () => {
        const modalContainer = screen.getByTestId('modal-container');
        const high5sElement = within(modalContainer).getByTestId('modal-high5s');
  
        await waitFor(() => {
            expect(high5sElement).toHaveTextContent(mockStory.high5s?.toString() ?? '0');
        });
    });
  
    it('checks the number of insightfuls', async () => {
        const modalContainer = screen.getByTestId('modal-container');
        const insightfulsElement = within(modalContainer).getByTestId('modal-insightfuls');

        await waitFor(() => {
            expect(insightfulsElement).toHaveTextContent(mockStory.Insighfuls?.toString() ?? '0');
        });
    });
  
    // Add more tests for any other reaction types as needed.
});