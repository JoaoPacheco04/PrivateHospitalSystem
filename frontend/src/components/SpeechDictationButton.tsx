import { useState, useEffect } from 'react'
import { useLanguageStore } from '../store/languageStore'
import { toast } from '../store/toastStore'

// Declare Web Speech API interface for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onstart?: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

export default function SpeechDictationButton({
  onTranscript,
  className = '',
}: {
  onTranscript: (text: string) => void
  className?: string
}) {
  const [isListening, setIsListening] = useState(false)
  const language = useLanguageStore((s) => s.language)

  function toggleDictation() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      toast.error('Voice speech recognition is not supported in this browser.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language === 'pt' ? 'pt-PT' : 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
        toast.info(language === 'pt' ? '🎙️ A ouvir... Fale agora.' : '🎙️ Listening... Speak now.')
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript
        if (text) {
          onTranscript(text)
          toast.success(language === 'pt' ? 'Transcrição concluída!' : 'Voice transcribed successfully!')
        }
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
        toast.error('Microphone audio error or permission denied.')
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch {
      setIsListening(false)
      toast.error('Failed to initialize speech dictation.')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleDictation}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
        isListening
          ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/30'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300'
      } ${className}`}
      title={isListening ? 'Click to stop voice recording' : 'Click to dictate text using your microphone'}
    >
      <span>{isListening ? '🔴' : '🎙️'}</span>
      <span>{isListening ? 'Listening...' : 'Dictate'}</span>
    </button>
  )
}
