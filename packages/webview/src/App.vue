<script setup lang="ts">
import { onMounted, ref } from 'vue'

const vscode = acquireVsCodeApi()

interface FileHistoryItem {
  name: string
  timestamp: number
}

interface GitCommit {
  hash: string
  author: string
  email: string
  date: string
  message: string
  diff: string
  filesChanged: string[]
  issueReferences: string[]
}

interface GitHistory {
  filePath: string
  commits: GitCommit[]
  totalCommits: number
  firstCommit: string | null
  lastCommit: string | null
  repositoryRoot: string
}

// Reactive data
const currentFile = ref<string>('')
const fileHistory = ref<FileHistoryItem[]>([])
const gitHistory = ref<GitHistory | null>(null)
const isAnalyzing = ref<boolean>(false)
const analysisError = ref<string>('')

// Methods
function requestCurrentFile() {
  vscode?.postMessage({
    command: 'getCurrentFile',
  })
}

function refreshHistory() {
  vscode?.postMessage({
    command: 'getFileHistory',
  })
}

function analyzeCurrentFile() {
  if (!currentFile.value) {
    return
  }

  analysisError.value = ''
  vscode?.postMessage({
    command: 'analyzeFile',
    data: currentFile.value,
  })
}

function formatDate(dateInput: string | number) {
  return new Date(dateInput).toLocaleString()
}

function getCommitSummary(message: string) {
  return message.split('\n')[0]
}

// Handle messages from VS Code
window.addEventListener('message', (event) => {
  const message = event.data

  switch (message.command) {
    case 'updateCurrentFile':
      currentFile.value = message.data
      break
    case 'updateFileHistory':
      fileHistory.value = message.data
      break
    case 'analysisStarted':
      isAnalyzing.value = true
      analysisError.value = ''
      gitHistory.value = null
      break
    case 'analysisComplete':
      isAnalyzing.value = false
      gitHistory.value = message.data
      break
    case 'analysisError':
      isAnalyzing.value = false
      analysisError.value = message.data.error
      break
    case 'historyCleared':
      fileHistory.value = []
      gitHistory.value = null
      break
  }
})

// Initialize
onMounted(() => {
  requestCurrentFile()
  refreshHistory()
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>File History VSX</h1>
      <p class="subtitle">
        AI-powered file history analysis with Git integration
      </p>
    </header>

    <main class="main">
      <div class="card">
        <h2>Current File</h2>
        <p v-if="currentFile" class="current-file">
          {{ currentFile }}
        </p>
        <p v-else class="no-file">
          No file selected
        </p>

        <div class="actions">
          <button class="button primary" @click="requestCurrentFile">
            Get Current File
          </button>
          <button
            class="button secondary"
            :disabled="!currentFile || isAnalyzing"
            @click="analyzeCurrentFile"
          >
            {{ isAnalyzing ? 'Analyzing...' : 'Analyze Git History' }}
          </button>
        </div>

        <div v-if="analysisError" class="error">
          <p>{{ analysisError }}</p>
        </div>
      </div>

      <!-- Git History Analysis Results -->
      <div v-if="gitHistory" class="card">
        <h2>Git History Analysis</h2>
        <div class="git-summary">
          <p><strong>File:</strong> {{ gitHistory.filePath }}</p>
          <p><strong>Total Commits:</strong> {{ gitHistory.totalCommits }}</p>
          <p v-if="gitHistory.firstCommit">
            <strong>First Commit:</strong> {{ formatDate(gitHistory.firstCommit) }}
          </p>
          <p v-if="gitHistory.lastCommit">
            <strong>Last Commit:</strong> {{ formatDate(gitHistory.lastCommit) }}
          </p>
        </div>

        <div v-if="gitHistory.commits.length > 0" class="commits-list">
          <h3>Recent Commits</h3>
          <div
            v-for="commit in gitHistory.commits.slice(0, 10)"
            :key="commit.hash"
            class="commit-item"
          >
            <div class="commit-header">
              <span class="commit-hash">{{ commit.hash.substring(0, 8) }}</span>
              <span class="commit-author">{{ commit.author }}</span>
              <span class="commit-date">{{ formatDate(commit.date) }}</span>
            </div>
            <div class="commit-message">
              {{ getCommitSummary(commit.message) }}
            </div>
            <div v-if="commit.issueReferences.length > 0" class="commit-issues">
              <span v-for="issue in commit.issueReferences" :key="issue" class="issue-ref">{{ issue }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  padding: 20px;
  font-family: var(--vscode-font-family);
  color: var(--vscode-foreground);
  background-color: var(--vscode-editor-background);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--vscode-widget-border);
}

.header h1 {
  font-size: 2rem;
  margin: 0 0 10px 0;
  color: var(--vscode-textLink-foreground);
}

.subtitle {
  margin: 0;
  color: var(--vscode-descriptionForeground);
}

.main {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background-color: var(--vscode-sideBar-background);
  border: 1px solid var(--vscode-widget-border);
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.card h2 {
  margin: 0 0 15px 0;
  color: var(--vscode-textLink-foreground);
}

.current-file {
  font-family: var(--vscode-editor-font-family);
  font-size: 14px;
  background-color: var(--vscode-input-background);
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 15px;
  word-break: break-all;
}

.button {
  background-color: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 5px;
  transition: background-color 0.2s;
}

.button:hover:not(:disabled) {
  background-color: var(--vscode-button-hoverBackground);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button.primary {
  background-color: var(--vscode-textLink-foreground);
  color: var(--vscode-editor-background);
}

.button.secondary {
  background-color: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border);
}

.button.danger {
  background-color: var(--vscode-errorForeground);
  color: var(--vscode-editor-background);
}

.error {
  background-color: var(--vscode-inputValidation-errorBackground);
  border: 1px solid var(--vscode-inputValidation-errorBorder);
  color: var(--vscode-errorForeground);
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.git-summary {
  background-color: var(--vscode-input-background);
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.git-summary p {
  margin: 5px 0;
}

.commits-list {
  max-height: 400px;
  overflow-y: auto;
}

.commits-list h3 {
  margin: 0 0 15px 0;
  color: var(--vscode-textLink-foreground);
}

.commit-item {
  border: 1px solid var(--vscode-widget-border);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 10px;
  background-color: var(--vscode-input-background);
}

.commit-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
}

.commit-hash {
  font-family: var(--vscode-editor-font-family);
  background-color: var(--vscode-badge-background);
  color: var(--vscode-badge-foreground);
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
}

.commit-author {
  color: var(--vscode-descriptionForeground);
}

.commit-date {
  color: var(--vscode-descriptionForeground);
  margin-left: auto;
}

.commit-message {
  font-size: 14px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.commit-issues {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.issue-ref {
  background-color: var(--vscode-textLink-foreground);
  color: var(--vscode-editor-background);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: bold;
}

.no-file, .no-history {
  color: var(--vscode-descriptionForeground);
  font-style: italic;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--vscode-widget-border);
}

.history-item:last-child {
  border-bottom: none;
}

.file-name {
  font-family: var(--vscode-editor-font-family);
  font-size: 14px;
}

.file-time {
  font-size: 12px;
  color: var(--vscode-descriptionForeground);
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
