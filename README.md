# Snippet Copier

A simple and elegant productivity tool for VS Code that lives in your sidebar. Snippet Copier allows you to save and quickly access frequently used text snippets—from LLM prompts and boilerplate code to git commands and configuration settings.

Stop wasting time re-typing the same text. With Snippet Copier, your essential snippets are always just a click away.

## Features

- **Seamless Sidebar Integration**: Runs as a clean, native-looking Webview in the VS Code Activity Bar.
- **One-Click Copying**: Click any saved snippet to instantly copy it to your clipboard.
- **Quick Add & Edit**:
  - Use the text area at the top to add new snippets.
  - Hover over any item and click the **Pencil** icon to load it back for editing.
- **Easy Deletion**: Hover over an item and click the **Trash Can** icon to remove it.
- **Persistent Storage**: Snippets are saved directly into your VS Code settings, so they can be synced across devices with Settings Sync.
- **Native UI**: Designed with VS Code's official colors, fonts, and icons for a consistent look and feel.

## How to Use

1.  Click the **Snippet Copier** icon in the Activity Bar to open the view.
2.  Type or paste your desired text into the **New Snippet** text area.
3.  Click the **Add Snippet** button to save it.
4.  To copy a snippet, simply click on it in the "Saved" list. A notification will confirm it's on your clipboard.
5.  To edit or delete, hover over the snippet to reveal the action icons.

## Extension Settings

This extension stores its data in your User `settings.json` file under the following key:

- `mySnippetCopier.snippets`: An array of strings where all your saved snippets are stored.

You can view or manually edit your snippets here:
```json
"mySnippetCopier.snippets": [
    "Hello World",
    "console.log('Hello from Snippet Copier!');"
]
```

## Requirements

There are no special requirements or dependencies for this extension.

## Release Notes

### 1.0.0

- Initial release of Snippet Copier.
- Core features: Add, edit, delete, and copy snippets from the sidebar.
- UI styled to match the native VS Code look and feel.
