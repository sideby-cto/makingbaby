
import { supabase } from "@/integrations/supabase/client";
import { TestError, TestMetrics, GoalOrientedTestConfig, ExecutiveSummary, RoleBasedRecommendations } from "@/types/chaos-testing";

export class ChaosTestingService {
  private sessionId: string | null = null;
  private isRunning = false;
  private errors: TestError[] = [];
  private metrics: TestMetrics = {
    totalActions: 0,
    errorsFound: 0,
    deadEndsFound: 0,
    vulnerabilitiesFound: 0,
    performanceIssues: 0,
    testDuration: 0,
    coveragePercent: 0
  };
  private startTime: number = 0;
  private visitedUrls = new Set<string>();
  private actionHistory: string[] = [];

  async startTesting(config: GoalOrientedTestConfig): Promise<string> {
    console.log('[ChaosTestingService] Starting chaos testing with config:', config);
    
    if (this.isRunning) {
      throw new Error('Testing is already in progress');
    }

    // Create session in database
    const sessionId = await this.createTestSession(config);
    this.sessionId = sessionId;
    this.isRunning = true;
    this.startTime = Date.now();
    this.errors = [];
    this.metrics = {
      totalActions: 0,
      errorsFound: 0,
      deadEndsFound: 0,
      vulnerabilitiesFound: 0,
      performanceIssues: 0,
      testDuration: 0,
      coveragePercent: 0
    };
    this.visitedUrls.clear();
    this.actionHistory = [];

    // Start the testing process
    this.runTestingLoop(config);
    
    return sessionId;
  }

