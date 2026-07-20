// Servicio de logging para el frontend
// Envía errores y eventos de usuario al backend para auditoría

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Mantener solo los últimos 100 logs en memoria
  private trpcClient: any = null;

  setTRPCClient(client: any) {
    this.trpcClient = client;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    return level === LogLevel.ERROR || level === LogLevel.WARN;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  error(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${message}`, context);
    }

    // Enviar al backend para auditoría usando tRPC
    this.sendToBackend(entry);
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  private async sendToBackend(entry: LogEntry) {
    if (entry.level !== LogLevel.ERROR || !this.trpcClient) return;

    try {
      await this.trpcClient.logs.logError.mutate(entry);
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
