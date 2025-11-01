"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { ChatWindow } from "@/components/chat-window"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

function ChatDetailContent({ userId }: { userId: string }) {
  const [user] = useAuthState(auth)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = doc(db, "users", userId)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setOtherUser(userSnap.data() as User)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!otherUser) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-gray-600 mb-4">User not found</p>
          <Link href="/chat" className="text-primary-light font-semibold hover:underline">
            Back to chats
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 text-primary-light font-semibold mb-6 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to messages
        </Link>

        <ChatWindow otherUserId={otherUser.uid} otherUserName={otherUser.name} />
      </main>
    </>
  )
}

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <ChatDetailContent userId={params.id} />
    </AuthGuard>
  )
}
