import type { ExtensionContext } from 'vscode'
import type { FileHistory, GitCommitInfo } from './types.js'
import { extensions, Uri, workspace } from 'vscode'
import { logger } from '../utils.js'

// Git extension API interfaces
export interface GitAPI {
  repositories: Repository[]
  getRepository: (uri: Uri) => Repository | null
}

export interface Repository {
  rootUri: Uri
  state: RepositoryState
  log: (options?: LogOptions) => Promise<Commit[]>
  show: (object: string, path: string) => Promise<string>
  getCommit: (ref: string) => Promise<Commit>
  diff: (cached?: boolean) => Promise<string>
  diffWithHEAD: (path?: string) => Promise<string>
  diffWith: (ref1: string, ref2?: string, path?: string) => Promise<string>
}

export interface RepositoryState {
  HEAD: Branch | undefined
  refs: Ref[]
  remotes: Remote[]
  submodules: Submodule[]
  rebaseCommit: Commit | undefined
}

export interface Branch {
  type: RefTypeValue
  name?: string
  commit?: string
  remote?: string
}

export interface Ref {
  type: RefTypeValue
  name?: string
  commit?: string
  remote?: string
}

export interface Remote {
  name: string
  fetchUrl?: string
  pushUrl?: string
  isReadOnly: boolean
}

export interface Submodule {
  name: string
  path: string
  url: string
}

export interface Commit {
  hash: string
  message: string
  parents: string[]
  authorDate?: Date
  authorName?: string
  authorEmail?: string
  commitDate?: Date
}

export interface LogOptions {
  maxEntries?: number
  from?: string
  to?: string
  path?: string
  reverse?: boolean
  shortStat?: boolean
}

export const RefType = {
  Head: 0,
  RemoteHead: 1,
  Tag: 2,
} as const

export type RefTypeValue = typeof RefType[keyof typeof RefType]

export class GitService {
  private gitAPI: GitAPI | null = null
  private context: ExtensionContext

  constructor(context: ExtensionContext) {
    this.context = context
    this.initializeGitAPI()
  }

  private async initializeGitAPI(): Promise<void> {
    try {
      const gitExtension = extensions.getExtension('vscode.git')
      if (!gitExtension) {
        logger.error('Git extension not found')
        return
      }

      if (!gitExtension.isActive) {
        await gitExtension.activate()
      }

      this.gitAPI = gitExtension.exports.getAPI(1)
      logger.info('Git API initialized successfully')
    }
    catch (error) {
      logger.error('Failed to initialize Git API:', error)
    }
  }

  /**
   * Get git repository for a given file URI
   */
  private getRepository(fileUri: Uri): Repository | null {
    if (!this.gitAPI) {
      logger.warn('Git API not available')
      return null
    }

    return this.gitAPI.getRepository(fileUri)
  }

  /**
   * Check if a file is in a git repository
   */
  public async isFileInGitRepository(filePath: string): Promise<boolean> {
    try {
      const fileUri = Uri.file(filePath)
      const repo = this.getRepository(fileUri)
      return repo !== null
    }
    catch (error) {
      logger.error('Error checking if file is in git repository:', error)
      return false
    }
  }

