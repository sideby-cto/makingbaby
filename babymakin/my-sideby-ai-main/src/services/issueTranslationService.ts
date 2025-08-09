import { TestError, ExecutiveSummary, RoleBasedRecommendations, IssueCategory } from '@/types/chaos-testing';

export class IssueTranslationService {
  private apiKey: string | null = null;
  
  constructor() {
    // We'll handle API key collection in the component
  }
  
  setApiKey(key: string) {
    this.apiKey = key;
  }
  
  async translateIssuesForBusiness(errors: TestError[]): Promise<TestError[]> {
    if (!this.apiKey) {
      console.warn('No API key provided for issue translation');
      return errors;
    }
    
    const translatedErrors = await Promise.all(
      errors.map(async (error) => {
        try {
          const translation = await this.translateSingleIssue(error);
          return { ...error, ...translation };
        } catch (err) {
          console.error('Failed to translate issue:', err);
          return error; // Return original if translation fails
        }
      })
    );
    
    return translatedErrors;
  }
  
  private async translateSingleIssue(error: TestError): Promise<Partial<TestError>> {
    const prompt = this.buildTranslationPrompt(error);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: 'You are a business analyst who translates technical issues into business-friendly insights. Always respond with valid JSON matching the expected format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in API response');
      }
      
      // Parse the JSON response
      const translation = JSON.parse(content);
      return this.validateAndFormatTranslation(translation);
      
    } catch (error) {
      console.error('Error translating issue:', error);
      return this.getFallbackTranslation(error as TestError);
    }
  }
  
  private buildTranslationPrompt(error: TestError): string {
    return `
Analyze this technical issue and provide business-friendly insights in JSON format:

Technical Issue:
- Type: ${error.type}
- Severity: ${error.severity}
- Description: ${error.description}
- Location: ${error.location}
- User Action: ${error.userAction || 'N/A'}

Please respond with JSON in this exact format:
{
  "businessImpact": {
    "userExperience": "How this affects users",
    "businessConsequences": "Impact on business goals",
    "affectedFeatures": ["feature1", "feature2"],
    "severity": "minimal|moderate|significant|critical"
  },
  "suggestedActions": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"], 
    "longTerm": ["action1", "action2"]
  },
  "stakeholders": {
    "primaryOwner": "team or role",
    "affectedTeams": ["team1", "team2"],
    "escalationPath": ["role1", "role2"]
  },
  "userStory": {
    "persona": "user type",
    "scenario": "what user was trying to do",
    "frustration": "user's frustration point"
  },
  "category": "category name",
  "priority": "low|medium|high|urgent",
  "estimatedEffort": "effort description",
  "relatedFeatures": ["feature1", "feature2"]
}

Focus on:
1. Clear, non-technical language for business impact
2. Actionable recommendations 
3. User-centered perspective
4. Business priorities and consequences
`;
  }
  
  private validateAndFormatTranslation(translation: any): Partial<TestError> {
    // Validate and provide defaults for required fields
    return {
      businessImpact: {
        userExperience: translation.businessImpact?.userExperience || 'Users may experience issues',
        businessConsequences: translation.businessImpact?.businessConsequences || 'Potential business impact',
        affectedFeatures: Array.isArray(translation.businessImpact?.affectedFeatures) 
          ? translation.businessImpact.affectedFeatures 
          : ['Unknown'],
        severity: ['minimal', 'moderate', 'significant', 'critical'].includes(translation.businessImpact?.severity)
          ? translation.businessImpact.severity
          : 'moderate'
      },
      suggestedActions: {
        immediate: Array.isArray(translation.suggestedActions?.immediate) 
          ? translation.suggestedActions.immediate 
          : ['Investigate issue'],
        shortTerm: Array.isArray(translation.suggestedActions?.shortTerm) 
          ? translation.suggestedActions.shortTerm 
          : ['Plan resolution'],
        longTerm: Array.isArray(translation.suggestedActions?.longTerm) 
          ? translation.suggestedActions.longTerm 
          : ['Prevent recurrence']
      },
      stakeholders: {
        primaryOwner: translation.stakeholders?.primaryOwner || 'Development Team',
        affectedTeams: Array.isArray(translation.stakeholders?.affectedTeams) 
          ? translation.stakeholders.affectedTeams 
          : ['Engineering'],
        escalationPath: Array.isArray(translation.stakeholders?.escalationPath) 
          ? translation.stakeholders.escalationPath 
          : ['Team Lead', 'Engineering Manager']
      },
      userStory: {
        persona: translation.userStory?.persona || 'User',
        scenario: translation.userStory?.scenario || 'Using the application',
        frustration: translation.userStory?.frustration || 'Unable to complete task'
      },
      category: translation.category || 'general',
      priority: ['low', 'medium', 'high', 'urgent'].includes(translation.priority) 
        ? translation.priority 
        : 'medium',
      estimatedEffort: translation.estimatedEffort || 'To be determined',
      relatedFeatures: Array.isArray(translation.relatedFeatures) 
        ? translation.relatedFeatures 
        : []
    };
  }
  
  private getFallbackTranslation(error: TestError): Partial<TestError> {
    // Provide basic business-friendly translation as fallback
    const severityMap = {
      critical: 'critical',
      high: 'significant', 
      medium: 'moderate',
      low: 'minimal'
    } as const;
    
    return {
      businessImpact: {
        userExperience: `Users may encounter ${error.type} issues when ${error.userAction || 'using the application'}`,
        businessConsequences: `This ${error.severity} issue could impact user satisfaction and application reliability`,
        affectedFeatures: [error.location.split('/').pop() || 'Unknown feature'],
        severity: severityMap[error.severity] || 'moderate'
      },
      suggestedActions: {
        immediate: ['Review issue details', 'Verify reproduction steps'],
        shortTerm: ['Develop fix', 'Test solution'], 
        longTerm: ['Implement monitoring', 'Prevent similar issues']
      },
      stakeholders: {
        primaryOwner: 'Development Team',
        affectedTeams: ['Engineering', 'QA'],
        escalationPath: ['Team Lead', 'Engineering Manager']
      },
      userStory: {
        persona: 'Application User',
        scenario: error.userAction || 'Using the application',
        frustration: `Encounters ${error.type} preventing task completion`
      },
      category: this.categorizeIssue(error),
      priority: this.determinePriority(error),
      estimatedEffort: 'To be assessed by development team',
      relatedFeatures: []
    };
  }
  
  private categorizeIssue(error: TestError): IssueCategory {
    const description = error.description.toLowerCase();
    const type = error.type;
    
    if (type === 'performance') return 'performance';
    if (type === 'vulnerability') return 'security';
    if (type === 'dead_end') return 'navigation';
    
    if (description.includes('form') || description.includes('input')) return 'form-validation';
    if (description.includes('mobile') || description.includes('responsive')) return 'mobile-responsive';
    if (description.includes('accessibility') || description.includes('alt')) return 'accessibility';
    if (description.includes('error') || description.includes('exception')) return 'error-handling';
    
    return 'user-experience';
  }
  
  private determinePriority(error: TestError): 'low' | 'medium' | 'high' | 'urgent' {
    switch (error.severity) {
      case 'critical': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }
  
  async generateExecutiveSummary(errors: TestError[]): Promise<ExecutiveSummary> {
    const criticalIssues = errors.filter(e => e.severity === 'critical').length;
    const highIssues = errors.filter(e => e.severity === 'high').length;
    
    // Calculate scores based on issues found
    const totalIssues = errors.length;
    const stabilityScore = Math.max(0, 100 - (totalIssues * 5));
    const usabilityScore = Math.max(0, 100 - (errors.filter(e => e.type === 'dead_end').length * 10));
    const securityScore = Math.max(0, 100 - (errors.filter(e => e.type === 'vulnerability').length * 15));
    const performanceScore = Math.max(0, 100 - (errors.filter(e => e.type === 'performance').length * 8));
    
    const userImpactScore = Math.max(1, 10 - Math.floor(totalIssues / 2));
    
    let overallHealth: ExecutiveSummary['overallHealth'] = 'excellent';
    let businessRiskLevel: ExecutiveSummary['businessRiskLevel'] = 'low';
    
    if (criticalIssues > 0) {
      overallHealth = 'critical';
      businessRiskLevel = 'critical';
    } else if (highIssues > 2) {
      overallHealth = 'concerning';
      businessRiskLevel = 'high';
    } else if (totalIssues > 5) {
      overallHealth = 'good';
      businessRiskLevel = 'medium';
    }
    
    return {
      overallHealth,
      criticalIssuesCount: criticalIssues,
      userImpactScore,
      businessRiskLevel,
      recommendations: this.generateTopRecommendations(errors),
      keyMetrics: {
        stabilityScore,
        usabilityScore,
        securityScore,
        performanceScore
      }
    };
  }
  
  generateRoleBasedRecommendations(errors: TestError[]): RoleBasedRecommendations {
    const hasPerformanceIssues = errors.some(e => e.type === 'performance');
    const hasSecurityIssues = errors.some(e => e.type === 'vulnerability');
    const hasUxIssues = errors.some(e => e.type === 'dead_end');
    const hasErrors = errors.some(e => e.type === 'error');
    
    return {
      developer: [
        ...(hasErrors ? ['Review error handling and exception management'] : []),
        ...(hasPerformanceIssues ? ['Optimize performance bottlenecks'] : []),
        ...(hasSecurityIssues ? ['Implement security fixes and input validation'] : []),
        'Add comprehensive logging and monitoring',
        'Implement automated testing for discovered scenarios'
      ],
      productManager: [
        ...(hasUxIssues ? ['Prioritize user flow improvements'] : []),
        'Review user journey mapping for problematic areas',
        'Plan feature improvements based on user impact',
        ...(errors.length > 5 ? ['Consider user experience audit'] : []),
        'Communicate issues and timelines to stakeholders'
      ],
      designer: [
        ...(hasUxIssues ? ['Redesign problematic user flows'] : []),
        'Review accessibility standards compliance',
        'Improve error state designs and messaging',
        'Consider mobile-responsive design improvements',
        'Design better feedback mechanisms for users'
      ],
      qa: [
        'Expand test coverage for discovered scenarios',
        'Create regression tests for all found issues',
        'Implement automated chaos testing in CI/CD',
        ...(hasSecurityIssues ? ['Enhance security testing procedures'] : []),
        'Document and track issue resolution'
      ],
      executive: [
        ...(errors.filter(e => e.severity === 'critical').length > 0 ? ['Address critical issues immediately'] : []),
        'Review overall product quality metrics',
        'Consider resource allocation for quality improvements',
        'Monitor user satisfaction and retention metrics',
        'Plan strategic quality initiatives based on findings'
      ]
    };
  }
  
  private generateTopRecommendations(errors: TestError[]): string[] {
    const recommendations = [];
    
    const criticalIssues = errors.filter(e => e.severity === 'critical').length;
    const performanceIssues = errors.filter(e => e.type === 'performance').length;
    const securityIssues = errors.filter(e => e.type === 'vulnerability').length;
    const uxIssues = errors.filter(e => e.type === 'dead_end').length;
    
    if (criticalIssues > 0) {
      recommendations.push(`Address ${criticalIssues} critical issues immediately`);
    }
    
    if (performanceIssues > 2) {
      recommendations.push('Conduct performance optimization review');
    }
    
    if (securityIssues > 0) {
      recommendations.push('Perform security assessment and remediation');
    }
    
    if (uxIssues > 1) {
      recommendations.push('Review and improve user journey flows');
    }
    
    if (errors.length > 10) {
      recommendations.push('Implement comprehensive quality assurance process');
    }
    
    recommendations.push('Establish regular chaos testing in development cycle');
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
}

export const issueTranslationService = new IssueTranslationService();