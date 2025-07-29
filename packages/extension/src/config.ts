import type { NestedConfigs } from './generated/meta.js'
import { defineConfigObject } from 'reactive-vscode'
import { scopedConfigs } from './generated/meta.js'

export const config = defineConfigObject<NestedConfigs>(
  scopedConfigs.scope,
  scopedConfigs.defaults,
)
