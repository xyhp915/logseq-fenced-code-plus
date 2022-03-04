import '@logseq/libs'
import { LSPluginBaseInfo, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'
import mermaidRenderer from './mermaid'

const Supports = {
  Mermaid: 'mermaid'
}

const settingsSchema: Array<SettingSchemaDesc> = [
  {
    key: 'mermaid',
    type: 'boolean',
    title: 'Support mermaid?',
    description: 'Mermaid lets you create diagrams and visualizations using text and code.',
    default: true
  }
]

function main (baseInfo: LSPluginBaseInfo) {
  const { settings } = baseInfo

  if (settings.mermaid) {
    logseq.Experiments.registerFencedCodeRenderer(
      Supports.Mermaid, {
        edit: false,
        render: mermaidRenderer
      }
    )
  }
}

// entry
logseq
  .useSettingsSchema(settingsSchema)
  .ready(main).catch(console.error)