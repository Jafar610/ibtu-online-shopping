import { useState } from 'react'
import { Send, AlertCircle, CheckCircle2, Mail, Info } from 'lucide-react'

export default function ReplyComposer({
  recipientEmail,
  defaultSubject = '',
  onSaveReply,
}) {
  const [subject, setSubject] = useState(defaultSubject ? `Re: ${defaultSubject}` : '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!subject.trim()) {
      setError('Subject line is required.')
      return
    }

    if (!message.trim() || message.trim().length < 5) {
      setError('Reply message must be at least 5 characters long.')
      return
    }

    const res = onSaveReply?.({
      subject: subject.trim(),
      message: message.trim(),
    })

    if (res && res.success) {
      setMessage('')
      setSuccess('Reply draft saved to inquiry history.')
      setTimeout(() => setSuccess(''), 4000)
    } else if (res && !res.success) {
      setError(res.message || 'Failed to save reply.')
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <Mail className="w-4 h-4 text-[#103321]" />
        <h3 className="font-serif font-bold text-base text-[#103321]">
          Draft Customer Response
        </h3>
      </div>

      {/* Prominent Sandbox Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Frontend Reply Drafting: </strong>
          This composer creates and stores customer response drafts in the message thread. It does not dispatch SMTP emails or contact external mail gateways.
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#95C623] shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            readOnly
            value={recipientEmail}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-mono outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Subject Line <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Re: Subject..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#95C623]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Reply Content <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your response to the customer..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 outline-none focus:border-[#95C623] resize-none"
          />
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#95C623]" />
            <span>Save Reply Draft</span>
          </button>
        </div>
      </form>
    </div>
  )
}
