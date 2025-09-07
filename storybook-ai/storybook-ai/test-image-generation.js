// Test script to verify image generation
const testImageGeneration = async () => {
  console.log('Testing image generation with Picsum...');
  
  const prompt = "magical unicorn in a forest";
  const seed = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageId = seed % 1000;
  const imageUrl = `https://picsum.photos/seed/${imageId}/800/600`;
  
  console.log('Generated image URL:', imageUrl);
  
  // Test fetch
  try {
    const response = await fetch(imageUrl);
    console.log('Image fetch status:', response.status);
    console.log('Image URL is:', response.ok ? '✅ Valid' : '❌ Invalid');
  } catch (error) {
    console.error('Failed to fetch image:', error);
  }
};

testImageGeneration();