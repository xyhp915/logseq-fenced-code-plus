import '@logseq/libs'
import { LSPluginBaseInfo, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'
import mermaidRenderer from './mermaid'
import echartsRenderer from './echarts'
import TikzjaxRenderer from './tikzjax'
import htmlRenderer from './htmlmixed'

const Supports = {
  Mermaid: 'mermaid',
  Echarts: 'echarts',
  TikZJax: 'tikz',
  HTMLmixed: 'htmlmixed',
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
    key: 'htmlmixed',
    type: 'boolean',
    title: 'Support html mixed tags?',
    description: 'Render with html mixed tags',
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
        edit: false,
        render: mermaidRenderer
      }
    )
  }

  if (settings.echarts) {
    logseq.Experiments.registerFencedCodeRenderer(
      Supports.Echarts, {
        edit: false,
        render: echartsRenderer,
      }
    )
  }

  if (settings.htmlmixed) {
    logseq.Experiments.registerFencedCodeRenderer(
      Supports.HTMLmixed, {
        edit: false,
        render: htmlRenderer,
      }
    )
  }

  if (settings.tikzjax) {
    logseq.Experiments.registerFencedCodeRenderer(
      Supports.TikZJax, {
        edit: false,
        render: TikzjaxRenderer
      }
    )
  }
}

// entry
logseq
  .useSettingsSchema(settingsSchema)
  .ready(main).catch(console.error)
