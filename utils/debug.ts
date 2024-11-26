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