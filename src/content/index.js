import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import ClippyCharacter from '../components/ClippyCharacter.jsx';
import SpeechBubble from '../components/SpeechBubble.jsx';
import ConversationBox from '../components/ConversationBox.jsx';

// Context detection utilities
class ContextDetector {
  constructor() {
    this.lastActiveElement = null;
    this.selectedText = '';
    this.pageContext = '';
  }

  detectWritingContext() {
    const activeElement = document.activeElement;
    
    if (activeElement && (
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'INPUT' ||
      activeElement.contentEditable === 'true'
    )) {
      const value = activeElement.value || activeElement.textContent || '';
      
      // Detect context based on content and element attributes
      if (this.isEmailContext(activeElement, value)) {
        return { type: 'email', element: activeElement, content: value };
      } else if (this.isSocialMediaContext(activeElement, value)) {
        return { type: 'social', element: activeElement, content: value };
      } else if (this.isCommentContext(activeElement)) {
        return { type: 'comment', element: activeElement, content: value };
      } else if (this.isFormContext(activeElement)) {
        return { type: 'form', element: activeElement, content: value };
      }
      
      return { type: 'writing', element: activeElement, content: value };
    }
    
    return null;
  }

  detectTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && selectedText.length > 10) {
      return {
        type: 'selection',
        content: selectedText,
        isCode: this.isCodeContext(selection),
        isLongText: selectedText.length > 200
      };
    }
    
    return null;
  }

  detectPageContext() {
    const url = window.location.href;
    const title = document.title.toLowerCase();
    
    if (url.includes('github.com') && document.querySelector('code, pre')) {
      return { type: 'code', platform: 'github' };
    } else if (url.includes('mail.google.com') || url.includes('outlook')) {
      return { type: 'email', platform: 'webmail' };
    } else if (url.includes('twitter.com') || url.includes('linkedin.com') || url.includes('facebook.com')) {
      return { type: 'social', platform: 'social-media' };
    } else if (document.querySelector('article, .article, main')) {
      return { type: 'reading', platform: 'article' };
    }
    
    return { type: 'general', platform: 'web' };
  }

  isEmailContext(element, value) {
    const emailIndicators = [
      'email', 'mail', 'message', 'compose', 'subject', 'recipient'
    ];
    const elementClass = (element.className || '').toLowerCase();
    const elementId = (element.id || '').toLowerCase();
    
    return emailIndicators.some(indicator => 
      elementClass.includes(indicator) || 
      elementId.includes(indicator) ||
      window.location.href.includes('mail')
    );
  }

  isSocialMediaContext(element, value) {
    const socialIndicators = [
      'tweet', 'post', 'status', 'update', 'share', 'comment'
    ];
    const elementClass = (element.className || '').toLowerCase();
    const elementId = (element.id || '').toLowerCase();
    
    return socialIndicators.some(indicator => 
      elementClass.includes(indicator) || 
      elementId.includes(indicator)
    ) || this.isSocialMediaSite();
  }

  isCommentContext(element) {
    const commentIndicators = ['comment', 'reply', 'review'];
    const elementClass = (element.className || '').toLowerCase();
    const elementId = (element.id || '').toLowerCase();
    
    return commentIndicators.some(indicator => 
      elementClass.includes(indicator) || elementId.includes(indicator)
    );
  }

  isFormContext(element) {
    return element.closest('form') !== null;
  }

  isCodeContext(selection) {
    const container = selection.anchorNode?.parentElement;
    return container && (
      container.tagName === 'CODE' ||
      container.tagName === 'PRE' ||
      container.closest('pre, code, .code, .highlight')
    );
  }

  isSocialMediaSite() {
    const socialSites = ['twitter.com', 'linkedin.com', 'facebook.com', 'instagram.com'];
    return socialSites.some(site => window.location.href.includes(site));
  }
}

