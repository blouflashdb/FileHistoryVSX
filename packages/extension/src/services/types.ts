// Re-export types from the shared types package
export type {
  AnalyzeFileMessage,
  AnyWebviewMessage,
  FileAnalysis,
  FileHistory,
  FileHistoryError,
  GetConfigMessage,
  GitCommitInfo,
  GitError,
  OpenAIConfig,
  ShowHistoryMessage,
  UpdateConfigMessage,
  WebviewMessage,
  WebviewMessageType,
} from '@file-history-vsx/types'

// Legacy compatibility - keep existing exports for backward compatibility
export type {
  GitCommit, // deprecated, use GitCommitInfo instead
} from '@file-history-vsx/types'
