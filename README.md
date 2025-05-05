# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# AI Image Feed App

This app showcases AI-generated images in a social media feed style, and allows users to create their own AI-generated images using the Replicate API with the flux-schnell model.

## Environment Setup

### 1. Set up Replicate API Token

You need to set the `REPLICATE_API_TOKEN` environment variable. You can do this in several ways:

**Method 1: Export in your terminal (temporary, session only)**

```bash
export REPLICATE_API_TOKEN=<paste-your-token-here>
```

**Method 2: Add to your shell configuration file (more permanent)**

Add the following line to your `~/.bash_profile`, `~/.zshrc`, or similar shell configuration file:

```bash
export REPLICATE_API_TOKEN=<paste-your-token-here>
```

**Method 3: Create a .env file (recommended for development)**

Create a `.env` file in the root directory of your project with:

```
REPLICATE_API_TOKEN=<paste-your-token-here>
```

You might need additional setup to load environment variables from a .env file in your project.

### 2. Install dependencies

```bash
npm install
```

## Running the App

```bash
npm start
```

## Features

- View AI-generated images in a social feed
- Like, share and bookmark images
- Create your own AI-generated images with the flux-schnell model from Replicate
- Pull to refresh for new content
- Infinite scrolling to load more images

## Credits

This app uses the [flux-schnell](https://replicate.com/black-forest-labs/flux-schnell) model from Black Forest Labs on Replicate.
