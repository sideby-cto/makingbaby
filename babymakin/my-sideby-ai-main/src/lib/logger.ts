
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerConfig {
  enabledLevels: LogLevel[];
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  environment: 'development' | 'production' | 'staging';
}

class Logger {
  private config: LoggerConfig;
  
  constructor(config?: Partial<LoggerConfig>) {
    const isDevelopment = import.meta.env.DEV;
    const environment = import.meta.env.VITE_ENVIRONMENT || (isDevelopment ? 'development' : 'production');
    
    this.config = {
      enabledLevels: environment === 'production' 
        ? ['error', 'warn'] 
        : ['error', 'warn', 'info', 'debug'],
      enableConsoleLogging: true,
      enableRemoteLogging: environment === 'production',
      environment: environment as 'development' | 'production' | 'staging',
      ...config
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabledLevels.includes(level);
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private logToConsole(level: LogLevel, formattedMessage: string, originalArgs: any[]): void {
    if (!this.config.enableConsoleLogging) return;

    switch (level) {
      case 'error':
        console.error(formattedMessage, ...originalArgs);
        break;
      case 'warn':
        console.warn(formattedMessage, ...originalArgs);
        break;
      case 'info':
        console.info(formattedMessage, ...originalArgs);
        break;
      case 'debug':
        console.debug(formattedMessage, ...originalArgs);
        break;
    }
  }

  private async logRemotely(level: LogLevel, message: string, context?: Record<string, any>): Promise<void> {
    if (!this.config.enableRemoteLogging || level === 'debug') return;

    try {
      // This could be enhanced to send to external logging service
      // For now, we'll just structure it for future implementation
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: this.config.environment
      };
      
      // Future: Send to logging service
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to log remotely:', error);
    }
  }

  // Make this method public so it can be accessed by the useLogger hook
  public log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const context = args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1]) 
      ? args.pop() as Record<string, any>
      : undefined;

    const formattedMessage = this.formatMessage(level, message, context);
    
    this.logToConsole(level, formattedMessage, args);
    this.logRemotely(level, message, context);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  // Utility method for development debugging
  devOnly(callback: () => void): void {
    if (this.config.environment === 'development') {
      callback();
    }
  }

  // Method to update configuration at runtime
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const logger = new Logger();

// Export types for use in components
export type { LogLevel, LoggerConfig };
export { Logger };
