import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service - Google Gemini Integration
 * 
 * Provides smart task description generation using Google's Gemini AI
 * 
 * Features:
 * - Task description suggestions based on task name
 * - Context-aware recommendations
 * - Free tier: 60 requests/minute
 */

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate smart task description based on task name
 * 
 * @param {string} taskName - The name of the task
 * @param {Object} context - Optional context (assignee, dueDate, familySettings, etc.)
 * @returns {Promise<string>} - AI-generated description
 */
export async function generateTaskDescription(taskName, context = {}) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not configured, skipping AI generation');
      return null;
    }

    // Get Gemini model (models/gemini-2.0-flash is verified working)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });

    // Build prompt with context (including family settings)
    const prompt = buildPrompt(taskName, context);

    console.log('🤖 Calling Gemini AI for task:', taskName);

    // Generate description
    const result = await model.generateContent(prompt);
    const response = result.response;
    const description = response.text().trim();

    console.log('✅ AI description generated:', description.substring(0, 50) + '...');

    return description;
  } catch (error) {
    console.error('❌ Error generating AI description:', error.message);
    return null; // Fail gracefully - don't block task creation
  }
}

/**
 * Build AI prompt with context
 */
function buildPrompt(taskName, context) {
  const { assignedToName, dueDate, tags, familyContext } = context;

  let prompt = `You are a helpful family task assistant. Generate a concise, actionable description for this task.

Task: "${taskName}"`;

  // Add family-specific context (neighborhood, stores, schools, routines)
  if (familyContext) {
    prompt += `\n\nFamily Context:\n${familyContext}`;
  }

  if (assignedToName) {
    prompt += `\nAssigned to: ${assignedToName}`;
  }

  if (dueDate) {
    const date = new Date(dueDate);
    const isToday = date.toDateString() === new Date().toDateString();
    const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString();
    
    if (isToday) {
      prompt += '\nDue: Today';
    } else if (isTomorrow) {
      prompt += '\nDue: Tomorrow';
    } else {
      prompt += `\nDue: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  }

  if (tags && tags.length > 0) {
    prompt += `\nTags: ${tags.join(', ')}`;
  }

  prompt += `

Requirements:
- Keep it under 100 characters
- Be specific and actionable based on the family context provided
- Use the family's preferred stores, schools, and neighborhood info when relevant
- Include helpful tips or reminders if relevant
- Use emojis sparingly (1-2 max)
- Don't repeat the task name
- Focus on HOW or WHEN to do it

Examples:
Task: "Buy milk" with context (stores: Whole Foods) → "Pick up 2% from Whole Foods after work"
Task: "Doctor appointment" → "Bring insurance card, arrive 10 min early"
Task: "Pick up kids" with context (school: Lincoln High, 3:15 PM) → "Lincoln High pickup at 3:15 PM. Leave early for traffic!"

Your description:`;

  return prompt;
}

/**
 * Batch generate descriptions for multiple tasks (future enhancement)
 */
export async function generateBatchDescriptions(tasks) {
  try {
    const promises = tasks.map(task => 
      generateTaskDescription(task.name, {
        assignedToName: task.assignedToName,
        dueDate: task.dueDate,
        tags: task.tags,
      }),
    );

    return await Promise.all(promises);
  } catch (error) {
    console.error('❌ Error in batch generation:', error);
    return tasks.map(() => null);
  }
}

export default {
  generateTaskDescription,
  generateBatchDescriptions,
};
