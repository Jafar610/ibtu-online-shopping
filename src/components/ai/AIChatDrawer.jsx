import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  X,
  Minus,
  Send,
  ShoppingBag,
  Bot,
  User,
} from 'lucide-react'
import { products } from '../../data/products'
import { useCart } from '../../context/CartContext'

export default function AIChatDrawer({ isOpen, onClose, onQuickView }) {
  const { addToCart } = useCart()
  const counterRef = useRef(100)
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Selam! I'm your ibtu Fashion Advisor & AI Stylist. 🌿 How can I help you discover authentic Ethiopian fashion today?",
      suggestions: [
        'Help me choose an outfit.',
        'What sizes are available?',
        'Recommend Habesha clothing.',
        'Find products under 2000 ETB.',
      ],
      products: [],
      timestamp: 'Just now',
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized])

  if (!isOpen) return null

  const handleSendMessage = (textToSend) => {
    const userText = textToSend || inputValue.trim()
    if (!userText) return

    counterRef.current += 1
    const newMsg = {
      id: `msg-${counterRef.current}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, newMsg])
    if (!textToSend) setInputValue('')
    setIsTyping(true)

    // Simulate intelligent AI Assistant response
    setTimeout(() => {
      let replyText
      let matchingProducts = []
      let newSuggestions

      const query = userText.toLowerCase()

      if (query.includes('outfit') || query.includes('wedding') || query.includes('event')) {
        replyText =
          'For formal Ethiopian weddings and special celebrations, I highly recommend our handwoven Royal Gondar Habesha Kemis or the Sheba Emerald Gown. For men, our tailored Tibeb Suit or embroidered Linen Shirt is the ideal cultural pairing!'
        matchingProducts = products.filter(
          (p) => p.id === 'prod-1' || p.id === 'prod-3' || p.id === 'prod-7'
        )
        newSuggestions = ['Recommend Habesha clothing.', 'Find products under 2000 ETB.']
      } else if (query.includes('size') || query.includes('fit') || query.includes('measurement')) {
        replyText =
          'We cater to sizes S, M, L, XL, and XXL. We also offer bespoke Custom Tailored Fits! You can share your height and bust/chest measurements, and our master Ethiopian tailors will weave it to your exact specifications.'
        newSuggestions = ['Help me choose an outfit.', 'Recommend Habesha clothing.']
      } else if (query.includes('habesha') || query.includes('kemis') || query.includes('dress')) {
        replyText =
          'Here are our standout Habesha dresses! Each piece is spun with pure Ethiopian Menen cotton and finished with exquisite heritage Tibeb borders.'
        matchingProducts = products.filter((p) => p.category === 'habesha-kemis')
        newSuggestions = ['What sizes are available?', 'Find products under 2000 ETB.']
      } else if (query.includes('2000') || query.includes('under') || query.includes('budget') || query.includes('cheap') || query.includes('price')) {
        replyText =
          'Looking for high style at accessible prices? Here are authentic Ethiopian pieces under 2,000 ETB, including our signature handwoven Netela shawl and Lalibela brass cross necklace:'
        matchingProducts = products.filter((p) => p.price <= 2000)
        newSuggestions = ['Help me choose an outfit.', 'What sizes are available?']
      } else {
        replyText =
          `I'd love to help you with "${userText}"! At ibtu, we handcraft premium Habesha Kemis, men's cultural suits, artisan shawls, and jewelry. Here are some of our top rated items:`
        matchingProducts = products.slice(0, 2)
        newSuggestions = [
          'Help me choose an outfit.',
          'Recommend Habesha clothing.',
          'Find products under 2000 ETB.',
        ]
      }

      counterRef.current += 1
      const aiResponse = {
        id: `msg-${counterRef.current}`,
        sender: 'ai',
        text: replyText,
        products: matchingProducts,
        suggestions: newSuggestions,
        timestamp: 'Just now',
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 700)
  }

  // Minimized state view
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-[#103321] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#95C623]/30 hover:border-[#95C623] cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#95C623]" />
          <span className="text-xs font-bold">ibtu AI Assistant (Minimized)</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex items-end justify-end">
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 sm:hidden"
        onClick={onClose}
      />

      {/* Assistant Window */}
      <div className="relative w-full sm:w-[420px] h-[90vh] sm:h-[620px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="bg-[#103321] text-white p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#95C623] text-[#103321] flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-sm">ibtu AI Stylist</h3>
                <span className="w-2 h-2 rounded-full bg-[#95C623] animate-pulse" />
              </div>
              <p className="text-[11px] text-[#95C623]">Ethiopian Fashion Advisor • Online</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Minimize chat"
              title="Minimize"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close chat"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F9FA]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-[#103321] text-white'
                      : 'bg-[#95C623] text-[#103321]'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#103321] text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>

              {/* Product recommendations if provided */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-2.5 w-full pl-9 space-y-2">
                  <span className="text-[11px] font-bold text-[#103321] uppercase tracking-wider block">
                    Recommended Pieces:
                  </span>
                  <div className="space-y-2">
                    {msg.products.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-between gap-3 shadow-xs hover:border-[#95C623] transition-colors"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-14 object-cover rounded-lg shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#103321] truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-500">{p.amharicName}</p>
                          <span className="text-xs font-bold text-[#95C623]">
                            {p.price.toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => {
                              if (onQuickView) onQuickView(p)
                            }}
                            className="text-[10px] bg-gray-100 hover:bg-[#103321] hover:text-white px-2 py-1 rounded-md font-medium transition-colors cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="text-[10px] bg-[#95C623] text-[#103321] hover:bg-[#82ad1e] px-2 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ShoppingBag className="w-2.5 h-2.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions chips */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2 pl-9 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-[11px] bg-white border border-[#95C623]/40 hover:border-[#95C623] hover:bg-[#95C623]/10 text-[#103321] px-2.5 py-1 rounded-full transition-all cursor-pointer font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 pl-2">
              <div className="w-7 h-7 rounded-full bg-[#95C623] text-[#103321] flex items-center justify-center font-bold">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#103321] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#95C623] rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-[#103321] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for fashion advice, sizes, or prices..."
              className="flex-1 bg-gray-50 border border-gray-200 text-xs sm:text-sm px-4 py-2.5 rounded-full focus:outline-none focus:border-[#103321] transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-full bg-[#103321] text-[#95C623] hover:bg-[#16462c] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 px-2">
            <span>Powered by ibtu Fashion Intelligence</span>
            <span className="text-[#95C623] font-medium">Gemini Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
