// test-gemini-models.js
// Run this to find which models work with your API key

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Replace with your actual API key or use from .env
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAHeZwG35NELQ1AFA4G-pYuI9qPsgBYQFE';

const genAI = new GoogleGenerativeAI(API_KEY);

async function testModels() {
  console.log('🔍 Testing available Gemini models...\n');

  const modelsToTest = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-2.0-flash-exp',
    'gemini-exp-1206',
    'gemini-pro',
  ];

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello, respond with just "OK"');
      const text = result.response.text();
      console.log(`✅ ${modelName} WORKS! Response: ${text}\n`);
      return modelName; // Return first working model
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message}\n`);
    }
  }

  console.log('\n❌ No working models found. Check your API key.');
}

async function listAllModels() {
  try {
    console.log('\n📋 Listing all available models for your API key:\n');
    const models = await genAI.listModels();
    
    models.forEach(model => {
      console.log(`Model: ${model.name}`);
      console.log(`  Display Name: ${model.displayName}`);
      console.log(`  Description: ${model.description}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods?.join(', ')}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('   GEMINI API MODEL TESTER');
  console.log('═══════════════════════════════════════════\n');
  
  if (API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('⚠️  Please set your API key in the script or .env file\n');
    return;
  }

  const workingModel = await testModels();
  
  if (workingModel) {
    console.log('═══════════════════════════════════════════');
    console.log(`✅ USE THIS MODEL: "${workingModel}"`);
    console.log('═══════════════════════════════════════════\n');
  }

  await listAllModels();
}

run();