// Git-related type definitions for the extension

export interface GitCommitInfo {
  hash: string
  author: string
  email: string
  date: Date
  message: string
  diff: string
  filesChanged: string[]
  issueReferences: string[]
}

export interface FileHistory {
  filePath: string
  commits: GitCommitInfo[]
  totalCommits: number
  firstCommit: Date | null
  lastCommit: Date | null
  repositoryRoot: string
}

export interface GitError {
  message: string
  code?: string
  details?: string
}
