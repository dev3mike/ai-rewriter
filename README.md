# AI Rewriter Chrome Extension

A Chrome extension that uses AI to rewrite selected text using either OpenAI or OpenRouter API.

## Features

- Right-click on selected text to rewrite it using AI
- Support for multiple AI providers (OpenAI and OpenRouter)
- Modern dark mode UI
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
2. Select your preferred provider (OpenAI or OpenRouter)
3. Enter your API key for the selected provider
4. Select any text on a webpage
5. Right-click and select "AI Rewriter | Rewrite it"
6. The selected text will be replaced with the AI-generated version

### API Keys
- For OpenRouter: Get your API key from [OpenRouter](https://openrouter.ai/)
- For OpenAI: Get your API key from [OpenAI Platform](https://platform.openai.com/)

## Project Structure

```
src/
├── background/     # Background script
├── content/        # Content script
├── popup/         # Extension popup UI
├── services/      # Shared services
└── types/         # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.