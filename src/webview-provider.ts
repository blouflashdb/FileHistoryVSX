import type { ExtensionContext, WebviewPanel } from 'vscode'
import type { GitService } from './services/git-service.js'
import type { FileHistory } from './services/types.js'
import * as path from 'node:path'
import { Uri, ViewColumn, window } from 'vscode'
import { displayName as title } from './generated/meta.js'

export class FileHistoryWebviewProvider {
  private panel: WebviewPanel | undefined
  private context: ExtensionContext
  private gitService: GitService
  private fileHistory: Array<{ name: string, timestamp: number }> = []
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

    this.panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'getCurrentFile': {
          const activeEditor = window.activeTextEditor
          const currentFile = activeEditor?.document.fileName || null
          this.panel?.webview.postMessage({
            command: 'updateCurrentFile',
            data: currentFile,
          })

          // Add to history if we have a file
          if (currentFile) {
            const fileName = path.basename(currentFile)
            this.addToHistory(fileName)
          }
          break
        }
        case 'getFileHistory': {
          this.panel?.webview.postMessage({
            command: 'updateFileHistory',
            data: this.fileHistory,
          })
          break
        }
        case 'analyzeFile': {
          const filePath = message.data
          if (filePath) {
            await this.analyzeFile(filePath)
          }
          break
        }
        case 'getGitHistory': {
          if (this.currentFileHistory) {
            this.panel?.webview.postMessage({
              command: 'updateGitHistory',
              data: this.currentFileHistory,
            })
          }
          break
        }
      }
    })

    window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        const fileName = path.basename(editor.document.fileName)
        this.addToHistory(fileName)

        // Notify webview of current file change
        this.panel?.webview.postMessage({
          command: 'updateCurrentFile',
          data: editor.document.fileName,
        })
      }
    })
  }

  /**
   * Analyze git history for a specific file
   */
  public async analyzeFile(filePath: string): Promise<void> {
    try {
      // Show loading state
      this.panel?.webview.postMessage({
        command: 'analysisStarted',
        data: { filePath },
      })

      // Check if file is in git repository
      if (!await this.gitService.isFileInGitRepository(filePath)) {
        this.panel?.webview.postMessage({
          command: 'analysisError',
          data: { error: 'File is not in a git repository' },
        })
        return
      }

      // Get git history
      const gitHistory = await this.gitService.getFileHistory(filePath)

      if (!gitHistory) {
        this.panel?.webview.postMessage({
          command: 'analysisError',
          data: { error: 'Failed to retrieve git history' },
        })
        return
      }

      this.currentFileHistory = gitHistory

      // Send results to webview
      this.panel?.webview.postMessage({
        command: 'analysisComplete',
        data: gitHistory,
      })
    }
    catch (error) {
      console.error('Error analyzing file:', error)
      this.panel?.webview.postMessage({
        command: 'analysisError',
        data: { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      })
    }
  }

  private addToHistory(fileName: string) {
    const existingIndex = this.fileHistory.findIndex(item => item.name === fileName)

    if (existingIndex >= 0) {
      // Update timestamp if file already exists
      this.fileHistory[existingIndex].timestamp = Date.now()
    }
    else {
      // Add new file to history
      this.fileHistory.unshift({ name: fileName, timestamp: Date.now() })

      // Keep only last 50 files
      if (this.fileHistory.length > 50) {
        this.fileHistory = this.fileHistory.slice(0, 50)
      }
    }
  }
}
