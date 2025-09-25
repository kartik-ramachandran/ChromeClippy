console.log('🚀 AI Clippy 2025 Background Script - Chrome Built-in AI Version!');

// Lazy-loaded backup AI (Gemini API) - only loaded when Chrome Built-in AI fails
let backupAI = null;
let isLoadingBackupAI = false;

// Function to lazy load the backup AI when needed
async function getBackupAI() {
  if (backupAI) return backupAI;
  
  if (isLoadingBackupAI) {
    // Wait for existing load to complete
    while (isLoadingBackupAI) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return backupAI;
  }
  
  try {
    isLoadingBackupAI = true;
    console.log('🔄 Loading backup AI (Google GenAI SDK)...');
    
    // Dynamic import to lazy load the SDK
    const { GoogleGenAI } = await import("@google/genai");
    backupAI = new GoogleGenAI({
      apiKey: 'AIzaSyCCq0_MKtYgeiKzYIrOxtQcBZjmWkX2IT8'
    });
    
    console.log('✅ Backup AI loaded successfully');
    return backupAI;
  } catch (error) {
    console.error('❌ Failed to load backup AI:', error);
    return null;
  } finally {
    isLoadingBackupAI = false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Clippy is ready to help!');
  chrome.storage.sync.set({
    clippyEnabled: true,
    helpWithWriting: true,
    helpWithTranslation: true,
    helpWithSummarization: true,
    helpWithCode: true,
    personalityLevel: 'classic',
    position: { bottom: 20, right: 20 }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'AI_REQUEST') {
    handleAIRequest(message, sendResponse);
    return true;
  } else if (message.type === 'TAKE_SCREENSHOT') {
    handleScreenshot(sender.tab.id, sendResponse);
    return true;
  } else if (message.type === 'ACCESS_FILES') {
    handleFileAccess(sendResponse);
    return true;
  } else if (message.type === 'CONVERSATION_REQUEST') {
    handleConversationRequest(message, sendResponse);
    return true;
  }
});

async function handleAIRequest(message, sendResponse) {
  try {
    const { action, text, options } = message.data;
    
    switch (action) {
      case 'IMPROVE_TEXT':
        const result = await improveTextWithBuiltInAI(text, options);
        sendResponse({ success: true, result });
        break;
        
      case 'TRANSLATE':
        const translated = await translateWithBuiltInAI(text, options);
        sendResponse({ success: true, result: translated });
        break;
        
      case 'SUMMARIZE':
        const summary = await summarizeWithBuiltInAI(text, options);
        sendResponse({ success: true, result: summary });
        break;
        
      case 'PROOFREAD':
        const proofread = await proofreadWithBuiltInAI(text);
        sendResponse({ success: true, result: proofread });
        break;
        
      case 'EXPLAIN':
        const explanation = await explainWithBuiltInAI(text);
        sendResponse({ success: true, result: explanation });
        break;
        
      case 'REWRITE':
        const rewritten = await rewriteWithBuiltInAI(text, options);
        sendResponse({ success: true, result: rewritten });
        break;
        
      case 'GENERAL_AI':
        const response = await chatWithBuiltInAI(text);
        sendResponse({ success: true, result: response });
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('AI Request failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Chrome Built-in AI API Functions
// Note: These APIs are not available in service worker context, 
// so we'll use backup AI for all requests from background script

// Writer API - for improving text
async function improveTextWithBuiltInAI(text, options = {}) {
  console.log('Writer API not available in service worker, using backup AI');
  return await callBackupAI(`Improve this text to be more ${options.tone || 'professional'}: "${text}"`);
}

// Translator API - for translation
async function translateWithBuiltInAI(text, options = {}) {
  console.log('Translator API not available in service worker, using backup AI');
  const targetLang = options.to || 'Spanish';
  return await callBackupAI(`Translate this text from ${options.from || 'English'} to ${targetLang}: "${text}"`);
}

// Summarizer API - for summarization
async function summarizeWithBuiltInAI(text, options = {}) {
  console.log('Summarizer API not available in service worker, using backup AI');
  const length = options.length === 'short' ? 'in 2-3 sentences' : options.length === 'long' ? 'in detail' : 'concisely';
  return await callBackupAI(`Summarize this text ${length}: "${text}"`);
}

// Rewriter API - for rewriting
async function rewriteWithBuiltInAI(text, options = {}) {
  console.log('Rewriter API not available in service worker, using backup AI');
  const tone = options.tone || 'neutral';
  return await callBackupAI(`Rewrite this text with a ${tone} tone: "${text}"`);
}

// Language Model API (Prompt API) - for proofreading and explaining
async function proofreadWithBuiltInAI(text) {
  console.log('Language Model API not available in service worker, using backup AI');
  return await callBackupAI(`Please proofread this text for grammar, spelling, and style: "${text}"`);
}

async function explainWithBuiltInAI(text) {
  console.log('Language Model API not available in service worker, using backup AI');
  return await callBackupAI(`Please explain this clearly and simply: "${text}"`);
}

async function chatWithBuiltInAI(text) {
  console.log('Language Model API not available in service worker, using backup AI');
  return await callBackupAI(`You are Clippy, a helpful and friendly AI assistant. Be enthusiastic and helpful! User says: "${text}"`);
}

// Backup external API call (Gemini)
async function callBackupAI(prompt) {
  try {
    const ai = await getBackupAI();
    if (!ai) {
      throw new Error('Backup AI not available');
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return `${response.text} ✨ (Enhanced by backup AI)`;
  } catch (error) {
    console.error('Backup AI Error:', error);
    throw new Error('Both Chrome Built-in AI and backup AI failed');
  }
}

async function handleScreenshot(tabId, sendResponse) {
  try {
    const screenshot = await chrome.tabs.captureVisibleTab(tabId, { format: 'png' });
    sendResponse({ success: true, screenshot });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleFileAccess(sendResponse) {
  sendResponse({ success: true, message: "File access ready!" });
}

async function handleConversationRequest(message, sendResponse) {
  try {
    const { query, context } = message.data;
    
    // Use Chrome Built-in AI for conversation
    const response = await chatWithBuiltInAI(query);
    
    // Generate contextual suggestions
    const suggestions = generateContextualSuggestions(query, context);
    
    sendResponse({ 
      success: true, 
      response,
      suggestions,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Conversation request failed:', error);
    sendResponse({ 
      success: false, 
      error: error.message,
      fallback: "I'm having trouble connecting to Chrome's Built-in AI. Try asking something else!" 
    });
  }
}

function generateContextualSuggestions(query, context) {
  const suggestions = [];
  
  // Add contextual suggestions based on the conversation and page context
  if (context?.url?.includes('github.com')) {
    suggestions.push(
      { text: "Explain this code", icon: "💻" },
      { text: "Review this repository", icon: "📂" }
    );
  } else if (context?.url?.includes('mail') || context?.url?.includes('gmail')) {
    suggestions.push(
      { text: "Help write an email", icon: "✉️" },
      { text: "Make it more professional", icon: "✨" }
    );
  }
  
  // Always include these general suggestions
  suggestions.push(
    { text: "Take a screenshot", icon: "📸" },
    { text: "Help with writing", icon: "✍️" },
    { text: "Translate text", icon: "🌍" },
    { text: "Summarize content", icon: "📄" }
  );
  
  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

console.log('Clippy background script ready with Gemini integration!');