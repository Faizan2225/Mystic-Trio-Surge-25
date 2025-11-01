"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, type Timestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import type { ChatMessage as ChatMessageType } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { generateChatId } from "@/lib/chat-utils"
import { Send, Loader } from "lucide-react"

interface ChatWindowProps {
  otherUserId: string
  otherUserName: string
}

export function ChatWindow({ otherUserId, otherUserName }: ChatWindowProps) {
  const [user] = useAuthState(auth)
  const [messages, setMessages] = useState<(ChatMessageType & { id: string })[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatId = user ? generateChatId(user.uid, otherUserId) : ""

  useEffect(() => {
    if (!chatId) return

    const messagesRef = collection(db, "chats", chatId, "messages")
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (ChatMessageType & { id: string })[]

      setMessages(newMessages)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [chatId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user || !chatId) return

    setSending(true)

    try {
      const messagesRef = collection(db, "chats", chatId, "messages")
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: user.uid,
        timestamp: serverTimestamp(),
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-primary-light" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-[600px] bg-white rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gray-50">
        <h2 className="font-semibold text-gray-900">{otherUserName}</h2>
        <p className="text-xs text-gray-500">Online</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === user?.uid ? "bg-primary-light text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.senderId === user?.uid ? "text-blue-100" : "text-gray-500"}`}>
                  {formatDate((msg.timestamp as Timestamp)?.toDate())}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-gray-50 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="p-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}
