import '@logseq/libs'
import React from 'react'

export default function (props: { content: string }) {
  const { content } = props
  const elRef = React.useRef(null)
  const echartsRef = React.useRef(null)
  const [ready, setReady] = React.useState(false)
  const host = logseq.Experiments.ensureHostScope()
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    logseq.App.onThemeModeChanged(({ mode }) => setTheme(mode))
  }, [])

  React.useEffect(() => {
    if (echartsRef.current) {
      echartsRef.current.setOption({ darkMode: theme === 'dark' })
    }
  }, [theme])

  React.useEffect(() => {
    if (host.echarts) {
      return setReady(true)
    }

    let timer
    logseq.Experiments
      .loadScripts('./vendors/echarts.min.js')
      .then(() => {
        timer = setTimeout(() => {
          setReady(true)
        }, 50)
      })

    return () => {
      timer && clearTimeout(timer)
    }
  }, [ready])

  React.useEffect(() => {
    if (!ready || !content?.trim()) return

    if (host.echarts) {
      if (elRef.current) {
        const echarts = (parent.window as any).echarts
        const myChart = echarts.init(elRef.current)
        echartsRef.current = myChart
        const option = JSON.parse(content)
        console.log('[faiz:] === myChart', myChart, option)
        myChart.setOption(option)
      }
    }
  }, [ready, content, elRef.current])

  return (<div style={{ minHeight: '300px' }} className={'echarts'} ref={elRef}>Echarts Loading...</div>)
}
