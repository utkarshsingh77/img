import { REPLICATE_API_TOKEN } from "@/config/env";

/**
 * Service for generating images using Replicate's API with the flux-schnell model.
 * Using direct API calls to Replicate's models endpoint.
 */
class ReplicateService {
  /**
   * Generate an image using the flux-schnell model
   * @param prompt Text prompt describing the image to generate
   * @returns URL of the generated image
   */
  async generateImage(prompt: string): Promise<string> {
    try {
      console.log(
        "Starting image generation with prompt:",
        prompt.substring(0, 50) + (prompt.length > 50 ? "..." : "")
      );

      // Make direct fetch request to Replicate API using models endpoint
      const requestBody = {
        input: {
          prompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
        },
      };

      console.log("Sending request to Replicate API...");

      // Use the models endpoint with wait preference
      const response = await fetch(
        "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
            Prefer: "wait", // Wait for the prediction to complete
          },
          body: JSON.stringify(requestBody),
        }
      );

      // Process the response
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", JSON.stringify(errorData));
        throw new Error(`API error: ${JSON.stringify(errorData)}`);
      }

      const prediction = await response.json();
      console.log("Prediction completed:", prediction.id);

      // With 'Prefer: wait', we should already have the output
      if (
        prediction.status === "succeeded" &&
        prediction.output &&
        Array.isArray(prediction.output) &&
        prediction.output.length > 0
      ) {
        console.log("Image generation succeeded!");
        return prediction.output[0];
      } else if (prediction.status === "failed" || prediction.error) {
        throw new Error(
          `Prediction failed: ${prediction.error || "Unknown error"}`
        );
      } else {
        // If for some reason we don't have the output yet, fall back to polling
        console.log("Need to poll for results:", prediction.id);
        return await this.pollForResult(prediction.id);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }

  /**
   * Poll the Replicate API for the prediction result
   * Only used as a fallback if 'Prefer: wait' doesn't return the complete result
   */
  private async pollForResult(
    predictionId: string,
    maxAttempts = 10
  ): Promise<string> {
    console.log(
      `Starting to poll for results (prediction ID: ${predictionId})`
    );

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Poll attempt ${attempt + 1} failed:`, errorText);
          throw new Error(
            `Failed to check prediction status: ${response.statusText}`
          );
        }

        const prediction = await response.json();
        console.log(`Poll attempt ${attempt + 1}: Status=${prediction.status}`);

        if (
          prediction.status === "succeeded" &&
          prediction.output &&
          Array.isArray(prediction.output) &&
          prediction.output.length > 0
        ) {
          console.log("Image generation succeeded!");
          return prediction.output[0];
        } else if (prediction.status === "failed" || prediction.error) {
          console.error(
            "Prediction failed:",
            prediction.error || "Unknown error"
          );
          throw new Error(
            `Prediction failed: ${prediction.error || "Unknown error"}`
          );
        }

        // Wait before checking again (shorter interval since this is a fallback)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error in poll attempt ${attempt + 1}:`, error);
        // Continue polling despite errors
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    throw new Error("Prediction timed out after maximum attempts");
  }
}

// Export a singleton instance
export const replicateService = new ReplicateService();
