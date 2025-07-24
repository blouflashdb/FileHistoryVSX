# FileHistoryVSX

<a href="https://marketplace.visualstudio.com/items?itemName=blouflashdb.file-history-vsx" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/blouflashdb.file-history-vsx.svg?color=eee&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>

A powerful VS Code extension that provides AI-powered file history analysis with Git integration, featuring a modern Vue.js 3 webview interface.

## Features

- 🔍 **AI-Powered Analysis**: Leverage OpenAI compatible APIs to analyze file history and changes
- 📊 **Git Integration**: Deep integration with Git to track file evolution and commit history
- 🎨 **Modern UI**: Beautiful Vue.js 3 webview interface with VS Code theming
- 📝 **Detailed Commit Analysis**: View commit history, authors, dates, and issue references
- ⚡ **Real-time Tracking**: Monitor file changes and history in real-time
- 🔧 **Configurable**: Customize AI model, API endpoints, and analysis parameters
- 📄 **Current File Focus**: Quick analysis of the currently active file

## Usage

1. **Install the extension** from the VS Code Marketplace
2. **Configure AI settings** (optional):
   - Open VS Code Settings (`Ctrl+,`)
   - Search for "FileHistoryVSX"
   - Configure your OpenAI API key and preferred model
3. **Open the file history view**:
   - Open VS Code Command Palette (`Ctrl+Shift+P`)
   - Run: `File History: Open File History`
4. **Analyze a specific file**:
   - Open any file in a Git repository
   - Run: `File History: Analyze Current File History`
5. **View results** in the beautiful Vue.js webview interface

### Configuration

The extension supports various AI providers through OpenAI-compatible APIs:

| Setting | Default | Description |
|---------|---------|-------------|
| `fileHistoryVSX.openai.apiKey` | `""` | API key for OpenAI compatible service |
| `fileHistoryVSX.openai.baseUrl` | `"https://api.openai.com/v1"` | Base URL for API endpoint |
| `fileHistoryVSX.openai.model` | `"gpt-3.5-turbo"` | Model name (e.g., gpt-4, claude-3-sonnet) |
| `fileHistoryVSX.openai.maxTokens` | `1000` | Maximum tokens to generate |
| `fileHistoryVSX.openai.temperature` | `0.7` | Response randomness (0-2) |

## Commands

<!-- commands -->

| Command                          | Title                                      |
| -------------------------------- | ------------------------------------------ |
| `filehistory.openView`           | File History: Open File History            |
| `filehistory.analyzeCurrentFile` | File History: Analyze Current File History |

<!-- commands -->

## Development

This extension combines modern technologies for a powerful development experience:

- **VS Code Extension API** - Core extension functionality
- **Vue.js 3** - Reactive webview interface with Composition API
- **TypeScript** - Type safety throughout the codebase
- **Vite** - Fast webview bundling and development
- **Reactive VSCode** - Reactive extension development framework
- **AI SDK** - Integration with OpenAI compatible APIs
- **Git Integration** - Deep repository analysis capabilities

### Prerequisites

- Node.js 18+
- npm 9+
- VS Code 1.102.0+

### Getting Started

```bash
# Clone the repository
git clone https://github.com/blouflashdb/FileHistoryVSX.git
cd FileHistoryVSX

# Install dependencies
npm install

# Build the extension
npm run build
```

### Development Workflow

```bash
# Development mode (watch both extension and webview)
npm run dev

# Build extension only
npm run build:extension

# Build webview only
npm run build:webview

# Watch webview development
npm run dev:webview

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Package and Publish

```bash
# Package extension
npm run pack

# Publish to marketplace
npm run publish

# Release (bump version and publish)
npm run release
```

## Architecture

The extension follows a clean separation of concerns:

### Extension Core
- **`src/index.ts`** - Main extension entry point and command registration
- **`src/webview-provider.ts`** - Webview provider managing Vue.js interface
- **`src/services/git-service.ts`** - Git repository integration and analysis
- **`src/config.ts`** - Configuration management for AI settings
- **`src/ai-config.ts`** - AI provider configuration and API integration

### Webview Interface (`packages/webview/`)
- **`src/App.vue`** - Main Vue.js component with reactive UI
- **`src/main.ts`** - Vue application initialization and setup
- **`vite.config.ts`** - Vite configuration for webview bundling
- **`public/`** - Static assets and HTML template

### Key Features

**Hybrid Architecture**: The VS Code extension handles Git operations, file system access, and AI API calls, while Vue.js provides a modern, reactive user interface that communicates through VS Code's webview messaging API.

**Git Integration**: Deep integration with Git repositories to analyze commit history, track file changes, and extract metadata like authors, dates, and issue references.

**AI-Powered Analysis**: Configurable integration with OpenAI compatible APIs (OpenAI, Anthropic Claude, local models) for intelligent file history analysis and insights.

**Reactive UI**: Vue.js 3 with Composition API provides a responsive interface that updates in real-time as analysis progresses.

## Requirements

- **VS Code**: Version 1.102.0 or higher
- **Git**: Required for file history analysis
- **Node.js**: Version 18+ for development
- **AI API Key**: Optional, for enhanced analysis features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

[MIT](./LICENSE.md) Original License © 2022 [Anthony Fu](https://github.com/antfu) License © 2025 [Daniel Schmitz](https://github.com/blouflashdb)
