# Chrome Extension Repository

## Overview
The repo consists of the google chrome extension created as a part of SF-Hacks for preventing data leak. 

## Features
- **Popup Interface:** A simple user interface that appears when you click the extension icon.
- **Background Script:** A background script that can handle events and perform tasks.
- **Basic Setup:** Easy-to-follow structure to understand how Chrome extensions work.

## Installation

1. **Clone or Download:**
   - Clone this repository or download the ZIP file and extract it.

2. **Load the Extension:**
   - Open Google Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** by toggling the switch in the upper-right corner.
   - Click on **Load unpacked** and select the directory containing the extension files.

3. **Test the Extension:**
   - After loading, you should see the extension icon in your Chrome toolbar.
   - Click the icon to open the popup and interact with the extension.


## Manifest File

The `manifest.json` file is crucial for configuring your extension. Below is an example:

```json
{
  "manifest_version": 2,
  "name": "Basic Chrome Extension",
  "version": "1.0",
  "description": "A basic Chrome extension running on a specific website.",
  "browser_action": {
    "default_popup": "popup.html",
    "default_title": "Click me!"
  },
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "content_scripts": [
    {
      "matches": ["https://example.com/*"],
      "js": ["content.js"]
    }
  ],
  "permissions": [
    "activeTab",
    "https://example.com/"
  ]
}


In this configuration:

content_scripts: The matches field ensures that content.js is injected only on pages under https://example.com/*.

permissions: This grants your extension the necessary permissions to interact with the specified website.

```