  private async createTestSession(config: GoalOrientedTestConfig): Promise<string> {
    const { data: session, error } = await supabase
      .from('chaos_test_sessions')
      .insert([{
        config: config as any,
        status: 'running',
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create test session:', error);
      throw new Error('Failed to create test session');
    }

    return session.id;
  }

  private async runTestingLoop(config: GoalOrientedTestConfig) {
    const duration = config.duration * 60 * 1000; // Convert to milliseconds
    const endTime = this.startTime + duration;
    const actionsPerMinute = config.actionsPerMinute || 10;
    const actionInterval = 60000 / actionsPerMinute; // Time between actions in ms
    
    // Add safeguards to prevent infinite testing
    const maxActions = Math.min(config.duration * actionsPerMinute, 1000); // Cap at 1000 actions
    let actionCount = 0;

    console.log(`[ChaosTestingService] Running for ${config.duration} minutes with ${actionsPerMinute} actions per minute (max ${maxActions} actions)`);

    while (Date.now() < endTime && this.isRunning && actionCount < maxActions) {
      try {
        await this.performRandomAction(config);
        this.metrics.totalActions++;
        actionCount++;
        
        // Wait before next action (minimum 100ms to prevent overwhelming)
        const safeInterval = Math.max(actionInterval, 100);
        await new Promise(resolve => setTimeout(resolve, safeInterval));
        
        // Update metrics periodically
        if (this.metrics.totalActions % 10 === 0) {
          await this.updateSessionMetrics();
        }
        
        // Additional safety check: stop if too many errors
        if (this.errors.length > 50) {
          console.warn('[ChaosTestingService] Too many errors encountered, stopping test');
          break;
        }
      } catch (error) {
        console.error('[ChaosTestingService] Error during testing:', error);
        await this.logError({
          type: 'error',
          severity: 'medium',
          description: error instanceof Error ? error.message : 'Unknown error during testing',
          location: window.location.href,
          stackTrace: error instanceof Error ? error.stack : undefined,
          reproductionSteps: [...this.actionHistory.slice(-5)]
        });
        
        // Add delay after error to prevent rapid fire failures
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await this.stopTesting();
  }

  private async performRandomAction(config: GoalOrientedTestConfig) {
    const actions = [
      () => this.navigateToRandomPage(config),
      () => this.clickRandomElement(),
      () => this.fillRandomForm(config),
      () => this.testSecurityVulnerabilities(config),
      () => this.testPerformance()
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const actionName = randomAction.name;
    
    console.log(`[ChaosTestingService] Performing action: ${actionName}`);
    this.actionHistory.push(`${new Date().toISOString()}: ${actionName}`);
    
    try {
      await randomAction();
    } catch (error) {
      console.error(`[ChaosTestingService] Action ${actionName} failed:`, error);
      throw error;
    }
  }

  private async navigateToRandomPage(config: GoalOrientedTestConfig) {
    const routes = [
      '/dashboard',
      '/profile',
      '/availability',
      '/community',
      '/matches',
      '/toolbox',
      '/sponsorship',
      '/crew'
    ];

    // Add admin routes if user has access
    const { data: user } = await supabase.auth.getUser();
    if (user?.user?.email?.includes('@sideby.ai')) {
      routes.push('/admin', '/admin/users', '/admin/matchmaker');
    }

    // Filter out excluded routes
    const availableRoutes = routes.filter(route => 
      !config.excludeRoutes?.some(excluded => route.includes(excluded))
    );

    if (availableRoutes.length === 0) {
      throw new Error('No available routes to navigate to');
    }

    const randomRoute = availableRoutes[Math.floor(Math.random() * availableRoutes.length)];
    
    if (window.location.pathname !== randomRoute) {
      // Use React Router navigation instead of direct history manipulation
      try {
        // Check if we have access to React Router's navigate function
        const navigateEvent = new CustomEvent('chaos-navigate', { 
          detail: { route: randomRoute }
        });
        window.dispatchEvent(navigateEvent);
        
        this.visitedUrls.add(randomRoute);
        
        // Wait for navigation to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for navigation errors
        if (document.querySelector('[data-testid="error-boundary"]')) {
          await this.logError({
            type: 'error',
            severity: 'high',
            description: 'Navigation resulted in error boundary',
            location: randomRoute,
            reproductionSteps: [`Navigate to ${randomRoute}`]
          });
        }
      } catch (error) {
        console.warn('[ChaosTestingService] Navigation failed, skipping:', error);
        // Skip navigation if it fails rather than causing app issues
      }
    }
  }

  private async clickRandomElement() {
    const clickableSelectors = [
      'button:not([disabled])',
      'a[href]:not([disabled])',
      '[role="button"]:not([disabled])',
      'input[type="submit"]:not([disabled])',
      'input[type="button"]:not([disabled])'
    ];

    const clickableElements = document.querySelectorAll(clickableSelectors.join(', '));
    
    if (clickableElements.length === 0) {
      await this.logError({
        type: 'dead_end',
        severity: 'low',
        description: 'No clickable elements found on page',
        location: window.location.href,
        reproductionSteps: [`Navigate to ${window.location.href}`, 'Look for clickable elements']
      });
      return;
    }

    const randomElement = clickableElements[Math.floor(Math.random() * clickableElements.length)] as HTMLElement;
    
    try {
      // Check if element is visible and interactable
      const rect = randomElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        throw new Error('Element is not visible');
      }

      randomElement.click();
      
      // Wait for potential side effects
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for new errors or modals
      this.checkForErrorsOnPage();
      
    } catch (error) {
      await this.logError({
        type: 'error',
        severity: 'medium',
        description: `Failed to click element: ${error}`,
        location: window.location.href,
        reproductionSteps: [
          `Navigate to ${window.location.href}`,
          `Click element with selector: ${this.getElementSelector(randomElement)}`
        ]
      });
    }
  }

  private async fillRandomForm(config: GoalOrientedTestConfig) {
    const forms = document.querySelectorAll('form');
    
    if (forms.length === 0) {
      return; // No forms to test
    }

    const randomForm = forms[Math.floor(Math.random() * forms.length)];
    const inputs = randomForm.querySelectorAll('input, textarea, select');

    for (const input of inputs) {
      const inputElement = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      
      try {
        if (inputElement.type === 'text' || inputElement.type === 'email') {
          if (config.enableSqlInjection) {
            inputElement.value = "'; DROP TABLE users; --";
          } else if (config.enableRandomData) {
            inputElement.value = this.generateRandomData(inputElement.type);
          }
        } else if (inputElement.type === 'password') {
          inputElement.value = config.enableRandomData ? 'TestPassword123!' : '';
        }
        
        // Trigger input events
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        
      } catch (error) {
        await this.logError({
          type: 'error',
          severity: 'low',
          description: `Failed to fill form input: ${error}`,
          location: window.location.href,
          reproductionSteps: [
            `Navigate to ${window.location.href}`,
            `Fill form input of type ${inputElement.type}`
          ]
        });
      }
    }
  }

  private async testSecurityVulnerabilities(config: GoalOrientedTestConfig) {
    if (!config.enableXssTests && !config.enableSqlInjection) {
      return;
    }

    const testPayloads = [];
    
    if (config.enableXssTests) {
      testPayloads.push('<script>alert("XSS")</script>');
      testPayloads.push('javascript:alert("XSS")');
    }
    
    if (config.enableSqlInjection) {
      testPayloads.push("' OR '1'='1");
      testPayloads.push("'; DROP TABLE users; --");
    }

    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    
    for (const input of textInputs) {
      const inputElement = input as HTMLInputElement | HTMLTextAreaElement;
      const originalValue = inputElement.value;
      
      for (const payload of testPayloads) {
        try {
          inputElement.value = payload;
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Wait and check for vulnerabilities
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Check if payload was executed (basic check)
          if (document.querySelector('script') && payload.includes('script')) {
            await this.logError({
              type: 'vulnerability',
              severity: 'critical',
              description: 'Potential XSS vulnerability detected',
              location: window.location.href,
              reproductionSteps: [
                `Navigate to ${window.location.href}`,
                `Enter payload: ${payload}`,
                'Check for script execution'
              ]
            });
          }
          
        } catch (error) {
          // Vulnerability testing error - this might actually be good security
        } finally {
          inputElement.value = originalValue;
        }
      }
    }
  }

  private async testPerformance() {
    const performanceEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (performanceEntry) {
      const loadTime = performanceEntry.loadEventEnd - performanceEntry.loadEventStart;
      
      if (loadTime > 3000) { // More than 3 seconds
        await this.logError({
          type: 'performance',
          severity: 'medium',
          description: `Page load time is slow: ${loadTime}ms`,
          location: window.location.href,
          reproductionSteps: [
            `Navigate to ${window.location.href}`,
            'Measure page load time'
          ]
        });
        this.metrics.performanceIssues++;
      }
    }
  }

  private checkForErrorsOnPage() {
    // Check for common error indicators
    const errorSelectors = [
      '[data-testid="error-boundary"]',
      '.error-message',
      '[role="alert"]',
      '.toast-error'
    ];

    for (const selector of errorSelectors) {
      const errorElement = document.querySelector(selector);
      if (errorElement) {
        this.logError({
          type: 'error',
          severity: 'high',
          description: `Error element found: ${errorElement.textContent}`,
          location: window.location.href,
          reproductionSteps: [...this.actionHistory.slice(-3)]
        });
      }
    }
  }

  private async logError(errorData: Omit<TestError, 'id' | 'timestamp'>) {
    const error: TestError = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...errorData
    };

    this.errors.push(error);
    this.metrics.errorsFound++;

    if (errorData.type === 'dead_end') {
      this.metrics.deadEndsFound++;
    } else if (errorData.type === 'vulnerability') {
      this.metrics.vulnerabilitiesFound++;
    }

    // Log to database
    if (this.sessionId) {
      await supabase
        .from('chaos_test_logs')
        .insert([{
          test_session_id: this.sessionId,
          test_type: errorData.type,
          severity: errorData.severity,
          description: errorData.description,
          location: errorData.location,
          stack_trace: errorData.stackTrace,
          user_action: errorData.userAction,
          reproduction_steps: errorData.reproductionSteps,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);
    }

    console.log('[ChaosTestingService] Error logged:', error);
  }

  private generateRandomData(type: string): string {
    const generators = {
      text: () => 'Test ' + Math.random().toString(36).substring(7),
      email: () => `test${Math.random().toString(36).substring(7)}@example.com`,
      default: () => Math.random().toString(36).substring(7)
    };

    return (generators[type as keyof typeof generators] || generators.default)();
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private async updateSessionMetrics() {
    if (!this.sessionId) return;

    this.metrics.testDuration = Math.floor((Date.now() - this.startTime) / 1000);
    this.metrics.coveragePercent = Math.min((this.visitedUrls.size / 10) * 100, 100); // Rough estimate

    await supabase
      .from('chaos_test_sessions')
      .update({
        total_actions: this.metrics.totalActions,
        errors_found: this.metrics.errorsFound,
        dead_ends_found: this.metrics.deadEndsFound,
        vulnerabilities_found: this.metrics.vulnerabilitiesFound,
        performance_issues: this.metrics.performanceIssues,
        test_duration_seconds: this.metrics.testDuration,
        coverage_percent: this.metrics.coveragePercent
      })
      .eq('id', this.sessionId);
  }

  async stopTesting(): Promise<void> {
    console.log('[ChaosTestingService] Stopping chaos testing');
    
    this.isRunning = false;
    
    if (this.sessionId) {
      await this.updateSessionMetrics();
      
      // Mark session as completed
      await supabase
        .from('chaos_test_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', this.sessionId);
    }
  }

  getErrors(): TestError[] {
    return [...this.errors];
  }

  getMetrics(): TestMetrics {
    return { ...this.metrics };
  }

  isTestingRunning(): boolean {
    return this.isRunning;
  }

  getCurrentSessionId(): string | null {
    return this.sessionId;
  }

  // Generate business insights from technical findings
  async generateBusinessInsights(sessionId: string): Promise<{ 
    executiveSummary: ExecutiveSummary;
    roleBasedRecommendations: RoleBasedRecommendations;
  }> {
    console.log('[ChaosTestingService] Generating business insights for session:', sessionId);

    // Fetch session data and logs
    const { data: session } = await supabase
      .from('chaos_test_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: logs } = await supabase
      .from('chaos_test_logs')
      .select('*')
      .eq('test_session_id', sessionId);

    if (!session || !logs) {
      throw new Error('Failed to fetch session data for insights generation');
    }

    // Calculate executive summary
    const criticalIssues = logs.filter(log => log.severity === 'critical').length;
    const highIssues = logs.filter(log => log.severity === 'high').length;
    const securityIssues = logs.filter(log => log.test_type === 'vulnerability').length;
    const performanceIssues = logs.filter(log => log.test_type === 'performance').length;

    const executiveSummary: ExecutiveSummary = {
      overallHealth: criticalIssues > 0 ? 'critical' : 
                    highIssues > 5 ? 'concerning' : 
                    logs.length > 10 ? 'good' : 'excellent',
      criticalIssuesCount: criticalIssues,
      userImpactScore: Math.max(1, 10 - Math.floor(logs.length / 2)),
      businessRiskLevel: criticalIssues > 0 ? 'critical' :
                        securityIssues > 0 ? 'high' :
                        performanceIssues > 3 ? 'medium' : 'low',
      recommendations: [
        criticalIssues > 0 ? 'Address critical security vulnerabilities immediately' : null,
        performanceIssues > 0 ? 'Optimize application performance to improve user experience' : null,
        logs.length > 15 ? 'Consider comprehensive QA review and testing improvements' : null,
        'Implement automated testing for continuous quality assurance'
      ].filter(Boolean) as string[],
      keyMetrics: {
        stabilityScore: Math.max(0, 100 - (logs.length * 5)),
        usabilityScore: Math.max(0, 100 - (logs.filter(l => l.test_type === 'dead_end').length * 10)),
        securityScore: Math.max(0, 100 - (securityIssues * 20)),
        performanceScore: Math.max(0, 100 - (performanceIssues * 15))
      }
    };

    // Generate role-based recommendations
    const roleBasedRecommendations: RoleBasedRecommendations = {
      developer: [
        criticalIssues > 0 ? 'Fix critical security vulnerabilities in authentication and data validation' : null,
        performanceIssues > 0 ? 'Optimize database queries and implement caching strategies' : null,
        'Add comprehensive error handling and user-friendly error messages',
        'Implement automated testing pipeline with chaos testing integration'
      ].filter(Boolean) as string[],
      
      productManager: [
        logs.length > 10 ? 'Prioritize user experience improvements based on testing findings' : null,
        'Define acceptance criteria that include security and performance requirements',
        'Schedule regular chaos testing sessions to maintain quality standards',
        'Consider user impact when prioritizing bug fixes and improvements'
      ].filter(Boolean) as string[],
      
      designer: [
        logs.filter(l => l.test_type === 'dead_end').length > 0 ? 'Review user interface for navigation clarity and accessibility' : null,
        'Design better error states and loading indicators',
        'Ensure interactive elements are clearly identifiable and accessible',
        'Create design patterns for consistent error handling across the application'
      ].filter(Boolean) as string[],
      
      qa: [
        'Integrate chaos testing into regular QA processes',
        'Develop test cases based on discovered edge cases and error scenarios',
        'Create automated regression tests for identified issues',
        'Establish performance testing benchmarks and monitoring'
      ],
      
      executive: [
        criticalIssues > 0 ? 'Immediate action required: Critical security issues pose business risk' : null,
        'Invest in automated testing infrastructure to prevent future issues',
        'Consider user experience impact on customer satisfaction and retention',
        'Evaluate current development processes and quality assurance practices'
      ].filter(Boolean) as string[]
    };

    // Store insights in database
    await supabase
      .from('chaos_test_sessions')
      .update({
        business_insights: {
          executiveSummary,
          roleBasedRecommendations,
          generatedAt: new Date().toISOString()
        } as any
      })
      .eq('id', sessionId);

    return { executiveSummary, roleBasedRecommendations };
  }
}

// Export singleton instance
export const chaosTestingService = new ChaosTestingService();
