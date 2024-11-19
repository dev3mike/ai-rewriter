# AI Rewriter Chrome Extension

A Chrome extension that uses AI to rewrite selected text using the OpenRouter API.

## Features

- Right-click on selected text to rewrite it using AI
- Customizable system prompt
- Modern and clean UI
- Secure API key storage
- Toast notifications for feedback

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Build the extension:
```bash
npm run build
```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from this project

## Development

- `npm run dev` - Build in development mode with watch
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes

## Usage

1. Click the extension icon to open settings
2. Enter your OpenRouter API key
3. (Optional) Customize the system prompt
4. Select any text on a webpage
5. Right-click and select "AI Rewriter | Rewrite it"
6. The selected text will be replaced with the AI-generated version

## Project Structure

```
src/
├── background/     # Background script
├── content/        # Content script
├── popup/          # Extension popup UI
├── services/       # Shared services
└── types/          # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
# ai-rewriter
