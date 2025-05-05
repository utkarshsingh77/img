/**
 * Environment configuration
 * Store environment variables and API keys here
 */

// Replicate API token for AI image generation
// In a production app, this should be secured better
export const REPLICATE_API_TOKEN = "r8_6gTNmoDrSNu2Kyon4Kk7OC0hIjMtZro08yJ42";

// Check if required environment variables are set
export const checkEnvVars = () => {
  if (!REPLICATE_API_TOKEN) {
    console.warn(
      "Warning: REPLICATE_API_TOKEN is not set. AI image generation will not work."
    );
    return false;
  }

  // Add validation for the token format (r8_ prefix)
  if (!REPLICATE_API_TOKEN.startsWith("r8_")) {
    console.warn(
      "Warning: REPLICATE_API_TOKEN has an invalid format. Should start with 'r8_'."
    );
    return false;
  }

  return true;
};
