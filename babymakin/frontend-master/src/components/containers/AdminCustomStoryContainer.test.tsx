import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { AdminCustomStoryContainer } from './AdminCustomStoryContainer';
import { StoryType } from "../../utils/types";

// Mock axios module
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

// Mock the `useStory`
jest.mock('../../hooks/story/useStory', () => ({
  useStory: () => ({
    storyIsEditable: false,
    onClickEditStory: jest.fn()
  })
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

// Rerun mocks and rerender component for every test
beforeEach(() => {
  jest.resetAllMocks();
  render(<AdminCustomStoryContainer data={mockStory} />);
});

// Use afterEach to cleanup after each test
afterEach(cleanup);

describe('Test AdminCustomStoryContainer story properties', () => {

  it('renders the author\'s name', async () => {
    const authorName = await screen.findByText(mockStory.author?.name ?? "Anonymous");
    await waitFor(() => {
      expect(authorName).toBeInTheDocument();
    });
  });

  it('renders the story action', async () => {
    const storyActionText = screen.getByText(RegExp(mockStory.storyAction));
    await waitFor(() => {
      expect(storyActionText).toBeInTheDocument();
    });
  });

  it('renders the story experience', async () => {
    const storyExperienceText = screen.getByText(RegExp(mockStory.storyExperience))
    await waitFor(() => {
      expect(storyExperienceText).toBeInTheDocument();
    });
  });

  it('renders the story observation', async () => {
    const storyObservationText = screen.getByText(RegExp(mockStory.storyObservation))
    await waitFor(() => {
      expect(storyObservationText).toBeInTheDocument();
    });
  });

  it('renders the story action, experience, and observation as a combined text', async () => {
    const combinedText = `${mockStory.storyAction} ${mockStory.storyObservation} ${mockStory.storyExperience}`;
    const combinedTextDisplay = screen.getByText(RegExp(combinedText))
    await waitFor(() => {
      expect(combinedTextDisplay).toBeInTheDocument();
    });
  });

  it('renders the correct date format', async () => {
    // Regular expression of "MMM DD, YYYY" format.
    const dateFormatRegex = /\bJan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec\b \d{1,2}, \d{4}/;
    const dateFormatRegexText = screen.getByText(dateFormatRegex)
    await waitFor(() => {
      expect(dateFormatRegexText).toBeInTheDocument();
    });
  });
});

// Test object arrays of promising practices, success signs, student characteristics
describe('Renders arrays of objects in story', () => {

  it('renders promising practices', async () => {
    mockStory.promisingPractices.forEach(async (pp) => {
      const ppText = screen.getByText(pp.name);
      await waitFor(() => {
        expect(ppText).toBeInTheDocument();
      });
    });
  });

  it('renders success signs', async () => {
    mockStory.successSigns.forEach(async (ss) => {
      const ssText = screen.getByText(ss.name);
      await waitFor(() => {
        expect(ssText).toBeInTheDocument();
      });
    });
  });

  it('renders student characteristics', async () => {
    mockStory.studentCharacteristics.forEach(async (sc) => {
      const scText = screen.getByText(sc.name);
      await waitFor(() => {
        expect(scText).toBeInTheDocument();
      });
    });
  });
});

describe('Test array of files (attachments) in story', () => {

  it('checks length for attachments array', async () => {
    const attachmentElements = screen.getAllByTestId('attachment');

    // Check if the number of rendered attachments matches mockStory files
    await waitFor(() => {
      expect(attachmentElements.length).toBe(mockStory.files?.length);
    });
  });

  it('renders attachments with correct urls', async () => {
    const attachmentElements = screen.getAllByTestId('attachment');

    // Check each attachment's URL
    mockStory.files?.forEach(async (attachment, index) => {
      await waitFor(() => {
        expect(attachmentElements[index]).toHaveAttribute('href', attachment.url);
      });
    });
  });

  // Test empty attachments array
  it('checks if the component correctly handles empty attachments array', async () => {
    cleanup(); // clear auto-generated component with attachments first

    const modifiedMockStory = { ...mockStory, files: [] };
    render(<AdminCustomStoryContainer data={modifiedMockStory} />);

    // Attempt to query for attachments, expecting none to be found
    const attachmentElements = screen.queryAllByTestId('attachment');

    // Check if no attachments are rendered by length
    await waitFor(() => {
      expect(attachmentElements).toHaveLength(0);
    });
  });
});

// Check numbers of reactions including likes, high5s, and insights
describe('AdminCustomStoryContainer reaction counts', () => {

  it('matches the number of likes with what is expected', async () => {
    const likesElement = screen.getByTestId('likes-count');
    await waitFor(() => {
      expect(likesElement).toHaveTextContent(mockStory.likes?.toString() ?? '0');
    });
  });

  it('matches the number of high5s with what is expected', async () => {
    const high5sElement = screen.getByTestId('high5s-count');
    await waitFor(() => {
      expect(high5sElement).toHaveTextContent(mockStory.high5s?.toString() ?? '0');
    });
  });

  it('matches the number of insightfuls with what is expected', async () => {
    const insightfulsElement = screen.getByTestId('insightfuls-count');
    await waitFor(() => {
      expect(insightfulsElement).toHaveTextContent(mockStory.Insighfuls?.toString() ?? '0');
    });
  });

  // Add more tests for any other reaction types as needed.
});
