// Utility to suppress known SVG-related console errors from third-party libraries
export const suppressSVGErrors = () => {
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress known SVG attribute errors from third-party libraries
      if (
        message.includes('attribute width: Expected length') ||
        message.includes('attribute height: Expected length') ||
        message.includes('SVG') && message.includes('Expected length') ||
        message.includes('svg') && message.includes('small')
      ) {
        // Silently ignore these errors
        return;
      }
      
      // Let all other errors through
      originalError.apply(console, args);
    };
  }
};
