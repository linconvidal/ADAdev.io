// Production-ready logger utility
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV
    this.isProduction = import.meta.env.PROD
  }

  // Only log in development
  log(...args) {
    if (this.isDevelopment) {
      console.log(...args)
    }
  }

  // Only warn in development
  warn(...args) {
    if (this.isDevelopment) {
      console.warn(...args)
    }
  }

  // Always log errors (important for production debugging)
  error(...args) {
    console.error(...args)
  }

  // Only log info in development
  info(...args) {
    if (this.isDevelopment) {
      console.info(...args)
    }
  }

  // Only log debug in development
  debug(...args) {
    if (this.isDevelopment) {
      console.debug(...args)
    }
  }

  // Group logs (development only)
  group(label) {
    if (this.isDevelopment) {
      console.group(label)
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }

  // Time operations (development only)
  time(label) {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }

  // Conditional logging with custom conditions
  conditional(condition, ...args) {
    if (this.isDevelopment && condition) {
      console.log(...args)
    }
  }

  // Production-safe logging (always logs, but with different levels)
  productionLog(level, ...args) {
    switch (level) {
      case 'error':
        console.error(...args)
        break
      case 'warn':
        if (this.isDevelopment) {
          console.warn(...args)
        }
        break
      case 'info':
        if (this.isDevelopment) {
          console.info(...args)
        }
        break
      default:
        if (this.isDevelopment) {
          console.log(...args)
        }
    }
  }
}

// Create singleton instance
const logger = new Logger()

// Export both the class and instance
export { Logger }
export default logger 