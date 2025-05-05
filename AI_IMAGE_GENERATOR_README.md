# AI Image Generator

This feature allows you to generate images using OpenAI's DALL-E 3 and GPT Image models directly from your iOS app.

## Models Supported

### DALL-E 3

- Default image generation option
- Great for general purpose image creation
- Fixed 1024x1024 output resolution

### GPT Image (gpt-image-1)

- OpenAI's most advanced image generation model
- Superior instruction following, text rendering, and detail
- Support for transparent backgrounds
- Multiple quality settings (low, medium, high)
- Various size options (square, portrait, landscape)

## Setup

### 1. Get an OpenAI API Key

You'll need an API key from OpenAI:

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key

### 2. Configure the API Key

There are two ways to set up your API key:

#### Option 1: Add it to the Config file

1. Open `constants/Config.ts`
2. Replace "YOUR_OPENAI_API_KEY_HERE" with your actual API key

```typescript
export const Config = {
  openai: {
    apiKey: "your-actual-api-key-here",
  },
};
```

#### Option 2: Use Environment Variables (Recommended)

1. Create a `.env` file in the project root
2. Add your API key:

```
EXPO_PUBLIC_OPENAI_API_KEY=your-actual-api-key-here
```

3. Make sure to add `.env` to your `.gitignore` file to avoid committing sensitive data

## Features

- Generate AI images using text prompts
- Choose between DALL-E 3 and GPT Image models
- Configure image settings (size, quality, transparency)
- View recently used prompts for quick reuse
- Save generated images to your device
- Share images directly from the app

## Usage

1. Enter a descriptive prompt in the text field
2. (Optional) Tap the settings icon to access model preferences:
   - Switch between DALL-E 3 and GPT Image models
   - For GPT Image, configure size, quality and transparency settings
3. Tap "Generate Image"
4. Wait for the AI to create your image
5. Use the Share or Save buttons to export your creation

## Pricing Information

Be aware that different models have different pricing:

- **DALL-E 3**: Priced per image generated at 1024x1024 resolution
- **GPT Image**: Priced based on tokens (input tokens + output tokens)
  - Larger sizes and higher quality settings consume more tokens
  - Higher resolution and quality lead to increased costs

Check the [OpenAI pricing page](https://openai.com/pricing) for the most current rates.
