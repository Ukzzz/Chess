# Changelog

All notable changes to the Grandmaster Chess project will be documented in this file.

## [1.1.0] - 2026-03-25

### Added
- New professional SVG pieces (replacing Unicode characters).
- Modern dark-themed UI with Tailwind CSS.
- Sidebar for game info and room controls.
- Custom game-over modals for Checkmate and Draw.
- Copy-to-clipboard functionality for Room IDs.
- Inter font integration.

### Changed
- Refactored `app.js` with centralized room and game state management.
- Improved board rendering performance in `chessGame.js`.
- Simplified socket communication logic.
- Updated `README.md` with new features and setup instructions.

### Fixed
- Fixed typo in variable name `draggpiece` -> `draggedPiece`.
- Fixed typo in function name `getpieceUnicode` -> `getPieceSVG`.
- Corrected role assignment logic for spectators.
- Improved cleanup of player roles on disconnect.

---

## [1.0.0] - Initial Release
- Basic real-time chess with Socket.IO.
- Unicode pieces and basic CSS styling.
- Room-based joining via prompts.
