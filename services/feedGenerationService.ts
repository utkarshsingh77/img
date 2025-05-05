import AsyncStorage from "@react-native-async-storage/async-storage";
import { replicateService } from "./replicateService";
import { UserInterest, userPreferencesService } from "./userPreferencesService";

export interface FeedItem {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  likes: number;
  username: string;
  timestamp: string;
  interest?: string; // ID of the interest that generated this item
}

// Storage keys
const FEED_STORAGE_KEY = "generated_feed_items";
const LAST_GENERATED_KEY = "last_feed_generation_time";

// Username options for generated content
const USERNAMES = [
  "ai_artist",
  "creative_mind",
  "dream_weaver",
  "visual_poet",
  "pixel_painter",
  "digital_dreamer",
  "image_alchemist",
  "art_explorer",
];

// Generation constants
const GENERATION_INTERVAL_HOURS = 24; // Generate new content every 24 hours
const MAX_CACHED_ITEMS = 20; // Maximum number of items to keep in cache

/**
 * Service for generating and managing feed content
 */
class FeedGenerationService {
  /**
   * Generate feed content based on user interests
   * @param forceGenerate Force generation even if content was recently generated
   * @param count Number of items to generate
   */
  async generateFeedContent(
    forceGenerate = false,
    count = 3
  ): Promise<FeedItem[]> {
    try {
      // Check if we should generate new content
      if (!forceGenerate && !(await this.shouldGenerateNewContent())) {
        console.log("Using cached feed content");
        return await this.getCachedFeedItems();
      }

      console.log("Generating new feed content");

      // Get user interests
      const interests = await userPreferencesService.getUserInterests();

      if (interests.length === 0) {
        console.log("No interests found, using defaults");
        const defaultInterests =
          userPreferencesService.getRandomDefaultInterests(3);
        await userPreferencesService.updateInterests(defaultInterests);
        return this.generateFeedItemsFromInterests(defaultInterests, count);
      }

      // Generate items based on interests
      const newItems = await this.generateFeedItemsFromInterests(
        interests,
        count
      );

      // Cache the generated items
      await this.cacheFeedItems(newItems);

      // Update last generation time
      await AsyncStorage.setItem(LAST_GENERATED_KEY, Date.now().toString());

      return newItems;
    } catch (error) {
      console.error("Error generating feed content:", error);
      // Return cached items if available, otherwise empty array
      return (await this.getCachedFeedItems()) || [];
    }
  }

  /**
   * Generate feed items from a list of interests
   */
  private async generateFeedItemsFromInterests(
    interests: UserInterest[],
    count: number
  ): Promise<FeedItem[]> {
    const items: FeedItem[] = [];

    // For each interest, try to generate at least one item
    for (const interest of interests.slice(0, count)) {
      try {
        // Create a modified prompt to make it more unique
        const prompt = this.enhancePrompt(interest.prompt);

        // Generate the image
        const imageUrl = await replicateService.generateImage(prompt);

        // Create a feed item
        items.push({
          id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          imageUrl,
          prompt,
          model: "Flux Schnell",
          likes: Math.floor(Math.random() * 200) + 50, // Random likes between 50-250
          username: USERNAMES[Math.floor(Math.random() * USERNAMES.length)],
          timestamp: this.getRandomTimestamp(),
          interest: interest.id,
        });

        // Small delay to prevent rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Error generating item for interest ${interest.id}:`,
          error
        );
        // Continue with next interest
      }
    }

    return items;
  }

  /**
   * Enhance a prompt with additional details to make it more unique
   */
  private enhancePrompt(basePrompt: string): string {
    const enhancements = [
      "with perfect lighting and composition",
      "in photorealistic style",
      "with dramatic lighting",
      "with beautiful details",
      "with cinematic quality",
      "with vibrant colors",
      "with stunning atmosphere",
      "with incredible detail",
      "in golden hour lighting",
    ];

    const randomEnhancement =
      enhancements[Math.floor(Math.random() * enhancements.length)];

    return `${basePrompt}, ${randomEnhancement}`;
  }

  /**
   * Get a random timestamp for the past few days
   */
  private getRandomTimestamp(): string {
    const timeUnits = ["hours", "days"];
    const unit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
    const value =
      unit === "hours"
        ? Math.floor(Math.random() * 23) + 1
        : Math.floor(Math.random() * 6) + 1;

    return `${value} ${unit} ago`;
  }

  /**
   * Determine if we should generate new content
   */
  private async shouldGenerateNewContent(): Promise<boolean> {
    try {
      const lastGeneratedString = await AsyncStorage.getItem(
        LAST_GENERATED_KEY
      );

      if (!lastGeneratedString) {
        return true;
      }

      const lastGenerated = parseInt(lastGeneratedString, 10);
      const now = Date.now();
      const hoursSinceLastGeneration = (now - lastGenerated) / (1000 * 60 * 60);

      return hoursSinceLastGeneration >= GENERATION_INTERVAL_HOURS;
    } catch (error) {
      console.error("Error checking last generation time:", error);
      return true;
    }
  }

  /**
   * Get cached feed items
   */
  private async getCachedFeedItems(): Promise<FeedItem[]> {
    try {
      const cachedItemsString = await AsyncStorage.getItem(FEED_STORAGE_KEY);

      if (cachedItemsString) {
        return JSON.parse(cachedItemsString);
      }

      return [];
    } catch (error) {
      console.error("Error getting cached feed items:", error);
      return [];
    }
  }

  /**
   * Cache new feed items
   */
  private async cacheFeedItems(newItems: FeedItem[]): Promise<void> {
    try {
      // Get existing items
      const existingItems = await this.getCachedFeedItems();

      // Combine and limit to max items
      const combinedItems = [...newItems, ...existingItems].slice(
        0,
        MAX_CACHED_ITEMS
      );

      await AsyncStorage.setItem(
        FEED_STORAGE_KEY,
        JSON.stringify(combinedItems)
      );
    } catch (error) {
      console.error("Error caching feed items:", error);
    }
  }
}

// Export a singleton instance
export const feedGenerationService = new FeedGenerationService();
