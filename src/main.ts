import '@logseq/libs'
import { LSPluginBaseInfo, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'
import mermaidRenderer from './mermaid'
import echartsRenderer from './echarts'

const Supports = {
  Mermaid: 'mermaid',
  Echarts: 'echarts',
}

const settingsSchema: Array<SettingSchemaDesc> = [
  {
    key: 'mermaid',
    type: 'boolean',
    title: 'Support mermaid?',
    description: 'Mermaid lets you create diagrams and visualizations using text and code.',
    default: true
  },
  {
    key: 'echarts',
    type: 'boolean',
    title: 'Support echarts?',
    description: 'Use Echarts to render the chart.',
    default: true
  },
]

function main (baseInfo: LSPluginBaseInfo) {
  const { settings } = baseInfo

  if (settings.mermaid) {
    logseq.Experiments.registerFencedCodeRenderer(
      Supports.Mermaid, {
        edit: true,
        render: mermaidRenderer
      }
    )
  }
  if (settings.echarts) {
    logseq.Experiments.registerFencedCodeRenderer(
      Supports.Echarts, {
        edit: true,
        render: echartsRenderer,
      }
    )
  }
}

// entry
logseq
  .useSettingsSchema(settingsSchema)
  .ready(main).catch(console.error)
