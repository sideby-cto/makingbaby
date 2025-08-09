import { TestError, TestMetrics, TestConfig } from '@/types/chaos-testing';
import { supabase } from '@/integrations/supabase/client';

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

interface ExplorationMemory {
  successfulSequences: ActionSequence[];
  hotSpots: HotSpot[];
  routeMap: RouteInfo[];
  formPatterns: FormPattern[];
}

interface ActionSequence {
  id: string;
  actions: ChaosAction[];
  outcome: 'success' | 'error' | 'dead_end';
  score: number;
  timestamp: Date;
}

interface HotSpot {
  location: string;
  element: string;
  interactionCount: number;
  successRate: number;
  lastVisited: Date;
  errorProne: boolean;
}

interface RouteInfo {
  from: string;
  to: string;
  method: 'navigation' | 'form_submit' | 'button_click';
  success: boolean;
  loadTime: number;
  discoveredAt: Date;
}

interface FormPattern {
  formSelector: string;
  fieldPatterns: Map<string, string[]>; // field type -> successful values
  submissionSuccess: boolean;
  location: string;
}

interface ChaosAction {
  id: string;
  type: 'click' | 'form' | 'navigate' | 'scroll' | 'key' | 'event' | 'random';
  target: string;
  data?: any;
  timestamp: Date;
  success: boolean;
  resultingErrors: number;
}

export class GoalOrientedChaosService {
  private errors: TestError[] = [];
  private isRunning = false;
  private testStartTime?: Date;
  private actionCount = 0;
  private memory: ExplorationMemory = {
    successfulSequences: [],
    hotSpots: [],
    routeMap: [],
    formPatterns: []
  };
  
  private currentSequence: ChaosAction[] = [];
  private explorationQueue: string[] = [];
  private visitedElements = new Map<string, number>(); // element -> visit count
  private lastPosition = { x: 0, y: 0 };

