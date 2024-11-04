import '@logseq/libs'
import React, { useEffect, useCallback } from 'react'

export default function (props: { content: string }) {
  const { content } = props
  const elRef = React.useRef(null)
  const [ready, setReady] = React.useState(false)
  const host = logseq.Experiments.ensureHostScope()

  useEffect(() => {
    if (host.$typst) {
      return setReady(true)
    }

    let timer
    logseq.Experiments
      .loadScripts('./vendors/typst.ts/dist/index.js')
      .then(() => {
        timer = setTimeout(() => {
          setReady(true)
        }, 50)
      })

    return () => {
      timer && clearTimeout(timer)
    }
  }, [ready])

  const debouncedRender = useCallback(
    (() => {
      let timer
      return (content: string) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          host.$typst
            .svg({ mainContent: content })
            .then((svg) => {
              if (elRef.current) {
                delete elRef.current.dataset.processed
              }
              elRef.current.innerHTML = svg
            })
            .catch((e) => {
              console.error('Error generating SVG', e)
            })
        }, 50)
      }
    })(),
    [])

  useEffect(() => {
    if (!ready || !content?.trim()) return
    debouncedRender(content)
  }, [ready, content, debouncedRender])

  return (
    <>
      {ready ? (
        <div className={'typst'} ref={elRef}/>
      ) : (
        <strong> Loading ...</strong>
      )}
    </>
  )
}
