import { useLogger } from 'reactive-vscode'
import { displayName } from './generated/meta.js'

export const logger = useLogger(displayName)
