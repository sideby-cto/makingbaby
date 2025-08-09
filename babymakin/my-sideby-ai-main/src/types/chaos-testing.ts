// Enhanced TestError interface with business impact insights
export interface TestError {
  id: string;
  timestamp: Date;
  type: 'error' | 'dead_end' | 'vulnerability' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  stackTrace?: string;
  userAction?: string;
  reproductionSteps: string[];
  
  // Business impact insights from LLM translation
  businessImpact?: {
    userExperience: string;
    businessConsequences: string;
    affectedFeatures: string[];
    severity: 'minimal' | 'moderate' | 'significant' | 'critical';
  };
  
  // Action recommendations
  suggestedActions?: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  
  // Stakeholder information
  stakeholders?: {
    primaryOwner: string;
    affectedTeams: string[];
    escalationPath: string[];
  };
  
  // User story context
  userStory?: {
    persona: string;
    scenario: string;
    frustration: string;
  };
  
  // Technical context
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort?: string;
  relatedFeatures?: string[];
}

export interface TestMetrics {
  totalActions: number;
  errorsFound: number;
  deadEndsFound: number;
  vulnerabilitiesFound: number;
  performanceIssues: number;
  testDuration: number;
  coveragePercent: number;
}

export interface TestConfig {
  duration: number; // minutes
  actionsPerMinute: number;
  enableRandomData: boolean;
  enableSqlInjection: boolean;
  enableXssTests: boolean;
  maxDepth: number;
  targetRoutes?: string[];
  excludeRoutes?: string[];
}

// Enhanced configuration interface for goal-oriented testing
export interface GoalOrientedTestConfig extends TestConfig {
  startingAction?: {
    type: 'click' | 'form' | 'navigate' | 'random';
    target?: string; // CSS selector or URL
  };
  explorationStrategy: 'focused' | 'breadth-first' | 'vulnerability-hunting' | 'user-journey';
  focusRadius?: number; // How far to explore from starting point (0-100)
  interestWeighting?: {
    forms: number;
    buttons: number;
    links: number;
    errors: number;
  };
  memoryDepth?: number; // How many successful sequences to remember
  smartFormFilling?: boolean;
  routeLearning?: boolean;
}

// Executive summary interfaces
export interface ExecutiveSummary {
  overallHealth: 'excellent' | 'good' | 'concerning' | 'critical';
  criticalIssuesCount: number;
  userImpactScore: number; // 1-10
  businessRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  keyMetrics: {
    stabilityScore: number;
    usabilityScore: number;
    securityScore: number;
    performanceScore: number;
  };
}

// Role-based recommendations
export interface RoleBasedRecommendations {
  developer: string[];
  productManager: string[];
  designer: string[];
  qa: string[];
  executive: string[];
}

// Issue categories for smart categorization
export type IssueCategory = 
  | 'user-experience'
  | 'data-integrity' 
  | 'security'
  | 'performance'
  | 'accessibility'
  | 'integration'
  | 'navigation'
  | 'form-validation'
  | 'error-handling'
  | 'mobile-responsive';