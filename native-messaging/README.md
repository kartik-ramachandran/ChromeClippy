# Native Messaging Host for File Access

This optional component allows AI Clippy to access local files and folders.

## Setup Instructions

1. **Install Python requirements** (if you want file system access):
   ```bash
   pip install watchdog
   ```

2. **Register the native messaging host**:
   - Copy `native-host-manifest.json` to Chrome's native messaging folder
   - Update the `path` field to point to `clippy-file-host.py`

3. **Native messaging folders by OS**:
   - **Windows**: `%LOCALAPPDATA%\Google\Chrome\User Data\NativeMessagingHosts\`
   - **macOS**: `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`
   - **Linux**: `~/.config/google-chrome/NativeMessagingHosts/`

## Features

- List files and folders
- Monitor file changes
- Basic file operations (with user permission)
- Desktop organization suggestions

## Security

- All file operations require explicit user permission
- Limited to user's Documents, Downloads, and Desktop folders
- No system file access
- Read-only by default

## Note

File system access is optional. The extension works perfectly without it, but this adds extra functionality for power users who want Clippy to help with file organization.