  /**
   * Get commit history for a specific file
   */
  public async getFileHistory(filePath: string, maxCommits = 50): Promise<FileHistory | null> {
    try {
      const fileUri = Uri.file(filePath)
      const repo = this.getRepository(fileUri)

      if (!repo) {
        logger.warn(`No git repository found for file: ${filePath}`)
        return null
      }

      // Get relative path from repository root
      const relativePath = workspace.asRelativePath(fileUri, false)

      logger.info(`Getting git history for file: ${relativePath}`)

      // Get commits for the specific file
      const commits = await repo.log({
        maxEntries: maxCommits,
        path: relativePath,
      })

      if (commits.length === 0) {
        logger.info(`No commits found for file: ${relativePath}`)
        return {
          filePath: relativePath,
          commits: [],
          totalCommits: 0,
          firstCommit: null,
          lastCommit: null,
          repositoryRoot: repo.rootUri.fsPath,
        }
      }

      // Process commits and get additional information
      const gitCommits: GitCommitInfo[] = []

      for (const commit of commits) {
        try {
          // Get diff for this commit and file
          const diff = await this.getCommitDiff(repo, commit.hash, relativePath)

          // Extract issue references from commit message
          const issueReferences = this.extractIssueReferences(commit.message)

          // Get list of changed files (simplified - just the current file for now)
          const filesChanged = [relativePath]

          const gitCommit: GitCommitInfo = {
            hash: commit.hash,
            author: commit.authorName || 'Unknown',
            email: commit.authorEmail || '',
            date: commit.authorDate || new Date(),
            message: commit.message,
            diff,
            filesChanged,
            issueReferences,
          }

          gitCommits.push(gitCommit)
        }
        catch (error) {
          logger.warn(`Failed to process commit ${commit.hash}:`, error)
          // Continue with other commits even if one fails
        }
      }

      const fileHistory: FileHistory = {
        filePath: relativePath,
        commits: gitCommits,
        totalCommits: gitCommits.length,
        firstCommit: gitCommits.length > 0 ? gitCommits[gitCommits.length - 1].date : null,
        lastCommit: gitCommits.length > 0 ? gitCommits[0].date : null,
        repositoryRoot: repo.rootUri.fsPath,
      }

      logger.info(`Retrieved ${gitCommits.length} commits for file: ${relativePath}`)
      return fileHistory
    }
    catch (error) {
      logger.error('Error getting file history:', error)
      return null
    }
  }

  /**
   * Get diff for a specific commit and file
   */
  private async getCommitDiff(repo: Repository, commitHash: string, filePath: string): Promise<string> {
    try {
      // Get the diff using the repository's diff methods
      // For a specific commit, we need to compare with its parent
      const commit = await repo.getCommit(commitHash)

      if (commit.parents.length === 0) {
        // Initial commit - show the entire file content
        return await repo.show(commitHash, filePath)
      }

      // Compare with first parent
      const parentHash = commit.parents[0]
      return await repo.diffWith(parentHash, commitHash, filePath)
    }
    catch (error) {
      logger.warn(`Failed to get diff for commit ${commitHash} and file ${filePath}:`, error)
      return ''
    }
  }

  /**
   * Extract issue/PR references from commit message
   * Supports GitHub (#123), Azure DevOps (#456), GitLab (!789), etc.
   */
  private extractIssueReferences(message: string): string[] {
    const patterns = [
      // GitHub issues and PRs: #123
      /#(\d+)/g,
      // Azure DevOps: AB#123, fixes #456
      /AB#(\d+)/gi,
      // GitLab merge requests: !123
      /!(\d+)/g,
      // JIRA tickets: ABC-123
      /[A-Z]+-\d+/g,
      // Generic ticket references: fixes #123, closes #456, resolves #789
      /(?:fixes?|closes?|resolves?)\s+#(\d+)/gi,
    ]

    const references: string[] = []

    for (const pattern of patterns) {
      const matches = Array.from(message.matchAll(pattern))
      for (const match of matches) {
        references.push(match[0])
      }
    }

    // Remove duplicates and return
    return Array.from(new Set(references))
  }

  /**
   * Get current branch name
   */
  public async getCurrentBranch(filePath: string): Promise<string | null> {
    try {
      const fileUri = Uri.file(filePath)
      const repo = this.getRepository(fileUri)

      if (!repo || !repo.state.HEAD) {
        return null
      }

      return repo.state.HEAD.name || null
    }
    catch (error) {
      logger.error('Error getting current branch:', error)
      return null
    }
  }

  /**
   * Get repository root path
   */
  public getRepositoryRoot(filePath: string): string | null {
    try {
      const fileUri = Uri.file(filePath)
      const repo = this.getRepository(fileUri)

      if (!repo) {
        return null
      }

      return repo.rootUri.fsPath
    }
    catch (error) {
      logger.error('Error getting repository root:', error)
      return null
    }
  }

  /**
   * Check if git extension is available and active
   */
  public isGitAvailable(): boolean {
    return this.gitAPI !== null
  }

  /**
   * Get all repositories in the workspace
   */
  public getRepositories(): Repository[] {
    if (!this.gitAPI) {
      return []
    }
    return this.gitAPI.repositories
  }
}
