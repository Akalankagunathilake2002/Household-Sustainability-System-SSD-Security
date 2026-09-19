import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi! I am your sustainability expert. Tell me about your household situation, and I will give you practical recommendations.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: 'Hi! I am your sustainability expert. Tell me about your household situation, and I will give you practical recommendations.',
      },
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.post('/gemini/generate', { text: userMessage.text });
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.recommendations || "I couldn't generate a recommendation right now.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching recommendations: ", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, there was an error processing your request. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-green-100"
          >
            <div className="shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex justify-between items-center text-white shadow-md z-10">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={isLoading ? { rotate: 360 } : { y: [0, -2, 0] }}
                  transition={isLoading ? { repeat: Infinity, duration: 2, ease: "linear" } : { repeat: Infinity, duration: 3 }}
                >
                  <Bot className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-lg">EcoAssistant</h3>
                  <p className="text-xs text-green-100">AI Sustainability Expert</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-green-100' : 'bg-emerald-100'}`}>
                      {msg.sender === 'user' ? <User className="w-5 h-5 text-green-700" /> : <Bot className="w-5 h-5 text-emerald-700" />}
                    </div>
                    <div
                      className={`p-4 rounded-2xl shadow-sm text-sm ${
                        msg.sender === 'user'
                          ? 'bg-green-500 text-white rounded-tr-sm whitespace-pre-wrap'
                          : 'bg-white border border-emerald-100 text-gray-800 rounded-tl-sm shadow-emerald-100/20'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        msg.text
                      ) : (
                        <div className="markdown-content">
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-emerald-800" {...props} />,
                              em: ({ node, ...props }) => <em className="italic text-emerald-700" {...props} />,
                              h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-emerald-900 mb-2 mt-1" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-md font-bold text-emerald-800 mb-1 mt-1" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-emerald-800 mb-1 mt-1" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                              li: ({ node, ...props }) => (
                                <li className="pl-1">
                                  <span className="text-emerald-600 mr-1 opacity-0">•</span>
                                  {props.children}
                                </li>
                              ),
                              code: ({ node, inline, ...props }) => (
                                <code
                                  className={`${
                                    inline ? 'bg-emerald-50 px-1 rounded' : 'block bg-gray-800 text-gray-100 p-2 rounded-lg my-2 overflow-x-auto'
                                  } text-xs font-mono`}
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex space-x-2 max-w-[80%] flex-row">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white border border-gray-100 rounded-tl-sm flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-4 bg-white border-t border-gray-100 z-10">
              <form onSubmit={handleSend} className="flex relative items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about sustainability..."
                  className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all shadow-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 bg-green-400 rounded-full blur-xl z-[-1]"
            />
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          animate={!isOpen ? { y: [0, -8, 0] } : {}}
          transition={!isOpen ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {}}
          onClick={toggleChat}
          className={`${
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white p-4 rounded-full shadow-2xl transition-colors focus:outline-none flex items-center justify-center relative z-10`}
          title="AI Sustainability Assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 5, repeatDelay: 2 }}
                >
                  <Bot className="w-6 h-6" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
};

export default Chatbot;
