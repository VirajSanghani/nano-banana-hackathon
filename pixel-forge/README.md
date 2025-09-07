# Pixel-Forge - The AI 2D Game Generator

**Concept:** A web-based tool that lets anyone create their own simple 2D platformer game using natural language. Generate the world, the assets, and the rules with prompts. The most magical feature: upload a photo of yourself and become the 8-bit hero of your own game.

**User Experience (UX) Flow:**

1.  **The Spark of a Game:** The user describes the game they want to create: "A 2D platformer set in a candy-themed world. The goal is to collect 3 magic gumdrops."
2.  **Become the Hero:** The user uploads a photo of their face. The app uses AI to generate an 8-bit "sprite sheet" (a sequence of character animations) of them.
3.  **World Generation:** The AI generates the game assets based on the theme:
    *   **Platforms:** Generated as images of chocolate bars, lollipops, etc.
    *   **Collectibles:** The "magic gumdrops."
    *   **Background:** A colorful candy landscape.
4.  **Let's Play!:** The app instantly assembles these assets into a playable game using a simple web-based physics engine. The user can now play their own custom game, starring themselves as the 8-bit hero.
5.  **Change the Rules:** The user can then change the game with prompts:
    *   `"Make the gravity lower, so I can jump higher."`
    *   `"Add a new enemy: a bouncing jawbreaker."`
    *   `"Change the background to a space theme."`

**Clear Implementation Path (The "How-To"):**

*   **Frontend:** A web page using a simple 2D game engine library like **Phaser.js** or **Kaboom.js**. These libraries handle the physics, controls, and rendering, so you don't have to build them from scratch.
*   **Backend/Core Logic:**
    1.  **Character Generation:** This is the key "wow" feature. Send the user's photo to **Gemini 2.5 Flash** with a very specific prompt: `"Take the person from the user's image and create an 8-bit pixel art sprite sheet of them for a 2D platformer game. Include animations for standing, running, and jumping."`
    2.  **Asset Generation:** Use Gemini to generate the other game assets with prompts like: `"Generate a set of 2D platformer tiles with a candy theme."`
    3.  **Rule Changes:** The prompts to change the rules (like "lower gravity") would not change the game engine's code. Instead, they would change the *parameters* that are passed to the game engine. For example, the prompt "lower gravity" would simply reduce the value of the `gravity` variable in your Phaser.js game configuration.