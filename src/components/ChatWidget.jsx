"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, X, MessageSquare, Maximize2, Trash2, Camera } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize sessionId
  useEffect(() => {
    if (typeof window !== "undefined") {
      let storedSessionId = localStorage.getItem("pharmacy_chat_session");
      if (!storedSessionId) {
        storedSessionId = "session_" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("pharmacy_chat_session", storedSessionId);
      }
      setSessionId(storedSessionId);
      if (isOpen) {
        loadHistory(storedSessionId);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  const loadHistory = async (sid) => {
    try {
      const res = await fetch(`/api/chat/history?sessionId=${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Load the most recent chat session
          const latestChatId = data[0].id;
          const chatRes = await fetch(`/api/chat/history?sessionId=${sid}&chatId=${latestChatId}`);
          if (chatRes.ok) {
            const chatData = await chatRes.json();
            setMessages(chatData.messages.map(m => ({ role: m.role, content: m.content, image: m.image })));
            return; // Exit here, loaded from DB successfully
          }
        }
      }
    } catch (error) {
      console.error("Failed to load history from DB", error);
    }

    // Fallback: If DB is empty (guest) or fetch failed, load from local storage
    const localHistory = localStorage.getItem("pharmacy_chat_history");
    if (localHistory) {
      try {
        setMessages(JSON.parse(localHistory));
      } catch (e) {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  // Save messages to local storage for guests
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem("pharmacy_chat_history", JSON.stringify(messages));
      } catch (e) {
        console.warn("localStorage quota exceeded (likely due to image size), stripping images...");
        const safeMessages = messages.map(m => ({ ...m, image: null }));
        localStorage.setItem("pharmacy_chat_history", JSON.stringify(safeMessages));
      }
    }
  }, [messages]);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      if (!window.pdfjsLib) {
        alert("PDF reader is still loading. Please try again in a moment.");
        return;
      }
      try {
        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        
        const fileReader = new FileReader();
        fileReader.onload = async function() {
          try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const page = await pdf.getPage(1);
            
            const scale = 2.0;
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const base64Img = canvas.toDataURL("image/jpeg", 0.9);
            setSelectedImage(base64Img);
          } catch (err) {
            console.error("PDF extraction error", err);
            alert("Failed to extract image from PDF.");
          }
        };
        fileReader.readAsArrayBuffer(file);
      } catch (err) {
        console.error("PDF processing error", err);
      }
      return;
    }

    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|heic|bmp)$/i.test(file.name);
    if (isImage) {
      // Force conversion of ALL images via Canvas to ensure valid JPEG encoding
      // This prevents errors where files have fake extensions (e.g. .heic renamed to .jpg)
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Optional: Scale down if the image is too large (e.g., > 2000px)
        let width = img.width;
        let height = img.height;
        const maxDimension = 2000;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as guaranteed valid JPEG
        const base64Img = canvas.toDataURL("image/jpeg", 0.85);
        setSelectedImage(base64Img);
        URL.revokeObjectURL(objUrl);
      };
      img.onerror = () => {
        alert("Unsupported or corrupted image format. Could not load the image.");
        URL.revokeObjectURL(objUrl);
      };
      img.src = objUrl;
      return;
    }

    alert("Unsupported file type. Please upload an image or a PDF.");
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (e, text = input) => {
    if (e) e.preventDefault();
    if ((!text.trim() && !selectedImage) || isLoading) return;

    const userMessage = { role: "user", content: text, image: selectedImage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    setIsLoading(true);

    try {
      setMessages([...newMessages, { role: "assistant", content: "", isTyping: true }]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: sessionId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "API response error");
      }

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.content }]);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { role: "assistant", content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    // Legacy function, using confirmClearChat instead
  };

  const confirmClearChat = () => {
    const newSessionId = "session_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("pharmacy_chat_session", newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setIsClearModalOpen(false);
  };

  const suggestions = [
    "Available painkillers?",
    "আমার জ্বর, কি ওষুধ আছে?"
  ];

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js" strategy="lazyOnload" />
      
      {/* Full Screen Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={previewImage} 
            alt="Full screen preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      {/* Widget Container */}
      <div className={`fixed bottom-6 right-6 z-[60] flex flex-col items-end transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-10 opacity-0 invisible'}`}>
        <div className="bg-white w-[350px] max-w-[calc(100vw-3rem)] sm:w-[380px] h-[550px] max-h-[calc(100vh-6rem)] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 transform transition-all duration-300 relative">
          
          {/* Clear Chat Modal Overlay */}
          {isClearModalOpen && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Trash2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Clear Chat History?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this conversation? This action cannot be undone.</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setIsClearModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmClearChat}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-sm"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-medical-blue-600 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Pharmacy Assistant</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button 
                  onClick={() => setIsClearModalOpen(true)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 size={18} />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Bot size={32} />
                </div>
                <div className="space-y-1 px-4">
                  <h4 className="text-lg font-bold text-slate-800">Hi there! 👋</h4>
                  <p className="text-sm text-slate-500">I can check medicine availability and prices.</p>
                </div>
                
                <div className="w-full space-y-2">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(null, sug)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-400 hover:shadow-sm transition-all text-slate-700 text-sm"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                        <Bot size={14} />
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      msg.role === "user" 
                        ? "bg-medical-blue-600 text-white rounded-br-none" 
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                    }`}>
                      {msg.isTyping ? (
                         <div className="flex gap-1 items-center h-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                         </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed break-words [word-break:break-word]">
                          {msg.image && (
                            <img 
                              src={msg.image} 
                              alt="Uploaded" 
                              onClick={() => setPreviewImage(msg.image)}
                              className="max-w-full rounded-lg mb-2 border border-white/20 cursor-zoom-in hover:opacity-90 transition-opacity" 
                            />
                          )}
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            {selectedImage && (
              <div className="relative inline-block mb-3">
                <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <form onSubmit={sendMessage} className="relative flex items-center gap-2">
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                capture="environment"
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2.5 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-medical-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="Upload Prescription"
              >
                <Camera size={20} />
              </button>
              
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask or upload prescription..."
                  disabled={isLoading}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={(!input.trim() && !selectedImage) || isLoading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-medical-blue-600 text-white rounded-lg hover:bg-medical-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Always Visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[50] w-14 h-14 bg-medical-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
      >
        <MessageSquare size={28} />
      </button>
    </>
  );
}
