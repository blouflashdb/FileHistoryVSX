/**
 * Configuration interface for OpenAI API settings
 */
export interface OpenAIConfig {
  /** API key for OpenAI compatible service */
  apiKey: string
  /** Base URL for OpenAI compatible API */
  baseUrl: string
  /** Model name to use for API calls */
  model: string
  /** Maximum number of tokens to generate */
  maxTokens: number
  /** Temperature for API calls (0-2) */
  temperature: number
}

/**
 * Git commit information
 */
export interface GitCommitInfo {
  /** Commit hash/SHA */
  hash: string
  /** Author name */
  author: string
  /** Author email */
  email: string
  /** Commit date */
  date: Date
  /** Commit message */
  message: string
  /** Diff content */
  diff: string
  /** Files changed in this commit */
  filesChanged: string[]
  /** Referenced issues in commit message */
  issueReferences: string[]
}

/**
 * @deprecated Use GitCommitInfo instead
 */
export interface GitCommit extends GitCommitInfo {
  /** @deprecated Use hash instead */
  sha: string
  /** @deprecated Use filesChanged instead */
  files: string[]
}

/**
 * File history analysis result
 */
export interface FileHistory {
  /** File path being analyzed */
  filePath: string
  /** List of commits affecting this file */
  commits: GitCommitInfo[]
  /** Total number of commits */
  totalCommits: number
  /** Date of first commit */
  firstCommit: Date | null
  /** Date of last commit */
  lastCommit: Date | null
  /** Repository root path */
  repositoryRoot: string
}

/**
 * File analysis with AI insights
 */
export interface FileAnalysis {
  /** File path being analyzed */
  filePath: string
  /** List of commits affecting this file */
  commits: GitCommitInfo[]
  /** AI-generated analysis summary */
  summary: string
  /** Key insights about the file's evolution */
  insights: string[]
  /** Detected patterns in the file's history */
  patterns: string[]
}

/**
 * Git-related error information
 */
export interface GitError {
  /** Error message */
  message: string
  /** Error code for programmatic handling */
  code?: string
  /** Additional error details */
  details?: string
}

/**
 * Webview message types for communication between extension and webview
 */
export type WebviewMessageType
  = | 'analyzeFile'
    | 'showHistory'
    | 'getConfig'
    | 'updateConfig'

/**
 * Base interface for webview messages
 */
export interface WebviewMessage<T = any> {
  /** Message type identifier */
  type: WebviewMessageType
  /** Message payload */
  data: T
  /** Unique message ID for tracking responses */
  id?: string
}

/**
 * Message to analyze a specific file
 */
export interface AnalyzeFileMessage extends WebviewMessage<{ filePath: string }> {
  type: 'analyzeFile'
}

/**
 * Message to show file history
 */
export interface ShowHistoryMessage extends WebviewMessage<{ filePath: string }> {
  type: 'showHistory'
}

/**
 * Message to get current configuration
 */
export interface GetConfigMessage extends WebviewMessage<void> {
  type: 'getConfig'
}

/**
 * Message to update configuration
 */
export interface UpdateConfigMessage extends WebviewMessage<Partial<OpenAIConfig>> {
  type: 'updateConfig'
}

/**
 * Union type of all possible webview messages
 */
export type AnyWebviewMessage
  = | AnalyzeFileMessage
    | ShowHistoryMessage
    | GetConfigMessage
    | UpdateConfigMessage

/**
 * Error types that can occur in the extension
 */
export interface FileHistoryError {
  /** Error message */
  message: string
  /** Error code for programmatic handling */
  code: string
  /** Additional error details */
  details?: Record<string, any>
}
