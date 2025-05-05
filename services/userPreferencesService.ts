import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserInterest {
  id: string;
  name: string;
  prompt: string;
  tags: string[];
}

export interface UserPreferences {
  interests: UserInterest[];
  lastUpdated: number;
}

// Default interests to suggest to users
export const DEFAULT_INTERESTS: UserInterest[] = [
  {
    id: "nature",
    name: "Nature & Landscapes",
    prompt:
      "stunning landscape photography with mountains, lakes, and vibrant skies",
    tags: ["nature", "landscape", "photography", "outdoors"],
  },
  {
    id: "scifi",
    name: "Sci-Fi & Future",
    prompt:
      "futuristic cityscape with flying vehicles, neon lights, and towering skyscrapers",
    tags: ["scifi", "future", "technology", "cyberpunk"],
  },
  {
    id: "abstract",
    name: "Abstract Art",
    prompt:
      "colorful abstract art with fluid shapes, vibrant colors, and dynamic composition",
    tags: ["abstract", "art", "colorful", "creative"],
  },
  {
    id: "fantasy",
    name: "Fantasy Worlds",
    prompt:
      "magical fantasy landscape with floating islands, castles, and mystical creatures",
    tags: ["fantasy", "magic", "mythical", "imagination"],
  },
  {
    id: "food",
    name: "Food & Cuisine",
    prompt:
      "gourmet food photography with perfect lighting, vibrant ingredients, and professional plating",
    tags: ["food", "cuisine", "culinary", "gourmet"],
  },
  {
    id: "animals",
    name: "Animals & Wildlife",
    prompt: "wildlife photography of exotic animals in their natural habitat",
    tags: ["animals", "wildlife", "nature", "photography"],
  },
  {
    id: "architecture",
    name: "Architecture",
    prompt:
      "stunning architectural photography of modern buildings with dramatic lighting",
    tags: ["architecture", "buildings", "design", "structure"],
  },
  {
    id: "space",
    name: "Space & Cosmos",
    prompt: "deep space photography of nebulae, galaxies, and cosmic phenomena",
    tags: ["space", "cosmos", "astronomy", "stars"],
  },
];

// Storage key for user preferences
const PREFERENCES_STORAGE_KEY = "user_preferences";

/**
 * Service for managing user preferences and interests
 */
class UserPreferencesService {
  /**
   * Get user preferences from storage, with fallback to default values
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const preferencesString = await AsyncStorage.getItem(
        PREFERENCES_STORAGE_KEY
      );

      if (preferencesString) {
        return JSON.parse(preferencesString);
      }

      // If no preferences are stored, return defaults
      return this.getDefaultPreferences();
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Get the user's selected interests
   */
  async getUserInterests(): Promise<UserInterest[]> {
    const preferences = await this.getPreferences();
    return preferences.interests || [];
  }

  /**
   * Save user preferences to storage
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify({
          ...preferences,
          lastUpdated: Date.now(),
        })
      );
    } catch (error) {
      console.error("Error saving user preferences:", error);
    }
  }

  /**
   * Update user interests
   */
  async updateInterests(interests: UserInterest[]): Promise<void> {
    const preferences = await this.getPreferences();

    await this.savePreferences({
      ...preferences,
      interests,
    });
  }

  /**
   * Add a single interest to user preferences
   */
  async addInterest(interest: UserInterest): Promise<void> {
    const preferences = await this.getPreferences();
    const existingInterests = preferences.interests || [];

    // Don't add duplicates
    if (!existingInterests.some((i) => i.id === interest.id)) {
      await this.savePreferences({
        ...preferences,
        interests: [...existingInterests, interest],
      });
    }
  }

  /**
   * Remove an interest from user preferences
   */
  async removeInterest(interestId: string): Promise<void> {
    const preferences = await this.getPreferences();
    const existingInterests = preferences.interests || [];

    await this.savePreferences({
      ...preferences,
      interests: existingInterests.filter((i) => i.id !== interestId),
    });
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      // Start with 3 random default interests
      interests: this.getRandomDefaultInterests(3),
      lastUpdated: Date.now(),
    };
  }

  /**
   * Get a random selection of default interests
   */
  getRandomDefaultInterests(count: number): UserInterest[] {
    const shuffled = [...DEFAULT_INTERESTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get all available interests to suggest to users
   */
  getAvailableInterests(): UserInterest[] {
    return DEFAULT_INTERESTS;
  }
}

// Export a singleton instance
export const userPreferencesService = new UserPreferencesService();
