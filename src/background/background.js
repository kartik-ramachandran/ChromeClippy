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

// Writer API - for improving text
async function improveTextWithBuiltInAI(text, options = {}) {
  try {
    if (!window.ai?.writer) {
      throw new Error('Writer API not available');
    }
    
    const writer = await window.ai.writer.create({
      tone: options.tone || 'neutral',
      format: 'plain-text',
      length: 'medium'
    });
    
    const result = await writer.write(`Improve this text: ${text}`);
    writer.destroy();
    return result;
  } catch (error) {
    console.log('Chrome Writer API failed, using backup:', error.message);
    return await callBackupAI(`Improve this text to be more ${options.tone || 'professional'}: "${text}"`);
  }
}

// Translator API - for translation
async function translateWithBuiltInAI(text, options = {}) {
  try {
    if (!window.ai?.translator) {
      throw new Error('Translator API not available');
    }
    
    const translator = await window.ai.translator.create({
      sourceLanguage: options.from || 'en',
      targetLanguage: options.to || 'es'
    });
    
    const result = await translator.translate(text);
    translator.destroy();
    return result;
  } catch (error) {
    console.log('Chrome Translator API failed, using backup:', error.message);
    return await callBackupAI(`Translate this text to ${options.to || 'Spanish'}: "${text}"`);
  }
}

// Summarizer API - for summarization
async function summarizeWithBuiltInAI(text, options = {}) {
  try {
    if (!window.ai?.summarizer) {
      throw new Error('Summarizer API not available');
    }
    
    const summarizer = await window.ai.summarizer.create({
      type: options.type || 'key-points',
      format: 'plain-text',
      length: options.length || 'short'
    });
    
    const result = await summarizer.summarize(text);
    summarizer.destroy();
    return result;
  } catch (error) {
    console.log('Chrome Summarizer API failed, using backup:', error.message);
    return await callBackupAI(`Summarize this text: "${text}"`);
  }
}

// Rewriter API - for rewriting
async function rewriteWithBuiltInAI(text, options = {}) {
  try {
    if (!window.ai?.rewriter) {
      throw new Error('Rewriter API not available');
    }
    
    const rewriter = await window.ai.rewriter.create({
      tone: options.tone || 'as-is',
      format: 'plain-text',
      length: options.length || 'as-is'
    });
    
    const result = await rewriter.rewrite(text);
    rewriter.destroy();
    return result;
  } catch (error) {
    console.log('Chrome Rewriter API failed, using backup:', error.message);
    return await callBackupAI(`Rewrite this text: "${text}"`);
  }
}

// Language Model API (Prompt API) - for proofreading and explaining
async function proofreadWithBuiltInAI(text) {
  try {
    if (!window.ai?.languageModel) {
      throw new Error('Language Model API not available');
    }
    
    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are a professional proofreader. Check grammar, spelling, and style.'
    });
    
    const result = await session.prompt(`Please proofread this text: "${text}"`);
    session.destroy();
    return result;
  } catch (error) {
    console.log('Chrome Language Model API failed, using backup:', error.message);
    return await callBackupAI(`Proofread this text: "${text}"`);
  }
}

async function explainWithBuiltInAI(text) {
  try {
    if (!window.ai?.languageModel) {
      throw new Error('Language Model API not available');
    }
    
    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are a helpful teacher. Explain concepts clearly and simply.'
    });
    
    const result = await session.prompt(`Please explain this: "${text}"`);
    session.destroy();
    return result;
  } catch (error) {
    console.log('Chrome Language Model API failed, using backup:', error.message);
    return await callBackupAI(`Explain this text: "${text}"`);
  }
}

async function chatWithBuiltInAI(text) {
  try {
    if (!window.ai?.languageModel) {
      throw new Error('Language Model API not available');
    }
    
    const session = await window.ai.languageModel.create({
      systemPrompt: 'You are Clippy, a helpful and friendly AI assistant. Be enthusiastic and helpful!'
    });
    
    const result = await session.prompt(text);
    session.destroy();
    return result;
  } catch (error) {
    console.log('Chrome Language Model API failed, using backup:', error.message);
    return await callBackupAI(text);
  }
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