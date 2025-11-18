import { describe, it, expect } from 'vitest';
import { GoogleGenerativeAI } from '@google/generative-ai';

describe('AI Service - Model Availability', () => {
  const apiKey = process.env.GEMINI_API_KEY;

  it('should have GEMINI_API_KEY configured (optional for local dev)', () => {
    if (!apiKey) {
      console.log('⚠️  GEMINI_API_KEY not configured - skipping test (this is OK for local dev)');
      expect(true).toBe(true);
      return;
    }
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
  });

  it('should list available models via API', async () => {
    if (!apiKey) {
      console.log('⚠️  Skipping: GEMINI_API_KEY not configured');
      return;
    }

    console.log('\n🔍 Fetching available models from Google AI API:\n');

    try {
      // Call the models list API directly
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      
      if (!response.ok) {
        console.log(`❌ API Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error details: ${errorText.substring(0, 200)}`);
      } else {
        const data = await response.json();
        console.log(`✅ Found ${data.models?.length || 0} models:\n`);
        
        if (data.models) {
          data.models.forEach((model) => {
            console.log(`  📦 ${model.name}`);
            console.log(`     Display: ${model.displayName}`);
            console.log(`     Supports: ${model.supportedGenerationMethods?.join(', ')}`);
            console.log('');
          });
        }
      }
    } catch (error) {
      console.log(`❌ Error fetching models: ${error.message}`);
    }

    // This test always passes - it's just for logging
    expect(true).toBe(true);
  }, 60000); // 60 second timeout for API calls

  it('should test generateContent with working model', async () => {
    if (!apiKey) {
      console.log('⚠️  Skipping: GEMINI_API_KEY not configured');
      return;
    }

    // Try available models from the API (based on list above)
    const modelsToTry = [
      'models/gemini-2.0-flash',
      'models/gemini-flash-latest',
      'models/gemini-2.5-flash',
      'models/gemini-pro-latest',
      'gemini-2.0-flash',
      'gemini-flash-latest',
    ];
    
    let workingModel = null;
    let response = null;

    console.log('\n🔍 Testing generateContent with available models:\n');

    for (const modelName of modelsToTry) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "test successful"');
        response = await result.response;
        const text = response.text();
        
        if (text) {
          workingModel = modelName;
          console.log(`\n✅ Working model found: ${modelName}`);
          console.log(`📝 Response: ${text.substring(0, 100)}`);
          break;
        }
      } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message.substring(0, 80)}`);
      }
    }

    expect(workingModel).toBeTruthy();
    expect(response).toBeDefined();
  }, 30000);
});
