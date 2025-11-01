"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { collection, query, getDocs, where } from "firebase/firestore"
import type { User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { ChatWindow } from "@/components/chat-window"
import { MessageCircle, Users } from "lucide-react"

interface ChatUser extends User {
  lastMessageTime?: Date
}

function ChatContent() {
  const [user] = useAuthState(auth)
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        if (!user) return

        // Get all users (to display as potential chat contacts)
        const usersQuery = query(collection(db, "users"), where("uid", "!=", user.uid))
        const usersSnap = await getDocs(usersQuery)

        const users: ChatUser[] = []
        for (const userDoc of usersSnap.docs) {
          const userData = userDoc.data() as User
          users.push(userData)
        }

        setChatUsers(users)
      } catch (error) {
        console.error("Error fetching chat users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatUsers()
  }, [user])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading chats...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Connect and communicate with employers and candidates</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-gray-50">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={20} />
                  Contacts
                </h2>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {chatUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-600">
                    <MessageCircle className="mx-auto w-8 h-8 text-gray-300 mb-2" />
                    <p>No contacts yet</p>
                  </div>
                ) : (
                  chatUsers.map((contact) => (
                    <button
                      key={contact.uid}
                      onClick={() => setSelectedUser(contact)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition ${
                        selectedUser?.uid === contact.uid ? "bg-blue-50 border-l-4 border-l-primary-light" : ""
                      }`}
                    >
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.role === "finder" ? "Recruiter" : "Candidate"}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {selectedUser ? (
              <ChatWindow otherUserId={selectedUser.uid} otherUserName={selectedUser.name} />
            ) : (
              <div className="bg-white rounded-lg border border-border p-12 text-center">
                <MessageCircle className="mx-auto w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a contact to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContent />
    </AuthGuard>
  )
}
