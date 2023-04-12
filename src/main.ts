import '@logseq/libs'
import { LSPluginBaseInfo, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'
import mermaidRenderer from './mermaid'
import echartsRenderer from './echarts'
import TikzjaxRenderer from './tikzjax'

const Supports = {
  Mermaid: 'mermaid',
  Echarts: 'echarts',
  TikZJax: 'tikz'
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
  {
    key: 'tikzjax',
    type: 'boolean',
    title: 'Support TikZJax (💡fenced code type is `tikz`)?',
    description: 'TikZJax converts script tags (containing TikZ code) into SVGs. (http://tikzjax.com/).',
    default: false
  },
]

function main(baseInfo: LSPluginBaseInfo) {
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

  if (settings.tikzjax) {
    logseq.Experiments.registerFencedCodeRenderer(
      Supports.TikZJax, {
        edit: true,
        render: TikzjaxRenderer
      }
    )
  }
}

// entry
logseq
  .useSettingsSchema(settingsSchema)
  .ready(main).catch(console.error)
