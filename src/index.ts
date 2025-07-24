import { defineExtension } from 'reactive-vscode'
import { commands, window } from 'vscode'
import { GitService } from './services/git-service.js'
import { FileHistoryWebviewProvider } from './webview-provider.js'

const { activate, deactivate } = defineExtension((ctx) => {
  // Create services
  const gitService = new GitService(ctx)

  // Create webview provider with git service
  const webviewProvider = new FileHistoryWebviewProvider(ctx, gitService)

  // Register command to open webview
  const openViewDisposable = commands.registerCommand('filehistory.openView', () => {
    webviewProvider.createOrShow()
  })

  // Register command to analyze current file
  const analyzeFileDisposable = commands.registerCommand('filehistory.analyzeCurrentFile', async () => {
    const activeEditor = window.activeTextEditor
    if (!activeEditor) {
      window.showWarningMessage('No file is currently open')
      return
    }

    const filePath = activeEditor.document.fileName

    if (!await gitService.isFileInGitRepository(filePath)) {
      window.showWarningMessage('Current file is not in a git repository')
      return
    }

    // Open the webview and trigger analysis
    webviewProvider.createOrShow()
    webviewProvider.analyzeFile(filePath)
  })

  ctx.subscriptions.push(openViewDisposable, analyzeFileDisposable)
})

export { activate, deactivate }
