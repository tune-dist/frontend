import { useEffect } from 'react'

export const UPLOAD_LEAVE_MESSAGE =
  'An upload is still in progress. If you leave, this upload will stop.'

export function confirmLeaveDuringUpload(): boolean {
  return window.confirm(UPLOAD_LEAVE_MESSAGE)
}

/** Refresh, browser back, and in-app links while a file upload is running. */
export function useWarnOnPageLeave(active: boolean) {
  useEffect(() => {
    if (!active) return

    const stayOnPage = location.href

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const onPopState = (event: PopStateEvent) => {
      event.stopImmediatePropagation()
      if (confirmLeaveDuringUpload()) {
        window.removeEventListener('popstate', onPopState, true)
        window.location.href = location.href
        return
      }
      history.pushState(null, '', stayOnPage)
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return
      if (anchor.target === '_blank') return

      event.preventDefault()
      event.stopPropagation()
      if (!confirmLeaveDuringUpload()) return
      window.location.href = anchor.href
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    window.addEventListener('popstate', onPopState, true)
    document.addEventListener('click', onDocumentClick, true)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      window.removeEventListener('popstate', onPopState, true)
      document.removeEventListener('click', onDocumentClick, true)
    }
  }, [active])
}