// Main Clippy App Component
const ClippyApp = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [bubbleData, setBubbleData] = useState({
    message: '',
    suggestions: [],
    isVisible: false,
    isLoading: false
  });
  const [conversationMode, setConversationMode] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    helpWithWriting: true,
    helpWithTranslation: true,
    helpWithSummarization: true,
    helpWithCode: true,
    personalityLevel: 'classic'
  });

  const contextDetector = useRef(new ContextDetector());
  const checkInterval = useRef(null);
  const lastContext = useRef(null);

  useEffect(() => {
    // Load settings
    loadSettings();
    
    // Start context monitoring
    startContextMonitoring();
    
    // Show Clippy after a brief delay
    setTimeout(() => setIsVisible(true), 1000);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get([
        'clippyEnabled',
        'helpWithWriting',
        'helpWithTranslation', 
        'helpWithSummarization',
        'helpWithCode',
        'personalityLevel'
      ]);
      
      setSettings(prev => ({ ...prev, ...result }));
    } catch (error) {
      console.log('Settings not available, using defaults');
    }
  };

  const startContextMonitoring = () => {
    // Monitor text input and selection
    document.addEventListener('focusin', handleFocusChange);
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Periodic context check
    checkInterval.current = setInterval(checkContext, 2000);
  };

  const handleFocusChange = (event) => {
    const writingContext = contextDetector.current.detectWritingContext();
    
    if (writingContext && settings.helpWithWriting) {
      setAnimationState('watching');
      
      // Show help after user starts typing
      setTimeout(() => {
        if (writingContext.content.length > 20) {
          showWritingHelp(writingContext);
        }
      }, 3000);
    }
  };

  const handleSelectionChange = () => {
    const selectionContext = contextDetector.current.detectTextSelection();
    
    if (selectionContext) {
      setAnimationState('excited');
      setTimeout(() => showSelectionHelp(selectionContext), 500);
    }
  };

  const checkContext = () => {
    const pageContext = contextDetector.current.detectPageContext();
    
    // Show contextual suggestions based on page type
    if (pageContext.type !== lastContext.current?.type) {
      lastContext.current = pageContext;
      showContextualHelp(pageContext);
    }
  };

  const showWritingHelp = (context) => {
    const suggestions = [];
    
    if (context.type === 'email') {
      suggestions.push(
        { text: '✨ Make Professional', action: 'improve', icon: '✨', params: { tone: 'professional' } },
        { text: '🌍 Translate', action: 'translate', icon: '🌍' },
        { text: '📝 Check Grammar', action: 'proofread', icon: '📝' }
      );
      setBubbleData({
        message: "Writing an email? I can help make it perfect!",
        suggestions,
        isVisible: true,
        isLoading: false
      });
    } else if (context.type === 'social') {
      suggestions.push(
        { text: '😄 Make it Fun', action: 'improve', icon: '😄', params: { tone: 'casual' } },
        { text: '🎯 Add Hashtags', action: 'enhance', icon: '🎯' },
        { text: '📝 Fix Typos', action: 'proofread', icon: '📝' }
      );
      setBubbleData({
        message: "Crafting a social post? Let me help you shine!",
        suggestions,
        isVisible: true,
        isLoading: false
      });
    } else {
      suggestions.push(
        { text: '✨ Improve Writing', action: 'improve', icon: '✨' },
        { text: '📝 Check Grammar', action: 'proofread', icon: '📝' },
        { text: '🌍 Translate', action: 'translate', icon: '🌍' }
      );
      setBubbleData({
        message: "I see you're writing! Need any help?",
        suggestions,
        isVisible: true,
        isLoading: false
      });
    }
    
    setAnimationState('excited');
  };

  const showSelectionHelp = (context) => {
    const suggestions = [];
    
    if (context.isCode && settings.helpWithCode) {
      suggestions.push(
        { text: '📖 Explain Code', action: 'explain', icon: '📖' },
        { text: '🐛 Find Issues', action: 'analyze', icon: '🐛' },
        { text: '📝 Add Comments', action: 'document', icon: '📝' }
      );
      setBubbleData({
        message: "Code selected! Want me to explain what it does?",
        suggestions,
        isVisible: true,
        isLoading: false
      });
    } else if (context.isLongText && settings.helpWithSummarization) {
      suggestions.push(
        { text: '📄 Summarize', action: 'summarize', icon: '📄' },
        { text: '🌍 Translate', action: 'translate', icon: '🌍' },
        { text: '📝 Simplify', action: 'simplify', icon: '📝' }
      );
      setBubbleData({
        message: "That's a lot of text! Want me to summarize it?",
        suggestions,
        isVisible: true,
        isLoading: false
      });
    } else {
      suggestions.push(
        { text: '🌍 Translate', action: 'translate', icon: '🌍' },
        { text: '📝 Rewrite', action: 'rewrite', icon: '📝' },
        { text: '📋 Copy Improved', action: 'improve', icon: '📋' }
      );
      setBubbleData({
        message: "Text selected! How can I help?",
        suggestions,
        isVisible: true,
        isLoading: false
      });
    }
  };

  const showContextualHelp = (context) => {
    // Only show contextual help occasionally to avoid being annoying
    if (Math.random() > 0.3) return;

    if (context.type === 'reading') {
      setTimeout(() => {
        setBubbleData({
          message: "Reading something interesting? I can help summarize or translate!",
          suggestions: [
            { text: '📄 Summarize Page', action: 'summarize_page', icon: '📄' },
            { text: '🌍 Translate Page', action: 'translate_page', icon: '🌍' }
          ],
          isVisible: true,
          isLoading: false
        });
        setAnimationState('watching');
      }, 5000);
    }
  };

  const handleClippyClick = () => {
    if (conversationMode) {
      // Close conversation mode
      setConversationMode(false);
      setAnimationState('idle');
    } else if (bubbleData.isVisible) {
      closeBubble();
    } else {
      // Show general help menu with conversation option
      setBubbleData({
        message: "Hi there! I'm your AI assistant. What can I help you with?",
        suggestions: [
          { text: '💬 Chat with Me', action: 'start_conversation', icon: '💬' },
          { text: '✍️ Writing Help', action: 'writing_help', icon: '✍️' },
          { text: '🌍 Translation', action: 'translation_help', icon: '🌍' },
          { text: '📄 Summarization', action: 'summary_help', icon: '📄' },
          { text: '⚙️ Settings', action: 'settings', icon: '⚙️', type: 'secondary' }
        ],
        isVisible: true,
        isLoading: false
      });
      setAnimationState('excited');
    }
  };

  const handleAction = async (suggestion) => {
    const { action, params = {} } = suggestion;
    
    // Show loading state
    setBubbleData(prev => ({ ...prev, isLoading: true }));
    setAnimationState('thinking');

    try {
      switch (action) {
        case 'improve':
          await handleImproveText(params);
          break;
        case 'translate':
          await handleTranslateText(params);
          break;
        case 'proofread':
          await handleProofreadText();
          break;
        case 'summarize':
          await handleSummarizeText();
          break;
        case 'explain':
          await handleExplainCode();
          break;
        case 'start_conversation':
          startConversationMode();
          break;
        case 'rewrite':
          await handleRewriteText(params);
          break;
        case 'analyze_page':
          await handleAnalyzePage();
          break;
        case 'smart_help':
          await handleSmartHelp();
          break;
        case 'close':
          closeBubble();
          return; // Don't show loading state for close action
        default:
          await handleGeneralAIRequest(action, params);
      }
    } catch (error) {
      showMessage("Oops! Something went wrong. Try again? 😅");
    }
  };

  const handleImproveText = async (params) => {
    const writingContext = contextDetector.current.detectWritingContext();
    if (!writingContext) {
      showMessage("Please select some text or click in a text field first!");
      return;
    }

    const response = await sendAIRequest('IMPROVE_TEXT', writingContext.content, params);
    if (response.success) {
      // Replace the text in the input field
      replaceText(writingContext.element, response.result);
      showMessage("✨ Text improved! Much better now!");
    } else {
      showMessage("Couldn't improve the text. Try again?");
    }
  };

  const handleTranslateText = async (params = { to: 'es' }) => {
    const selection = contextDetector.current.detectTextSelection();
    const writingContext = contextDetector.current.detectWritingContext();
    
    const textToTranslate = selection?.content || writingContext?.content;
    if (!textToTranslate) {
      showMessage("Please select some text or click in a text field first!");
      return;
    }

    const response = await sendAIRequest('TRANSLATE', textToTranslate, params);
    if (response.success) {
      if (writingContext) {
        replaceText(writingContext.element, response.result);
      } else {
        copyToClipboard(response.result);
      }
      showMessage(`🌍 Translated to ${params.to === 'es' ? 'Spanish' : 'target language'}!`);
    } else {
      showMessage("Translation failed. Try again?");
    }
  };

  const handleProofreadText = async () => {
    const writingContext = contextDetector.current.detectWritingContext();
    if (!writingContext) {
      showMessage("Please click in a text field first!");
      return;
    }

    const response = await sendAIRequest('PROOFREAD', writingContext.content);
    if (response.success) {
      replaceText(writingContext.element, response.result);
      showMessage("📝 Grammar checked and fixed!");
    } else {
      showMessage("Couldn't check grammar. Try again?");
    }
  };

  const handleSummarizeText = async () => {
    const selection = contextDetector.current.detectTextSelection();
    if (!selection || !selection.isLongText) {
      showMessage("Please select a longer piece of text first!");
      return;
    }

    const response = await sendAIRequest('SUMMARIZE', selection.content);
    if (response.success) {
      copyToClipboard(response.result);
      showMessage("📄 Summary copied to clipboard!");
    } else {
      showMessage("Couldn't create summary. Try again?");
    }
  };

  const handleExplainCode = async () => {
    const selection = contextDetector.current.detectTextSelection();
    if (!selection || !selection.isCode) {
      showMessage("Please select some code first!");
      return;
    }

    const response = await sendAIRequest('EXPLAIN_CODE', selection.content);
    if (response.success) {
      showMessage(`💡 ${response.result}`);
    } else {
      showMessage("Couldn't explain the code. Try again?");
    }
  };

  // NEW AI FEATURES USING CHROME BUILT-IN APIS
  const handleRewriteText = async (params = {}) => {
    const writingContext = contextDetector.current.detectWritingContext();
    const selection = contextDetector.current.detectTextSelection();
    
    const textToRewrite = selection?.content || writingContext?.content;
    if (!textToRewrite) {
      showMessage("Please select some text or click in a text field first!");
      return;
    }

    const response = await sendAIRequest('REWRITE', textToRewrite, params);
    if (response.success) {
      if (writingContext) {
        replaceText(writingContext.element, response.result);
      }
      showMessage("✨ Text rewritten successfully!");
    } else {
      showMessage("Couldn't rewrite the text. Try again?");
    }
  };

  const handleAnalyzePage = async () => {
    const pageContent = {
      title: document.title,
      url: window.location.href,
      text: document.body.innerText.substring(0, 2000), // First 2000 chars
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.textContent).slice(0, 10)
    };

    const response = await sendAIRequest('ANALYZE_PAGE', JSON.stringify(pageContent));
    if (response.success) {
      showMessage(`🔍 Page Analysis: ${response.result}`);
    } else {
      showMessage("Couldn't analyze the page. Try again?");
    }
  };

  const handleSmartHelp = async () => {
    const context = {
      url: window.location.href,
      title: document.title,
      activeElement: document.activeElement?.tagName,
      selectedText: window.getSelection()?.toString()?.substring(0, 200)
    };

    const response = await sendAIRequest('SMART_HELP', JSON.stringify(context));
    if (response.success) {
      showMessage(`🤖 Smart Help: ${response.result}`);
    } else {
      showMessage("Here are some things I can help with: writing, translation, summarization, code explanation, and page analysis!");
    }
  };

  const handleGeneralAIRequest = async (action, params = {}) => {
    // Handle any unrecognized action with intelligent response
    const context = {
      action: action,
      url: window.location.href,
      title: document.title,
      params: params
    };

    const response = await sendAIRequest('GENERAL_AI', JSON.stringify(context));
    if (response.success) {
      showMessage(`🤖 ${response.result}`);
    } else {
      // Provide helpful suggestions based on the action
      const suggestions = {
        'write': '✍️ Try selecting text and I\'ll help improve it!',
        'help': '🤖 I can help with writing, translation, summarization, and code!',
        'analyze': '🔍 I can analyze this page - just ask!',
        'translate': '🌍 Select text and I\'ll translate it for you!',
        'code': '💻 Select code and I\'ll explain what it does!'
      };
      
      const suggestion = suggestions[action] || '🤖 I\'m your AI assistant! Try asking me to help with writing, translation, or analysis.';
      showMessage(suggestion);
    }
  };

  const sendAIRequest = async (action, text, options = {}) => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        type: 'AI_REQUEST',
        data: { action, text, options }
      }, (response) => {
        resolve(response || { success: false, error: 'No response' });
      });
    });
  };

  const replaceText = (element, newText) => {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      element.value = newText;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
      element.textContent = newText;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.log('Clipboard API not available');
    }
  };

  const showMessage = (message) => {
    setBubbleData({
      message,
      suggestions: [
        { text: 'Thanks!', action: 'close', icon: '👍', type: 'secondary' }
      ],
      isVisible: true,
      isLoading: false
    });
    setAnimationState('idle');
  };

  const closeBubble = () => {
    setBubbleData(prev => ({ ...prev, isVisible: false }));
    setAnimationState('idle');
  };

  // Conversation Mode Functions
  const startConversationMode = () => {
    closeBubble();
    setConversationMode(true);
    setAnimationState('excited');
    
    // Add welcome message if no messages exist
    if (messages.length === 0) {
      setMessages([{
        type: 'clippy',
        content: "Hi! I'm ready to chat! 📎 Ask me anything - I can help with writing, take screenshots to see what you're working on, access your files, or just have a friendly conversation!",
        timestamp: Date.now(),
        suggestions: [
          { text: "What's on my screen?", icon: "👀" },
          { text: "Help me write", icon: "✍️" },
          { text: "Show my files", icon: "📁" },
          { text: "Translate something", icon: "🌍" }
        ]
      }]);
    }
  };

  const handleSendMessage = async (messageText) => {
    // Add user message
    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setConversationLoading(true);

    try {
      // Get page context
      const context = {
        url: window.location.href,
        title: document.title
      };

      // Send to background script for AI processing
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: 'CONVERSATION_REQUEST',
          data: { query: messageText, context }
        }, resolve);
      });

      if (response.success) {
        const clippyMessage = {
          type: 'clippy',
          content: response.response,
          timestamp: response.timestamp,
          suggestions: response.suggestions
        };
        setMessages(prev => [...prev, clippyMessage]);
      } else {
        const errorMessage = {
          type: 'clippy',
          content: response.fallback || "Sorry, I had trouble processing that. Could you try asking differently?",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'clippy',
        content: "Oops! Something went wrong. I'm still learning, so please try again! 😅",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setConversationLoading(false);
    }
  };

  const handleScreenshot = async () => {
    setConversationLoading(true);
    setAnimationState('thinking');

    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, resolve);
      });

      if (response.success) {
        // Add user message about taking screenshot
        const userMessage = {
          type: 'user',
          content: "📸 I took a screenshot for you to analyze",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMessage]);

        // Process screenshot with AI
        const analysisResponse = await new Promise((resolve) => {
          chrome.runtime.sendMessage({
            type: 'CONVERSATION_REQUEST',
            data: { 
              query: "What do you see in this screenshot? Describe what's on the screen and offer helpful suggestions.",
              context: response.context,
              screenshot: response.screenshot
            }
          }, resolve);
        });

        if (analysisResponse.success) {
          const clippyMessage = {
            type: 'clippy',
            content: analysisResponse.response,
            timestamp: analysisResponse.timestamp,
            screenshot: response.screenshot,
            suggestions: analysisResponse.suggestions
          };
          setMessages(prev => [...prev, clippyMessage]);
        }
      } else {
        const errorMessage = {
          type: 'clippy',
          content: "I couldn't take a screenshot right now. Make sure I have permission to capture your screen!",
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'clippy',
        content: "Screenshot failed! Make sure Chrome has permission to capture your screen.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setConversationLoading(false);
      setAnimationState('idle');
    }
  };

  const handleFileAccess = async () => {
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'ACCESS_FILES' }, resolve);
      });

      if (response.success) {
        const fileMessage = {
          type: 'clippy',
          content: "Here are the file options I can help you with:",
          timestamp: Date.now(),
          suggestions: response.options.map(option => ({
            text: option.name,
            icon: option.icon
          }))
        };
        setMessages(prev => [...prev, fileMessage]);
      }
    } catch (error) {
      const errorMessage = {
        type: 'clippy',
        content: "I can't access files directly, but I can help you work with downloads, uploads, and file organization tips!",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const closeConversation = () => {
    setConversationMode(false);
    setAnimationState('idle');
  };

  if (!settings.enabled || !isVisible) {
    return null;
  }

  return (
    <>
      <ClippyCharacter
        animationState={animationState}
        onClick={handleClippyClick}
      />
      {!conversationMode ? (
        <SpeechBubble
          message={bubbleData.message}
          suggestions={bubbleData.suggestions}
          isVisible={bubbleData.isVisible}
          onClose={closeBubble}
          onAction={handleAction}
          isLoading={bubbleData.isLoading}
        />
      ) : (
        <ConversationBox
          isVisible={conversationMode}
          onClose={closeConversation}
          onSendMessage={handleSendMessage}
          onScreenshot={handleScreenshot}
          onFileAccess={handleFileAccess}
          messages={messages}
          isLoading={conversationLoading}
        />
      )}
    </>
  );
};

// Initialize Clippy
function initializeClippy() {
  // Avoid duplicate initialization
  if (document.getElementById('ai-clippy-container')) {
    return;
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'ai-clippy-container';
  document.body.appendChild(container);

  // Render React app
  const root = ReactDOM.createRoot(container);
  root.render(<ClippyApp />);
  
  console.log('📎 AI Clippy 2025 initialized!');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeClippy);
} else {
  initializeClippy();
}