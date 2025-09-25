# Troubleshooting "Unknown error occurred when fetching the script"

## Quick Fix Steps:

### 1. Reload the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Find "AI Clippy 2025" extension
3. Click the **refresh/reload** button (🔄) 
4. Or toggle it OFF and ON again

### 2. Reinstall the Extension
1. Go to `chrome://extensions/`
2. Remove the current "AI Clippy 2025" extension
3. Click "Load unpacked" 
4. Select the `dist` folder: `C:\Source\POC\GoogleHackathon\dist`

### 3. Check Developer Console
1. Right-click on the webpage → "Inspect"
2. Go to "Console" tab
3. Look for any red error messages
4. Check if there are CSP (Content Security Policy) errors

### 4. Verify Files
The extension should have these files in the `dist` folder:
- ✅ manifest.json
- ✅ content.js 
- ✅ background.js
- ✅ clippy.css
- ✅ popup.html
- ✅ popup.js
- ✅ All icon files

### 5. Chrome Permissions
Make sure Chrome has these permissions enabled for the extension:
- ✅ "Read and change all your data on all websites"
- ✅ "Read your browsing history"

## Alternative Loading Method:

If the above doesn't work, try this method:

1. **Pack the extension**:
   ```
   npm run build
   ```

2. **Load as Developer Extension**:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Test on a simple webpage**:
   - Go to any webpage (like google.com)
   - Look for the Clippy character in bottom-right
   - If it doesn't appear, check the console for errors

## Common Issues:

### CSP Errors
If you see Content Security Policy errors:
- The website is blocking the extension
- Try on a different website
- Gmail, Facebook, and some sites have strict CSP

### Extension Not Loading
- Make sure you're selecting the `dist` folder, not the root folder
- Check that all files were built successfully
- Look for any build errors in the terminal

### Chrome Version
- Make sure you're using Chrome 121+ for Built-in AI features
- Check `chrome://version/`

## Testing the Extension:

1. **Basic Test**: Go to any simple webpage
2. **Look for Clippy**: Should appear in bottom-right corner
3. **Click Actions**: Try the speech bubbles
4. **Chat Feature**: Click "💬 Chat with Me"

If none of these steps work, please share:
1. Chrome version (`chrome://version/`)
2. Any console errors
3. Which step failed