import '@logseq/libs'
import React, { useEffect } from 'react'

export default function (props: { content: string }) {
  const { content } = props
  const elRef = React.useRef<HTMLDivElement>(null)
  const _host = logseq.Experiments.ensureHostScope()

  useEffect(() => {
    elRef.current.innerHTML = content
  }, [content])

  return (<div className={'fcp-html-container'} ref={elRef}></div>)
}
