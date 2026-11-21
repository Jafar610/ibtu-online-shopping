import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MessageSquare,
  User,
  Mail,
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  Edit2,
  Save,
  RotateCcw,
  ShieldCheck,
  FileText,
} from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminBreadcrumb from '../../components/admin/AdminBreadcrumb'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import ReplyComposer from '../../components/admin/ReplyComposer'
import {
  getStoredAdminMessages,
  updateMessageStatus,
  updateMessageAdminNotes,
  draftMessageReply,
} from '../../data/admin/adminEngagementData'

export default function AdminMessageDetailsPage() {
  const { messageId } = useParams()
  const [messageItem, setMessageItem] = useState(null)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [adminNotesText, setAdminNotesText] = useState('')
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 4000)
  }

  const loadMessage = () => {
    const list = getStoredAdminMessages()
    const found = list.find((m) => m.id === messageId)
    if (found) {
      setMessageItem(found)
      setAdminNotesText(found.adminNotes || '')
    }
  }

  useEffect(() => {
    loadMessage()
  }, [messageId])

  if (!messageItem) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <AdminBreadcrumb
            items={[
              { label: 'Customers & Engagement' },
              { label: 'Contact Messages', path: '/admin/messages' },
              { label: 'Not Found' },
            ]}
          />
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#103321]">
              Inquiry Not Found
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              No contact inquiry matching identifier "{messageId}" was found in local storage.
            </p>
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#103321] text-white text-xs font-bold hover:bg-[#103321]/90"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Messages</span>
            </Link>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const handleStatusChange = (newStatus) => {
    const res = updateMessageStatus(messageItem.id, newStatus)
    if (res.success) {
      loadMessage()
      showFeedback(`Message status updated to "${newStatus}".`)
    }
  }

  const handleSaveNotes = () => {
    const res = updateMessageAdminNotes(messageItem.id, adminNotesText)
    if (res.success) {
      setIsEditingNotes(false)
      loadMessage()
      showFeedback('Internal support notes saved.')
    }
  }

  const handleSaveReply = (replyData) => {
    const res = draftMessageReply(messageItem.id, replyData)
    if (res.success) {
      loadMessage()
      showFeedback(res.message)
      return { success: true }
    }
    return res
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <AdminBreadcrumb
          items={[
            { label: 'Customers & Engagement' },
            { label: 'Contact Messages', path: '/admin/messages' },
            { label: messageItem.id },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/messages"
              className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif font-extrabold text-2xl text-[#103321]">
                  Inquiry {messageItem.id}
                </h1>
                <AdminStatusBadge status={messageItem.status} type="message" />
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Submitted on {formatDate(messageItem.submissionDate)} by <span className="font-bold text-gray-800">{messageItem.senderName}</span>
              </p>
            </div>
          </div>

          {/* Status Progression Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {messageItem.status !== 'In Progress' && (
              <button
                type="button"
                onClick={() => handleStatusChange('In Progress')}
                className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-white text-xs font-bold text-gray-700 transition-colors cursor-pointer"
              >
                Mark In Progress
              </button>
            )}

            {messageItem.status !== 'Resolved' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Resolved')}
                className="px-4 py-2 rounded-xl bg-[#103321] hover:bg-[#103321]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#95C623]" />
                <span>Mark Resolved</span>
              </button>
            )}

            {messageItem.status !== 'Closed' && (
              <button
                type="button"
                onClick={() => handleStatusChange('Closed')}
                className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
              >
                Close Ticket
              </button>
            )}

            {(messageItem.status === 'Resolved' || messageItem.status === 'Closed') && (
              <button
                type="button"
                onClick={() => handleStatusChange('In Progress')}
                className="px-3.5 py-2 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reopen</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-fadeIn ${
              feedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#95C623]" />
              <span>{feedback.msg}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Message Content, Internal Notes, Reply Composer & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Message Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Original Customer Message
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(messageItem.submissionDate)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  {messageItem.subject}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                  {messageItem.message}
                </p>
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Internal Support Notes
                  </h3>
                </div>

                {!isEditingNotes ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-[#103321] cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#95C623] hover:text-[#103321] cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={adminNotesText}
                    onChange={(e) => setAdminNotesText(e.target.value)}
                    placeholder="Add operational notes about customer inquiry, phone follow-ups..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#95C623] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 font-bold hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-4 py-1.5 bg-[#103321] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Commit Note
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-700 bg-gray-50 p-3.5 rounded-2xl italic leading-relaxed">
                  {messageItem.adminNotes || 'No internal support notes recorded for this inquiry.'}
                </p>
              )}
            </div>

            {/* Reply Composer */}
            <ReplyComposer
              recipientEmail={messageItem.email}
              defaultSubject={messageItem.subject}
              onSaveReply={handleSaveReply}
            />

            {/* Thread of Drafted Replies */}
            {messageItem.replies && messageItem.replies.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Send className="w-4 h-4 text-[#103321]" />
                  <h3 className="font-serif font-bold text-base text-[#103321]">
                    Drafted Customer Responses ({messageItem.replies.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {messageItem.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">
                          {rep.subject}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(rep.draftedAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {rep.message}
                      </p>
                      <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-200">
                        Drafted by <span className="font-semibold text-gray-600">{rep.draftedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column (1 col): Sender Profile & Inquiry Details */}
          <div className="space-y-6">
            {/* Sender Contact Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Sender Details
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Full Name
                  </span>
                  <span className="font-bold text-gray-900 text-sm">
                    {messageItem.senderName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="text-gray-800 break-all font-medium">
                    {messageItem.email}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Phone Number
                  </span>
                  <span className="text-gray-800 font-mono font-medium">
                    {messageItem.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Management Specs */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-[#103321]" />
                <h3 className="font-serif font-bold text-sm text-[#103321]">
                  Inquiry Metadata
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <AdminStatusBadge status={messageItem.status} type="message" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Assigned Staff</span>
                  <span className="font-medium text-gray-900">
                    {messageItem.assignedTo || 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Submitted</span>
                  <span className="font-medium text-gray-700">
                    {formatDate(messageItem.submissionDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Draft Responses</span>
                  <span className="font-bold text-[#103321]">
                    {messageItem.replies?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
