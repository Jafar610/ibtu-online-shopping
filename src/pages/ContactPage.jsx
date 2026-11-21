import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Info,
  RotateCcw,
} from 'lucide-react'
import AnnouncementBar from '../components/layout/AnnouncementBar'
import Navbar from '../components/layout/Navbar'
import MobileMenu from '../components/layout/MobileMenu'
import SearchOverlay from '../components/layout/SearchOverlay'
import Footer from '../components/layout/Footer'
import CartDrawer from '../components/cart/CartDrawer'
import QuickViewModal from '../components/product/QuickViewModal'

export default function ContactPage() {
  const [currentLang, setCurrentLang] = useState('EN')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  // Validation & Submission States
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const validate = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    } else if (formData.message.length > 500) {
      newErrors.message = 'Message cannot exceed 500 characters'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'message' && value.length > 500) return
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear field-specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (submitError) setSubmitError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)
    setSubmitError(null)

    // Simulate mock submission delay and persist to admin contact messages
    setTimeout(() => {
      try {
        const raw = localStorage.getItem('ibtu_admin_contact_messages')
        const existing = raw ? JSON.parse(raw) : []
        const newMsg = {
          id: `MSG-2026-${String(existing.length + 1).padStart(3, '0')}`,
          senderName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          submissionDate: new Date().toISOString(),
          status: 'New',
          assignedTo: 'Admin Support',
          adminNotes: 'Submitted via public Contact Us form.',
          replies: [],
        }
        localStorage.setItem(
          'ibtu_admin_contact_messages',
          JSON.stringify([newMsg, ...existing])
        )
      } catch {
        // ignore
      }

      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 700)
  }

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    })
    setErrors({})
    setIsSubmitted(false)
    setSubmitError(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A]">
      {/* 1. Announcement Bar */}
      <AnnouncementBar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* SECTION A: Contact Hero */}
        <section className="relative bg-[#103321] text-white py-16 sm:py-20 overflow-hidden">
          {/* Subtle Tibeb Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-tibeb-pattern pointer-events-none" />

          {/* Decorative Glow Elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#95C623]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#95C623]/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-[#95C623]/30 backdrop-blur-xs mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#95C623]" />
              <span className="text-xs uppercase tracking-widest text-[#95C623] font-bold">
                እኛን ያግኙን • We are here to help
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Get in Touch With Us
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              We would love to hear from you. Contact us if you have questions about our products, orders, or shopping experience.
            </p>
          </div>
        </section>

        {/* SECTION B & C: Contact Information & Contact Form */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* SECTION B: Contact Information Cards (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#95C623] uppercase tracking-wider block mb-1">
                    Direct Assistance
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#103321]">
                    Customer & Artisan Support
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                    Whether you are inquiring about a custom Tibeb dress size, order tracking, or artisan partnerships, reach out directly.
                  </p>
                </div>

                {/* Info Cards Grid */}
                <div className="space-y-4">
                  {/* Location Card */}
                  <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:border-[#95C623]/50 hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                        Our Location
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">
                        Bole Sub-City, Atlas Road
                      </p>
                      <p className="text-xs text-gray-600">
                        Addis Ababa, Ethiopia
                      </p>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:border-[#95C623]/50 hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                        Phone & WhatsApp
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">
                        +251 911 234 567
                      </p>
                      <p className="text-xs text-gray-600">
                        +251 116 789 012
                      </p>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:border-[#95C623]/50 hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                        Email Inquiries
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">
                        support@ibtu.com
                      </p>
                      <p className="text-xs text-gray-600">
                        Average response time: within 24 hours
                      </p>
                    </div>
                  </div>

                  {/* Hours Card */}
                  <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:border-[#95C623]/50 hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-[#103321] text-[#95C623] flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                        Operating Hours
                      </h3>
                      <p className="text-sm font-semibold text-gray-900">
                        Monday – Saturday: 9:00 AM – 7:00 PM
                      </p>
                      <p className="text-xs text-gray-600">
                        Sunday: Closed (Online Orders Active 24/7)
                      </p>
                    </div>
                  </div>
                </div>

                {/* SECTION D: Social Media Links */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">
                    Connect With Us Online
                  </h3>
                  <div className="flex items-center gap-3">
                    {/* Instagram */}
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      aria-label="Instagram"
                    >
                      <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                    </a>

                    {/* Facebook */}
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      aria-label="Facebook"
                    >
                      <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    </a>

                    {/* Telegram */}
                    <a
                      href="https://t.me"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      aria-label="Telegram"
                    >
                      <Send className="w-4 h-4" />
                    </a>

                    {/* YouTube */}
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      aria-label="YouTube"
                    >
                      <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* SECTION C: Contact Form (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-gray-100">
                <div className="mb-6">
                  <h3 className="font-serif text-2xl font-bold text-[#103321]">
                    Send Us a Message
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Fill out the form below. We typically respond within one business day.
                  </p>
                </div>

                {/* Success Feedback Banner */}
                {isSubmitted ? (
                  <div className="p-6 bg-[#103321]/5 border border-[#95C623] rounded-2xl text-center space-y-4 animate-fadeIn">
                    <div className="w-14 h-14 bg-[#95C623]/20 text-[#103321] rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-[#103321]" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-bold text-[#103321]">
                        Message Received!
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 mt-1.5 max-w-md mx-auto">
                        Thank you, <span className="font-semibold text-[#103321]">{formData.fullName}</span>. Your message regarding &ldquo;{formData.subject}&rdquo; has been received (Mock Submission). Our team will review your message promptly.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] text-xs font-bold transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Send Another Message</span>
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* General Error Banner if needed */}
                    {submitError && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Row 1: Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Abebe Bikila"
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                            errors.fullName
                              ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                              : 'border-gray-200 focus:border-[#95C623] focus:ring-[#95C623]/20 bg-[#F8F9FA]'
                          }`}
                        />
                        {errors.fullName && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.fullName}</span>
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="abebe@example.com"
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                            errors.email
                              ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                              : 'border-gray-200 focus:border-[#95C623] focus:ring-[#95C623]/20 bg-[#F8F9FA]'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Phone Number & Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone Number (Optional) */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                        >
                          Phone Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+251 9XX XXX XXX"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#95C623] focus:ring-2 focus:ring-[#95C623]/20 bg-[#F8F9FA] text-sm transition-all focus:outline-none"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5"
                        >
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="subject"
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="e.g. Order Inquiry / Sizing"
                          className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                            errors.subject
                              ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                              : 'border-gray-200 focus:border-[#95C623] focus:ring-[#95C623]/20 bg-[#F8F9FA]'
                          }`}
                        />
                        {errors.subject && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.subject}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message Area */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="message"
                          className="block text-xs font-bold text-gray-700 uppercase tracking-wider"
                        >
                          Your Message <span className="text-red-500">*</span>
                        </label>
                        <span className={`text-[10px] font-mono ${formData.message.length >= 480 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                          {formData.message.length} / 500 characters
                        </span>
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your questions, feedback, or custom order inquiries here..."
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
                          errors.message
                            ? 'border-red-400 focus:ring-red-200 bg-red-50/20'
                            : 'border-gray-200 focus:border-[#95C623] focus:ring-[#95C623]/20 bg-[#F8F9FA]'
                        }`}
                      />
                      {errors.message && (
                        <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-xl bg-[#103321] text-white hover:bg-[#95C623] hover:text-[#103321] font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION E: Additional Navigation */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#103321]">
                Explore More of IBTU
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Continue browsing our cultural collections or discover the artisan story behind our heritage fashion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/"
                className="p-5 rounded-2xl bg-[#F8F9FA] hover:bg-[#103321] text-[#103321] hover:text-white transition-all group flex items-center justify-between border border-gray-200"
              >
                <div>
                  <h4 className="font-bold text-sm group-hover:text-[#95C623] transition-colors">
                    Home Page
                  </h4>
                  <p className="text-xs text-gray-500 group-hover:text-white/70">
                    Featured styles & arrivals
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/shop"
                className="p-5 rounded-2xl bg-[#F8F9FA] hover:bg-[#103321] text-[#103321] hover:text-white transition-all group flex items-center justify-between border border-gray-200"
              >
                <div>
                  <h4 className="font-bold text-sm group-hover:text-[#95C623] transition-colors">
                    Shop Collections
                  </h4>
                  <p className="text-xs text-gray-500 group-hover:text-white/70">
                    All dresses, habesha kemis & shirts
                  </p>
                </div>
                <ShoppingBag className="w-4 h-4 text-gray-400 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/about"
                className="p-5 rounded-2xl bg-[#F8F9FA] hover:bg-[#103321] text-[#103321] hover:text-white transition-all group flex items-center justify-between border border-gray-200"
              >
                <div>
                  <h4 className="font-bold text-sm group-hover:text-[#95C623] transition-colors">
                    About Our Story
                  </h4>
                  <p className="text-xs text-gray-500 group-hover:text-white/70">
                    Artisans, heritage & mission
                  </p>
                </div>
                <Info className="w-4 h-4 text-gray-400 group-hover:text-[#95C623] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* Floating Drawers & Overlays */}
      <CartDrawer />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onQuickView={(p) => setQuickViewProduct(p)}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
