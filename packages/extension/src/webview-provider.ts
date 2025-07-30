import type {
  AnyWebviewMessage,
  FileHistory,
} from '@file-history-vsx/types'
import type { ExtensionContext, WebviewPanel } from 'vscode'
import type { GitService } from './services/git-service.js'
import * as path from 'node:path'
import { Uri, ViewColumn, window } from 'vscode'
import { displayName as title } from './generated/meta.js'

export class FileHistoryWebviewProvider {
  private panel: WebviewPanel | undefined
  private context: ExtensionContext
  private gitService: GitService
  private currentFileHistory: FileHistory | null = null

  constructor(context: ExtensionContext, gitService: GitService) {
    this.context = context
    this.gitService = gitService
  }

  public createOrShow() {
    const column = window.activeTextEditor
      ? window.activeTextEditor.viewColumn
      : undefined

    if (this.panel) {
      this.panel.reveal(column)
      return
    }

    this.panel = window.createWebviewPanel(
      'fileHistoryView',
      'File History',
      column || ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          Uri.file(path.join(this.context.extensionPath, 'packages', 'webview', 'dist')),
          Uri.file(path.join(this.context.extensionPath, 'packages', 'webview', 'src')),
        ],
      },
    )

    this.panel.webview.html = this.getWebviewContent()
    this.setupWebviewMessageHandling()

    this.panel.onDidDispose(() => {
      this.panel = undefined
    })
  }

  private getWebviewContent(): string {
    if (!this.panel)
      return ''

    const webview = this.panel.webview
    const extensionPath = this.context.extensionPath

    // Local paths to built webview assets
    const scriptPathOnDisk = Uri.file(path.join(extensionPath, 'packages', 'webview', 'dist', 'main.js'))
    const stylesPathOnDisk = Uri.file(path.join(extensionPath, 'packages', 'webview', 'dist', 'main.css'))
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk)
    const stylesUri = webview.asWebviewUri(stylesPathOnDisk)

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${webview.cspSource} 'unsafe-inline' 'unsafe-eval'; style-src ${webview.cspSource} 'unsafe-inline';">
    <title>${title}</title>

    <link href="${stylesUri}" rel="stylesheet">
</head>
<body>
    <div id="app" class="isolate"></div>
    <script type="module" src="${scriptUri}"></script>
</body>
</html>`
  }

  private setupWebviewMessageHandling() {
    if (!this.panel)
      return

    this.panel.webview.onDidReceiveMessage(async (message: AnyWebviewMessage) => {
      switch (message.type) {
        case 'analyzeFile': {
          const analyzeMessage = message
          const filePath = analyzeMessage.data.filePath
          if (filePath) {
            await this.analyzeFile(filePath)
          }
          break
        }
      }
    })

    window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        // Notify webview of current file change
        this.sendMessage({
          type: 'updateCurrentFile',
          data: { filePath: editor.document.fileName },
        })
      }
    })
  }

  private sendMessage(message: AnyWebviewMessage) {
    this.panel?.webview.postMessage(message)
  }

  /**
   * Analyze git history for a specific file
   */
  public async analyzeFile(filePath: string): Promise<void> {
    try {
      // Show loading state
      this.sendMessage({
        type: 'analysisStarted',
        data: { filePath },
      })

      // Check if file is in git repository
      if (!await this.gitService.isFileInGitRepository(filePath)) {
        this.sendMessage({
          type: 'analysisError',
          data: { error: 'File is not in a git repository' },
        })
        return
      }

      // Get git history
      const gitHistory = await this.gitService.getFileHistory(filePath)

      if (!gitHistory) {
        this.sendMessage({
          type: 'analysisError',
          data: { error: 'Failed to retrieve git history' },
        })
        return
      }

      this.currentFileHistory = gitHistory

      // Send results to webview
      this.sendMessage({
        type: 'analysisComplete',
        data: gitHistory,
      })
    }
    catch (error) {
      console.error('Error analyzing file:', error)
      this.sendMessage({
        type: 'analysisError',
        data: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      })
    }
  }
}
