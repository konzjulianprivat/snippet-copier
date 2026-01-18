# Change Log

All notable changes to the "snippet-copier" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.0] - 2026-01-18

### Added
- Full support for multi-line snippets with any special characters
- Compact single-line display for saved snippets to keep UI clean

### Fixed
- Edit functionality now properly preserves newlines and special characters
- Copy operation now works correctly for complex multi-line text
- Text escaping completely rewritten to handle all edge cases

### Changed
- Snippet display optimized to show only one line with ellipsis
- Internal architecture updated to use index-based operations instead of inline text embedding

## [1.0.0] - 2026-01-18

### Added
- Initial release of Snippet Copier
- Core features: Add, edit, delete, and copy snippets from the sidebar
- UI styled to match the native VS Code look and feel
- Persistent storage in VS Code settings