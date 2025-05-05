// Configuration constants for the app
// In production, use environment variables or a secure backend

export const Config = {
  openai: {
    apiKey:
      process.env.EXPO_PUBLIC_OPENAI_API_KEY || "YOUR_OPENAI_API_KEY_HERE",
  },
};