  private maliciousInputs = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "../../../etc/passwd",
    "A".repeat(1000),
    "!@#$%^&*()_+-=[]{}|;':\\\",./<>?",
    "𝕏𝕤𝕤",
    "%00",
    "\\x00\\x01\\x02",
  ];

  private commonWords = [
    'test', 'admin', 'user', 'password', 'email', 'name', 'value', 
    'data', 'input', 'form', 'button', 'link', 'page', 'site'
  ];

  async startGoalOrientedTest(config: GoalOrientedTestConfig): Promise<void> {
    if (this.isRunning) {
      throw new Error('Goal-oriented chaos test is already running');
    }

    this.isRunning = true;
    this.testStartTime = new Date();
    this.errors = [];
    this.actionCount = 0;
    this.currentSequence = [];
    this.explorationQueue = [];
    this.visitedElements.clear();

    console.log('🎯 Starting Goal-Oriented Chaos Testing...', config);

    try {
      await this.runGoalOrientedTestLoop(config);
    } finally {
      this.isRunning = false;
      this.saveMemoryToStorage();
    }
  }

  private async runGoalOrientedTestLoop(config: GoalOrientedTestConfig): Promise<void> {
    const endTime = Date.now() + (config.duration * 60 * 1000);
    const actionInterval = 60000 / config.actionsPerMinute;

    // Load previous memory from storage
    await this.loadMemoryFromStorage();

    // Execute starting action if specified
    if (config.startingAction) {
      await this.executeStartingAction(config.startingAction, config);
    }

    // Initialize exploration queue based on strategy
    this.initializeExplorationQueue(config);

    while (Date.now() < endTime && this.isRunning) {
      try {
        await this.performIntelligentAction(config);
        this.actionCount++;
        
        await this.detectErrors();
        await this.updateMemory();
        
        await this.sleep(actionInterval);
      } catch (error) {
        this.logError({
          id: this.generateId(),
          timestamp: new Date(),
          type: 'error',
          severity: 'medium',
          description: error instanceof Error ? error.message : 'Unknown error',
          location: window.location.href,
          stackTrace: error instanceof Error ? error.stack : undefined,
          reproductionSteps: ['Error occurred during goal-oriented action']
        });
      }
    }

    // Finalize and score sequences
    this.finalizeCurrentSequence();
  }

  private async executeStartingAction(startingAction: GoalOrientedTestConfig['startingAction'], config: GoalOrientedTestConfig): Promise<void> {
    if (!startingAction) return;

    console.log('🎯 Executing starting action:', startingAction);

    const action: ChaosAction = {
      id: this.generateId(),
      type: startingAction.type,
      target: startingAction.target || 'auto-detect',
      timestamp: new Date(),
      success: false,
      resultingErrors: this.errors.length
    };

    try {
      switch (startingAction.type) {
        case 'click':
          await this.performTargetedClick(startingAction.target, config);
          break;
        case 'form':
          await this.performTargetedFormFill(startingAction.target, config);
          break;
        case 'navigate':
          await this.performTargetedNavigation(startingAction.target, config);
          break;
        case 'random':
        default:
          await this.performIntelligentAction(config);
          break;
      }

      action.success = true;
      action.resultingErrors = this.errors.length - action.resultingErrors;
      console.log('✅ Starting action completed successfully');
    } catch (error) {
      console.warn('⚠️ Starting action failed:', error);
    }

    this.currentSequence.push(action);
  }

  private initializeExplorationQueue(config: GoalOrientedTestConfig): void {
    switch (config.explorationStrategy) {
      case 'focused':
        this.initializeFocusedExploration();
        break;
      case 'breadth-first':
        this.initializeBreadthFirstExploration();
        break;
      case 'vulnerability-hunting':
        this.initializeVulnerabilityHunting();
        break;
      case 'user-journey':
        this.initializeUserJourneyExploration();
        break;
    }
  }

  private initializeFocusedExploration(): void {
    // Focus on elements near the current viewport
    const viewportElements = this.getElementsInViewport();
    this.explorationQueue = viewportElements.map(el => this.getElementIdentifier(el));
    console.log('🎯 Initialized focused exploration with', this.explorationQueue.length, 'targets');
  }

  private initializeBreadthFirstExploration(): void {
    // Systematically explore all interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [onClick], [tabindex]'
    );
    this.explorationQueue = Array.from(interactiveElements).map(el => 
      this.getElementIdentifier(el as HTMLElement)
    );
    console.log('🔍 Initialized breadth-first exploration with', this.explorationQueue.length, 'targets');
  }

  private initializeVulnerabilityHunting(): void {
    // Prioritize forms, admin areas, and high-risk elements
    const vulnerableElements = document.querySelectorAll(
      'form, input[type="password"], input[type="email"], [class*="admin"], [class*="sensitive"], [data-sensitive]'
    );
    this.explorationQueue = Array.from(vulnerableElements).map(el => 
      this.getElementIdentifier(el as HTMLElement)
    );
    console.log('🛡️ Initialized vulnerability hunting with', this.explorationQueue.length, 'targets');
  }

  private initializeUserJourneyExploration(): void {
    // Follow common user paths based on memory
    const commonPaths = this.memory.successfulSequences
      .filter(seq => seq.outcome === 'success')
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (commonPaths.length > 0) {
      this.explorationQueue = commonPaths.flatMap(path => 
        path.actions.map(action => action.target)
      );
    } else {
      // Fallback to navigation elements
      const navElements = document.querySelectorAll('nav a, .nav a, .menu a, header a');
      this.explorationQueue = Array.from(navElements).map(el => 
        this.getElementIdentifier(el as HTMLElement)
      );
    }
    console.log('👤 Initialized user journey exploration with', this.explorationQueue.length, 'targets');
  }

  private async performIntelligentAction(config: GoalOrientedTestConfig): Promise<void> {
    const action = await this.selectNextIntelligentAction(config);
    
    if (!action) {
      // Fallback to random action if no intelligent action available
      await this.performRandomAction(config);
      return;
    }

    const chaosAction: ChaosAction = {
      id: this.generateId(),
      type: action.type,
      target: action.target,
      data: action.data,
      timestamp: new Date(),
      success: false,
      resultingErrors: this.errors.length
    };

    try {
      await this.executeAction(action, config);
      chaosAction.success = true;
      
      // Update hot spots
      this.updateHotSpot(action.target, true);
    } catch (error) {
      this.updateHotSpot(action.target, false);
      throw error;
    } finally {
      chaosAction.resultingErrors = this.errors.length - chaosAction.resultingErrors;
      this.currentSequence.push(chaosAction);
    }
  }

  private async selectNextIntelligentAction(config: GoalOrientedTestConfig): Promise<any> {
    // Check if we have targets in the exploration queue
    if (this.explorationQueue.length > 0) {
      const target = this.explorationQueue.shift()!;
      const element = this.findElementByIdentifier(target);
      
      if (element) {
        return this.createActionForElement(element, config);
      }
    }

    // Use memory to find promising actions
    const memoryBasedAction = this.selectMemoryBasedAction(config);
    if (memoryBasedAction) {
      return memoryBasedAction;
    }

    // Discover new interactive elements
    return this.discoverNewAction(config);
  }

  private selectMemoryBasedAction(config: GoalOrientedTestConfig): any {
    // Prioritize hot spots with high success rates
    const promisingHotSpots = this.memory.hotSpots
      .filter(spot => spot.successRate > 0.7 && !spot.errorProne)
      .sort((a, b) => b.successRate - a.successRate);

    if (promisingHotSpots.length > 0) {
      const hotSpot = promisingHotSpots[0];
      const element = this.findElementByIdentifier(hotSpot.element);
      
      if (element) {
        return this.createActionForElement(element, config);
      }
    }

    // Try successful sequences
    const successfulSequences = this.memory.successfulSequences
      .filter(seq => seq.outcome === 'success')
      .sort((a, b) => b.score - a.score);

    if (successfulSequences.length > 0) {
      const sequence = successfulSequences[0];
      const nextAction = sequence.actions.find(action => 
        !this.currentSequence.some(current => current.target === action.target)
      );

      if (nextAction) {
        return {
          type: nextAction.type,
          target: nextAction.target,
          data: nextAction.data
        };
      }
    }

    return null;
  }

  private discoverNewAction(config: GoalOrientedTestConfig): any {
    // Find elements we haven't interacted with much
    const allInteractive = document.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [onClick]'
    );

    const leastVisited = Array.from(allInteractive)
      .map(el => ({
        element: el as HTMLElement,
        identifier: this.getElementIdentifier(el as HTMLElement),
        visitCount: this.visitedElements.get(this.getElementIdentifier(el as HTMLElement)) || 0
      }))
      .sort((a, b) => a.visitCount - b.visitCount)
      .slice(0, 10);

    if (leastVisited.length > 0) {
      const target = leastVisited[Math.floor(Math.random() * leastVisited.length)];
      return this.createActionForElement(target.element, config);
    }

    return null;
  }

  private createActionForElement(element: HTMLElement, config: GoalOrientedTestConfig): any {
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type')?.toLowerCase();

    if (tagName === 'a' || (tagName === 'button' && !element.closest('form'))) {
      return {
        type: 'click',
        target: this.getElementIdentifier(element)
      };
    }
    
    if (element.closest('form') || tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return {
        type: 'form',
        target: this.getElementIdentifier(element.closest('form') || element)
      };
    }
    
    if (tagName === 'a' && element.getAttribute('href')) {
      return {
        type: 'navigate',
        target: element.getAttribute('href')!
      };
    }

    return {
      type: 'click',
      target: this.getElementIdentifier(element)
    };
  }

  private async executeAction(action: any, config: GoalOrientedTestConfig): Promise<void> {
    switch (action.type) {
      case 'click':
        await this.performTargetedClick(action.target, config);
        break;
      case 'form':
        await this.performTargetedFormFill(action.target, config);
        break;
      case 'navigate':
        await this.performTargetedNavigation(action.target, config);
        break;
      default:
        await this.performRandomAction(config);
    }
  }

  private async performTargetedClick(target: string, config: GoalOrientedTestConfig): Promise<void> {
    const element = this.findElementByIdentifier(target);
    if (!element) {
      throw new Error(`Element not found: ${target}`);
    }

    // Update visit count
    const identifier = this.getElementIdentifier(element);
    this.visitedElements.set(identifier, (this.visitedElements.get(identifier) || 0) + 1);

    element.click();
    console.log('🎯 Intelligently clicked:', identifier);
    await this.sleep(500);
  }

  private async performTargetedFormFill(target: string, config: GoalOrientedTestConfig): Promise<void> {
    const form = this.findElementByIdentifier(target) as HTMLFormElement;
    if (!form || form.tagName.toLowerCase() !== 'form') {
      throw new Error(`Form not found: ${target}`);
    }

    const inputs = form.querySelectorAll('input, textarea, select');
    const formPattern = this.getFormPattern(form);

    for (const input of inputs) {
      try {
        await this.fillInputIntelligently(input as HTMLInputElement, config, formPattern);
      } catch (error) {
        console.warn('Failed to fill input intelligently:', error);
      }
    }

    // Try to submit the form
    const submitButton = form.querySelector('input[type="submit"], button[type="submit"]') as HTMLElement;
    if (submitButton) {
      try {
        submitButton.click();
        console.log('🎯 Intelligently submitted form');
        await this.sleep(1000);
        
        // Record form submission success
        this.updateFormPattern(form, true);
      } catch (error) {
        this.updateFormPattern(form, false);
        throw error;
      }
    }
  }

  private async fillInputIntelligently(
    input: HTMLInputElement, 
    config: GoalOrientedTestConfig, 
    formPattern?: FormPattern
  ): Promise<void> {
    const inputType = input.type?.toLowerCase() || 'text';
    const inputName = input.name || input.id || '';
    let value = '';

    // Use smart form filling if enabled
    if (config.smartFormFilling && formPattern) {
      const patterns = formPattern.fieldPatterns.get(inputType);
      if (patterns && patterns.length > 0) {
        value = patterns[Math.floor(Math.random() * patterns.length)];
      }
    }

    // Fallback to type-based filling
    if (!value) {
      value = this.generateValueForInputType(inputType, inputName, config);
    }

    input.focus();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log(`🎯 Intelligently filled ${inputType} input:`, value.substring(0, 50));

    // Record successful value for future use
    if (config.smartFormFilling && formPattern) {
      if (!formPattern.fieldPatterns.has(inputType)) {
        formPattern.fieldPatterns.set(inputType, []);
      }
      formPattern.fieldPatterns.get(inputType)!.push(value);
    }
  }

  private generateValueForInputType(inputType: string, inputName: string, config: GoalOrientedTestConfig): string {
    // Context-aware value generation
    const lowerName = inputName.toLowerCase();
    
    if (lowerName.includes('email')) {
      return this.generateRandomEmail();
    }
    
    if (lowerName.includes('phone') || lowerName.includes('tel')) {
      return this.generateRandomPhone();
    }
    
    if (lowerName.includes('name')) {
      return this.generateRandomName();
    }
    
    if (lowerName.includes('age')) {
      return Math.floor(Math.random() * 80 + 18).toString();
    }

    // Type-based generation
    switch (inputType) {
      case 'email':
        return this.generateRandomEmail();
      case 'password':
        return this.generateRandomPassword();
      case 'number':
        return Math.floor(Math.random() * 1000).toString();
      case 'tel':
        return this.generateRandomPhone();
      case 'url':
        return 'https://example.com';
      case 'date':
        return new Date().toISOString().split('T')[0];
      case 'text':
      case 'search':
      default:
        if (config.enableSqlInjection || config.enableXssTests) {
          if (Math.random() < 0.2) {
            return this.maliciousInputs[Math.floor(Math.random() * this.maliciousInputs.length)];
          }
        }
        return this.generateRandomText();
    }
  }

  private async performTargetedNavigation(target: string, config: GoalOrientedTestConfig): Promise<void> {
    const startUrl = window.location.href;
    
    // Check if route should be excluded
    if (config.excludeRoutes?.some(route => target.includes(route))) {
      throw new Error(`Route excluded: ${target}`);
    }

    // Check route targeting
    if (config.targetRoutes && config.targetRoutes.length > 0) {
      if (!config.targetRoutes.some(route => target.includes(route))) {
        throw new Error(`Route not in target list: ${target}`);
      }
    }

    const loadStartTime = performance.now();
    
    if (target.startsWith('http')) {
      window.location.href = target;
    } else {
      const link = document.querySelector(`a[href="${target}"]`) as HTMLAnchorElement;
      if (link) {
        link.click();
      } else {
        throw new Error(`Navigation target not found: ${target}`);
      }
    }

    await this.sleep(2000); // Wait for navigation
    
    const loadTime = performance.now() - loadStartTime;
    
    // Record route information
    if (config.routeLearning) {
      this.memory.routeMap.push({
        from: startUrl,
        to: window.location.href,
        method: 'navigation',
        success: window.location.href !== startUrl,
        loadTime,
        discoveredAt: new Date()
      });
    }

    console.log('🎯 Intelligently navigated to:', window.location.href);
  }

  // Continue with memory management and utility methods
  private async updateMemory(): Promise<void> {
    // Update sequence scoring based on recent errors
    if (this.currentSequence.length > 0) {
      const recentErrors = this.errors.length - 
        this.currentSequence.reduce((sum, action) => sum + action.resultingErrors, 0);
      
      if (this.currentSequence.length >= 3) {
        this.scoreAndSaveSequence(recentErrors);
      }
    }
  }

  private scoreAndSaveSequence(errorCount: number): void {
    const sequence: ActionSequence = {
      id: this.generateId(),
      actions: [...this.currentSequence],
      outcome: errorCount > 0 ? 'error' : 'success',
      score: this.calculateSequenceScore(this.currentSequence, errorCount),
      timestamp: new Date()
    };

    this.memory.successfulSequences.push(sequence);
    
    // Keep only the best sequences (limit memory depth)
    const maxMemoryDepth = 50;
    if (this.memory.successfulSequences.length > maxMemoryDepth) {
      this.memory.successfulSequences.sort((a, b) => b.score - a.score);
      this.memory.successfulSequences = this.memory.successfulSequences.slice(0, maxMemoryDepth);
    }

    // Reset current sequence
    this.currentSequence = [];
  }

  private calculateSequenceScore(actions: ChaosAction[], errorCount: number): number {
    let score = 0;
    
    // Base score for successful actions
    score += actions.filter(a => a.success).length * 10;
    
    // Penalty for errors
    score -= errorCount * 20;
    
    // Bonus for discovering new elements
    const uniqueTargets = new Set(actions.map(a => a.target)).size;
    score += uniqueTargets * 5;
    
    // Bonus for variety in action types
    const uniqueTypes = new Set(actions.map(a => a.type)).size;
    score += uniqueTypes * 3;

    return Math.max(0, score);
  }

  private updateHotSpot(target: string, success: boolean): void {
    let hotSpot = this.memory.hotSpots.find(h => h.element === target);
    
    if (!hotSpot) {
      hotSpot = {
        location: window.location.href,
        element: target,
        interactionCount: 0,
        successRate: 0,
        lastVisited: new Date(),
        errorProne: false
      };
      this.memory.hotSpots.push(hotSpot);
    }

    hotSpot.interactionCount++;
    hotSpot.lastVisited = new Date();
    
    // Update success rate using exponential moving average
    const alpha = 0.2;
    hotSpot.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * hotSpot.successRate;
    hotSpot.errorProne = hotSpot.successRate < 0.3 && hotSpot.interactionCount > 3;
  }

  private getFormPattern(form: HTMLFormElement): FormPattern {
    const selector = this.getElementIdentifier(form);
    let pattern = this.memory.formPatterns.find(p => p.formSelector === selector);
    
    if (!pattern) {
      pattern = {
        formSelector: selector,
        fieldPatterns: new Map(),
        submissionSuccess: false,
        location: window.location.href
      };
      this.memory.formPatterns.push(pattern);
    }
    
    return pattern;
  }

  private updateFormPattern(form: HTMLFormElement, success: boolean): void {
    const pattern = this.getFormPattern(form);
    pattern.submissionSuccess = success;
  }

  private finalizeCurrentSequence(): void {
    if (this.currentSequence.length > 0) {
      this.scoreAndSaveSequence(0);
    }
  }

  // Storage methods for persistence
  private async saveMemoryToStorage(): Promise<void> {
    try {
      const memoryData = {
        successfulSequences: this.memory.successfulSequences.slice(0, 20), // Limit storage
        hotSpots: this.memory.hotSpots.slice(0, 50),
        routeMap: this.memory.routeMap.slice(0, 100),
        formPatterns: this.memory.formPatterns.slice(0, 20).map(p => ({
          ...p,
          fieldPatterns: Object.fromEntries(p.fieldPatterns)
        }))
      };
      
      localStorage.setItem('chaos-testing-memory', JSON.stringify(memoryData));
      console.log('💾 Saved exploration memory to storage');
    } catch (error) {
      console.warn('Failed to save memory to storage:', error);
    }
  }

  private async loadMemoryFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('chaos-testing-memory');
      if (stored) {
        const memoryData = JSON.parse(stored);
        
        this.memory.successfulSequences = memoryData.successfulSequences || [];
        this.memory.hotSpots = memoryData.hotSpots || [];
        this.memory.routeMap = memoryData.routeMap || [];
        this.memory.formPatterns = (memoryData.formPatterns || []).map((p: any) => ({
          ...p,
          fieldPatterns: new Map(Object.entries(p.fieldPatterns))
        }));
        
        console.log('📂 Loaded exploration memory from storage');
      }
    } catch (error) {
      console.warn('Failed to load memory from storage:', error);
    }
  }

  // Utility methods
  private getElementsInViewport(): HTMLElement[] {
    const elements = document.querySelectorAll('*');
    const viewportElements: HTMLElement[] = [];
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.left >= 0 && 
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth) {
        viewportElements.push(element as HTMLElement);
      }
    }
    
    return viewportElements;
  }

  private findElementByIdentifier(identifier: string): HTMLElement | null {
    // Try ID first
    let element = document.getElementById(identifier);
    if (element) return element;
    
    // Try class name
    element = document.querySelector(`.${identifier}`);
    if (element) return element as HTMLElement;
    
    // Try data attributes
    element = document.querySelector(`[data-testid="${identifier}"]`);
    if (element) return element as HTMLElement;
    
    // Try text content matching
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
      if (el.textContent?.includes(identifier.substring(0, 20))) {
        return el as HTMLElement;
      }
    }
    
    return null;
  }

  // Delegation to original service methods for compatibility
  private async performRandomAction(config: GoalOrientedTestConfig): Promise<void> {
    const actions = [
      () => this.clickRandomElement(),
      () => this.fillRandomForm(config),
      () => this.navigateRandomly(config),
      () => this.scrollRandomly(),
      () => this.pressRandomKeys(),
    ];

    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    await randomAction();
  }

  private async clickRandomElement(): Promise<void> {
    const clickableElements = document.querySelectorAll(
      'button, a, input[type="button"], input[type="submit"], [role="button"], [onClick]'
    );

    if (clickableElements.length === 0) return;

    const element = clickableElements[Math.floor(Math.random() * clickableElements.length)] as HTMLElement;
    const elementId = this.getElementIdentifier(element);

    try {
      element.click();
      console.log('🎲 Random clicked:', elementId);
      await this.sleep(500);
    } catch (error) {
      throw new Error(`Failed to click element: ${elementId}`);
    }
  }

  private async fillRandomForm(config: GoalOrientedTestConfig): Promise<void> {
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) return;

    const form = forms[Math.floor(Math.random() * forms.length)];
    const inputs = form.querySelectorAll('input, textarea, select');

    for (const input of inputs) {
      try {
        await this.fillInputIntelligently(input as HTMLInputElement, config);
      } catch (error) {
        console.warn('Failed to fill input:', error);
      }
    }
  }

  private async navigateRandomly(config: GoalOrientedTestConfig): Promise<void> {
    const links = document.querySelectorAll('a[href]');
    if (links.length === 0) return;

    const link = links[Math.floor(Math.random() * links.length)] as HTMLAnchorElement;
    const href = link.getAttribute('href');

    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
      return;
    }

    try {
      link.click();
      console.log('🎲 Random navigated to:', href);
      await this.sleep(2000);
    } catch (error) {
      throw new Error(`Navigation failed: ${href}`);
    }
  }

  private async scrollRandomly(): Promise<void> {
    const scrollDistance = Math.floor(Math.random() * 1000) - 500;
    window.scrollBy(0, scrollDistance);
    console.log('🎲 Random scrolled by:', scrollDistance);
    await this.sleep(200);
  }

  private async pressRandomKeys(): Promise<void> {
    const keys = ['Enter', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const key = keys[Math.floor(Math.random() * keys.length)];
    
    document.dispatchEvent(new KeyboardEvent('keydown', { key }));
    console.log('🎲 Random pressed key:', key);
  }

  private async detectErrors(): Promise<void> {
    // Reuse error detection from original service
    this.detectConsoleErrors();
    this.detectDeadEnds();
    this.detectPerformanceIssues();
    this.detectAccessibilityIssues();
  }

  private detectConsoleErrors(): void {
    const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
    
    errorElements.forEach(element => {
      if (element.textContent && element.textContent.trim() !== '') {
        this.logError({
          id: this.generateId(),
          timestamp: new Date(),
          type: 'error',
          severity: 'medium',
          description: `Error element found: ${element.textContent}`,
          location: window.location.href,
          reproductionSteps: ['Navigate to current page', 'Error appeared in DOM']
        });
      }
    });
  }

  private detectDeadEnds(): void {
    const clickableElements = document.querySelectorAll(
      'button, a, input[type="button"], input[type="submit"], [role="button"]'
    );

    if (clickableElements.length === 0) {
      this.logError({
        id: this.generateId(),
        timestamp: new Date(),
        type: 'dead_end',
        severity: 'high',
        description: 'No clickable elements found - potential dead end',
        location: window.location.href,
        reproductionSteps: [`Navigate to ${window.location.href}`]
      });
    }
  }

  private detectPerformanceIssues(): void {
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].fetchStart;
      
      if (loadTime > 5000) {
        this.logError({
          id: this.generateId(),
          timestamp: new Date(),
          type: 'performance',
          severity: loadTime > 10000 ? 'critical' : 'high',
          description: `Slow page load: ${(loadTime / 1000).toFixed(2)}s`,
          location: window.location.href,
          reproductionSteps: [`Navigate to ${window.location.href}`, `Monitor load time: ${(loadTime / 1000).toFixed(2)}s`]
        });
      }
    }
  }

  private detectAccessibilityIssues(): void {
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      this.logError({
        id: this.generateId(),
        timestamp: new Date(),
        type: 'vulnerability',
        severity: 'low',
        description: `${imagesWithoutAlt.length} images without alt text found`,
        location: window.location.href,
        reproductionSteps: [`Navigate to ${window.location.href}`, 'Check images for alt attributes']
      });
    }
  }

  private logError(error: TestError): void {
    this.errors.push(error);
    console.warn('🎯 Goal-oriented cat found an issue:', error);
  }

  // Utility generators
  private generateRandomEmail(): string {
    const domains = ['example.com', 'test.org', 'mail.com'];
    const name = this.commonWords[Math.floor(Math.random() * this.commonWords.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}${Math.floor(Math.random() * 1000)}@${domain}`;
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-10) + 'A1!';
  }

  private generateRandomPhone(): string {
    return `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  private generateRandomName(): string {
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }

  private generateRandomText(): string {
    const wordCount = Math.floor(Math.random() * 5) + 1;
    return Array.from({ length: wordCount }, () => 
      this.commonWords[Math.floor(Math.random() * this.commonWords.length)]
    ).join(' ');
  }

  private getElementIdentifier(element: HTMLElement): string {
    return element.id || 
           (typeof element.className === 'string' ? element.className.split(' ')[0] : '') || 
           element.tagName + (element.textContent?.substring(0, 20) || '');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public interface methods
  stopTest(): void {
    this.isRunning = false;
    this.finalizeCurrentSequence();
    console.log('🎯 Goal-oriented cat stopped testing');
  }

  getResults(): { errors: TestError[]; metrics: TestMetrics } {
    const metrics: TestMetrics = {
      totalActions: this.actionCount,
      errorsFound: this.errors.filter(e => e.type === 'error').length,
      deadEndsFound: this.errors.filter(e => e.type === 'dead_end').length,
      vulnerabilitiesFound: this.errors.filter(e => e.type === 'vulnerability').length,
      performanceIssues: this.errors.filter(e => e.type === 'performance').length,
      testDuration: this.testStartTime ? (Date.now() - this.testStartTime.getTime()) / 1000 : 0,
      coveragePercent: Math.min((this.visitedElements.size / Math.max(document.querySelectorAll('*').length, 1)) * 100, 100)
    };

    return { errors: this.errors, metrics };
  }

  isTestRunning(): boolean {
    return this.isRunning;
  }

  getMemoryStats(): ExplorationMemory {
    return { ...this.memory };
  }

  clearMemory(): void {
    this.memory = {
      successfulSequences: [],
      hotSpots: [],
      routeMap: [],
      formPatterns: []
    };
    localStorage.removeItem('chaos-testing-memory');
    console.log('🧹 Cleared exploration memory');
  }

  async translateToBusinessInsights(errors: TestError[]): Promise<TestError[]> {
    try {
      console.log('🔄 Translating goal-oriented chaos testing issues to business insights...');
      
      const { data, error } = await supabase.functions.invoke('translate-chaos-issues', {
        body: { errors }
      });

      if (error) {
        console.error('Failed to translate chaos issues:', error);
        return errors;
      }

      console.log('✅ Successfully translated goal-oriented chaos testing issues');
      return data.translatedErrors || errors;
    } catch (error) {
      console.error('Error calling translation service:', error);
      return errors;
    }
  }
}

export const goalOrientedChaosService = new GoalOrientedChaosService();
