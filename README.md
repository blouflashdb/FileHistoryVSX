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
- **Turborepo** - Monorepo management with optimized build pipeline
- **Vite** - Fast webview bundling and development
- **obuild** - Modern TypeScript bundler for shared packages
- **Reactive VSCode** - Reactive extension development framework
- **AI SDK** - Integration with OpenAI compatible APIs
- **Git Integration** - Deep repository analysis capabilities

### Prerequisites

- Node.js 22+
- npm 11+
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
# Development mode (watch all packages in parallel)
npm run dev

# Build all packages with Turborepo
npm run build

# Type checking across all packages
npm run typecheck

# Linting across all packages
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

The extension follows a clean monorepo architecture with Turborepo for optimized builds:

### Monorepo Structure

**`packages/extension/`** - VS Code extension core
- **`src/index.ts`** - Main extension entry point and command registration
- **`src/webview-provider.ts`** - Webview provider managing Vue.js interface
- **`src/services/git-service.ts`** - Git repository integration and analysis
- **`src/config.ts`** - Configuration management for AI settings
- **`src/ai-config.ts`** - AI provider configuration and API integration

**`packages/webview/`** - Vue.js webview interface
- **`src/App.vue`** - Main Vue.js component with reactive UI
- **`src/main.ts`** - Vue application initialization and setup
- **`vite.config.ts`** - Vite configuration for webview bundling
- **`public/`** - Static assets and HTML template

**`packages/types/`** - Shared TypeScript types
- **`src/index.ts`** - Shared type definitions and interfaces
- **`build.config.ts`** - obuild configuration for modern bundling
- Built with obuild for optimized TypeScript compilation and ESM output

### Build System

The project uses **Turborepo** for monorepo management with the following pipeline:
1. **Linting** - ESLint across all packages
2. **Type checking** - TypeScript validation
3. **Building** - Parallel builds with dependency awareness
4. **Caching** - Intelligent build caching for faster development

### Key Features

**Hybrid Architecture**: The VS Code extension handles Git operations, file system access, and AI API calls, while Vue.js provides a modern, reactive user interface that communicates through VS Code's webview messaging API.

**Git Integration**: Deep integration with Git repositories to analyze commit history, track file changes, and extract metadata like authors, dates, and issue references.

**AI-Powered Analysis**: Configurable integration with OpenAI compatible APIs (OpenAI, Anthropic Claude, local models) for intelligent file history analysis and insights.

**Reactive UI**: Vue.js 3 with Composition API provides a responsive interface that updates in real-time as analysis progresses.

## Requirements

- **VS Code**: Version 1.102.0 or higher
- **Git**: Required for file history analysis
- **Node.js**: Version 22+ for development
- **AI API Key**: Optional, for enhanced analysis features

## License

[MIT](./LICENSE.md) Original License © 2022 [Anthony Fu](https://github.com/antfu) License © 2025 [Daniel Schmitz](https://github.com/blouflashdb)
