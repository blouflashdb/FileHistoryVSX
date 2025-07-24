import * as process from 'node:process'
import { config } from './config.js'

export interface ApiConfig {
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
}

export function getApiConfig(): ApiConfig {
  return {
    apiKey: config.fileHistoryVSX.openai.apiKey
      || process.env.OPENAI_API_KEY
      || process.env.FILEHISTORY_API_KEY
      || '',
    baseUrl: config.fileHistoryVSX.openai.baseUrl
      || process.env.OPENAI_BASE_URL
      || 'https://api.openai.com/v1',
    model: config.fileHistoryVSX.openai.model
      || process.env.OPENAI_MODEL
      || 'gpt-3.5-turbo',
    maxTokens: config.fileHistoryVSX.openai.maxTokens || 1000,
    temperature: config.fileHistoryVSX.openai.temperature || 0.7,
  }
}
