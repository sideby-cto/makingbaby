
import { UpduoSession } from "@/hooks/useUpduoSessions";
import { DateRange } from "react-day-picker";

export const setupMocks = () => {
  // Mock the react-intersection-observer hook
  jest.mock('react-intersection-observer', () => ({
    useInView: jest.fn(() => ({ ref: jest.fn(), inView: false })),
  }));

  // Mock the useSessionAnalysis hook
  jest.mock('../hooks/useSessionAnalysis', () => ({
    useSessionAnalysis: jest.fn(() => ({
      selectedSessionIds: [],
      analyzing: false,
      toggleSessionSelection: jest.fn(),
      clearSelections: jest.fn(),
      analyzeSelectedSessions: jest.fn()
    })),
  }));
  
  // Mock toast hook
  jest.mock('@/hooks/use-toast', () => ({
    useToast: jest.fn(() => ({
      toast: jest.fn()
    }))
  }));
};

export const createMockSessions = (): UpduoSession[] => {
  return [
    {
      id: "1",
      createdAt: Date.now(),
      duration: 1800, // 30 minutes
      type: "PAIR",
      users: [
        { id: "user1", firstName: "John", lastName: "Doe" },
        { id: "user2", firstName: "Jane", lastName: "Smith" }
      ],
      knowledgeNodes: [
        { id: "node1", name: "Session 1", tags: [] }
      ],
      transcriptContents: [
        { speaker: "user1", text: "Hello", startTime: 0, endTime: 5 }
      ]
    },
    {
      id: "2",
      createdAt: Date.now() - 86400000, // 1 day ago
      duration: 2700, // 45 minutes
      type: "SINGLE",
      users: [
        { id: "user3", firstName: "Alice", lastName: "Johnson" }
      ],
      knowledgeNodes: [
        { id: "node2", name: "Session 2", tags: [] }
      ],
      transcriptContents: []
    }
  ];
};

export const createTestProps = () => {
  return {
    mockLoadMore: jest.fn().mockResolvedValue(undefined),
    mockOnSelectSession: jest.fn(),
    mockSetSearchTerm: jest.fn(),
    mockSetDateRange: jest.fn(),
    mockSetSessionType: jest.fn(),
    mockSetHasTranscript: jest.fn(),
    mockResetFilters: jest.fn()
  };
};

export const createDefaultFilterProps = () => {
  return {
    searchTerm: "",
    setSearchTerm: jest.fn(),
    dateRange: undefined as DateRange | undefined,
    setDateRange: jest.fn(),
    sessionType: "all",
    setSessionType: jest.fn(),
    hasTranscript: false,
    setHasTranscript: jest.fn(),
    resetFilters: jest.fn()
  };
};
