const DEBUG = process.env.NODE_ENV === 'development';

// Structured debug logging
export const debug = {
  auth: (message: string, data?: any) => {
    if (DEBUG) {
      if (data) {
        devLog(`[Auth] ${message}`, data);
      } else {
        devLog(`[Auth] ${message}`);
      }
    }
  },
  error: (message: string, error: any) => {
    if (DEBUG) {
      devError(`[Error] ${message}:`, error);
    }
  }
};

// General purpose debug logging
export const isDev = process.env.NODE_ENV === 'development';

export const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args);
  }
};

export const devError = (...args: any[]) => {
  if (isDev) {
    console.error(...args);
  }
};

export const devGroup = (label: string, fn: () => void) => {
  if (isDev) {
    console.group(label);
    fn();
    console.groupEnd();
  }
}; 