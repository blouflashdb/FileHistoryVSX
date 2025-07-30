# Copilot Instructions for FileHistoryVSX

## Project Overview

FileHistoryVSX is a VS Code extension providing AI-powered Git file history analysis through a Vue.js webview interface. The architecture uses a **Turborepo monorepo** with three packages: extension (TypeScript), webview (Vue.js), and shared types.

## Architecture & Component Communication

### Core Components

- **`packages/extension/`**: VS Code extension using `reactive-vscode` framework
- **`packages/webview/`**: Vue.js 3 SPA with Nuxt UI components
- **`packages/types/`**: Shared TypeScript interfaces for message passing

### Extension ↔ Webview Communication

All communication uses typed messages via `AnyWebviewMessage` union type:

```typescript
// Extension sends to webview
{ type: 'analysisComplete'; data: FileHistory }
// Webview sends to extension
{ type: 'analyzeFile'; data: { filePath: string } }
```

### Git Integration Pattern

- Uses VS Code's built-in Git extension API (not direct git commands)
- `GitService` wraps the Git API with repository detection and file history extraction
- Issue reference extraction uses configurable regex patterns in VS Code settings

## Development Workflows

### Build & Development

```bash
npm run dev          # Watch mode for all packages (use this for development)
npm run build        # Production build with Turborepo caching
npm run typecheck    # Type checking across all packages
```

### Package-Specific Commands

- Extension: Uses `tsdown` for CommonJS output (VS Code requirement)
- Webview: Uses `vite build --watch` for development
- Types: Uses `obuild` for modern ESM compilation

### Extension Packaging

```bash
npm run pack         # Creates .vsix file for testing
npm run publish      # Publishes to VS Code Marketplace
```

## Project-Specific Conventions

### Configuration Management

- Uses `reactive-vscode`'s `defineConfigObject()` for typed VS Code settings
- Config auto-generated from `package.json` contributions via `vscode-ext-gen`
- AI settings support environment variable fallbacks: `OPENAI_API_KEY`, `OPENAI_BASE_URL`

### File Structure Patterns

```
packages/extension/src/
├── index.ts                 # Main extension entry (reactive-vscode pattern)
├── webview-provider.ts      # Webview lifecycle management
├── services/git-service.ts  # Git API wrapper
├── generated/meta.ts        # Auto-generated from package.json
```

### Type Safety Across Packages

- All webview messages extend `WebviewMessage<T>` base interface
- Git commit data follows `GitCommitInfo` interface with diff content
- Use `@file-history-vsx/types` import for shared interfaces

### Webview Development

- Uses Nuxt UI components with VS Code theming integration
- Webview HTML template manually constructed in `webview-provider.ts`
- CSS/JS assets served via `webview.asWebviewUri()` for security

## Critical Integration Points

### Git Extension Dependency

Extension requires VS Code's built-in Git extension. Check availability:

```typescript
const gitExtension = extensions.getExtension('vscode.git')
if (!gitExtension?.isActive)
  await gitExtension.activate()
```

### AI API Configuration

Supports OpenAI-compatible APIs with these config priorities:

1. VS Code settings (`fileHistoryVSX.openai.*`)
2. Environment variables (`OPENAI_API_KEY`, etc.)
3. Defaults in package.json contributions

### Turborepo Build Dependencies

- Types package must build before extension/webview
- Extension depends on types for message interfaces
- Webview runs in watch mode during development

## Common Development Tasks

### Adding New Message Types

1. Add interface to `packages/types/src/index.ts`
2. Update `AnyWebviewMessage` union type
3. Handle in `webview-provider.ts` and `App.vue`

### Modifying Git Analysis

- Extend `GitCommitInfo` interface for new data
- Update `GitService.getFileHistory()` method
- Modify webview display in `App.vue`

### VS Code Configuration Changes

1. Update `package.json` contributions section
2. Run `npm run update` to regenerate meta files
3. Update TypeScript config interfaces accordingly

### Debugging Webview Issues

- Check browser dev tools via Command Palette → "Developer: Open Webview Developer Tools"
- Webview console errors appear in VS Code's output panel
- Message passing issues: verify message types match exactly between extension and webview
