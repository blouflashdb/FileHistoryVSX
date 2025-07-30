<script setup lang="ts">
import type {
  AnyWebviewMessage,
  FileHistory,
} from '@file-history-vsx/types'
import { useEventListener } from '@vueuse/core'
import { ref } from 'vue'

const vscode = acquireVsCodeApi()

// Reactive data
const currentFile = ref<string>('')
const gitHistory = ref<FileHistory | null>(null)
const isAnalyzing = ref<boolean>(false)
const analysisError = ref<string>('')

// Helper function to send typed messages
function sendMessage(message: AnyWebviewMessage): void {
  vscode?.postMessage(message)
}

// Methods
function analyzeCurrentFile() {
  if (!currentFile.value) {
    return
  }

  analysisError.value = ''
  sendMessage({
    type: 'analyzeFile',
    data: { filePath: currentFile.value },
  })
}

function formatDate(dateInput: string | number | Date) {
  return new Date(dateInput).toLocaleString()
}

function getCommitSummary(message: string) {
  return message.split('\n')[0]
}

useEventListener(window, 'message', (event) => {
  const message = event.data as AnyWebviewMessage

  switch (message.type) {
    case 'updateCurrentFile':
      currentFile.value = message.data.filePath
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
    default:
      // Handle unknown message types
      break
  }
})
</script>

<template>
  <UApp>
    <div class="min-h-screen bg-default text-default">
      <header class="border-b border-default p-6 text-center">
        <h1 class="text-2xl font-semibold text-primary mb-2">
          File History VSX
        </h1>
        <p class="text-muted">
          AI-powered file history analysis with Git integration
        </p>
      </header>

      <main class="max-w-4xl mx-auto p-6 space-y-6">
        <RouterView />

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">
              Current File
            </h2>
          </template>

          <div class="space-y-4">
            <div class="p-3 bg-elevated border border-default">
              <p v-if="currentFile" class="font-mono text-sm break-all">
                {{ currentFile }}
              </p>
              <p v-else class="text-muted italic">
                No file selected
              </p>
            </div>

            <div class="flex gap-3 flex-wrap">
              <UButton
                color="primary"
              >
                TODO?
              </UButton>
              <UButton
                color="secondary"
                variant="outline"
                :disabled="!currentFile || isAnalyzing"
                :loading="isAnalyzing"
                @click="analyzeCurrentFile"
              >
                {{ isAnalyzing ? 'Analyzing...' : 'Analyze Git History' }}
              </UButton>
            </div>

            <UAlert
              v-if="analysisError"
              color="error"
              variant="soft"
              :description="analysisError"
            />
          </div>
        </UCard>

        <!-- Git History Analysis Results -->
        <UCard v-if="gitHistory">
          <template #header>
            <h2 class="text-lg font-semibold">
              Git History Analysis
            </h2>
          </template>

          <div class="space-y-4">
            <div class="p-4 bg-muted space-y-2">
              <p><strong>File:</strong> {{ gitHistory.filePath }}</p>
              <p>
                <strong>Total Commits:</strong>
                <UBadge color="primary" variant="soft">
                  {{ gitHistory.totalCommits }}
                </UBadge>
              </p>
              <p v-if="gitHistory.firstCommit">
                <strong>First Commit:</strong> {{ formatDate(gitHistory.firstCommit) }}
              </p>
              <p v-if="gitHistory.lastCommit">
                <strong>Last Commit:</strong> {{ formatDate(gitHistory.lastCommit) }}
              </p>
            </div>

            <div v-if="gitHistory.commits.length > 0" class="space-y-3">
              <h3 class="text-md font-semibold">
                Recent Commits
              </h3>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <UCard
                  v-for="commit in gitHistory.commits.slice(0, 10)"
                  :key="commit.hash"
                >
                  <div class="space-y-3">
                    <div class="flex items-center gap-3 text-sm">
                      <UBadge variant="outline" size="xs" class="font-mono">
                        {{ commit.hash.substring(0, 8) }}
                      </UBadge>
                      <span class="text-muted">{{ commit.author }}</span>
                      <span class="text-muted ml-auto">{{ formatDate(commit.date) }}</span>
                    </div>
                    <p class="text-sm leading-relaxed">
                      {{ getCommitSummary(commit.message) }}
                    </p>
                    <div v-if="commit.issueReferences.length > 0" class="flex gap-2 flex-wrap">
                      <UBadge
                        v-for="issue in commit.issueReferences"
                        :key="issue"
                        color="info"
                        variant="soft"
                        size="xs"
                      >
                        {{ issue }}
                      </UBadge>
                    </div>
                  </div>
                </UCard>
              </div>
            </div>
          </div>
        </UCard>
      </main>
    </div>
  </UApp>
</template>
