import '@logseq/libs'
import React from 'react'

export default function (props: { content: string }) {
  const { content } = props
  const elRef = React.useRef(null)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    // @ts-ignore
    if (top.mermaid) {
      return setReady(true)
    }

    logseq.Experiments
      .loadScripts('https://unpkg.com/mermaid@8.14.0/dist/mermaid.min.js')
      .then(() => {
        setTimeout(() => {
          setReady(true)
        }, 200)
      })
  }, [ready])

  React.useEffect(() => {
    if (!ready) return

    // @ts-ignore
    if (top.mermaid) {
      if (elRef.current) {
        delete elRef.current.dataset.processed
      }

      // @ts-ignore
      top.mermaid.init()
    }
  }, [ready, content])

  return (
    <>
      {ready ?
        (<div className={'mermaid'} ref={elRef}
              onClick={(e) => {
                logseq.UI.showMsg('hello clicked :)')
              }}>
          {content}
        </div>) :
        (<strong> Loading ...</strong>)
      }
    </>)
}