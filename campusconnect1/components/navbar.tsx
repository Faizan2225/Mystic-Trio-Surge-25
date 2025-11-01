"use client"

import Link from "next/link"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [user] = useAuthState(auth)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await auth.signOut()
  }

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-white font-bold">
              CC
            </div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              CampusConnect
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/jobs" className="text-gray-600 hover:text-primary-light transition">
              Jobs
            </Link>
            {user && (
              <>
                <Link href="/chat" className="text-gray-600 hover:text-primary-light transition">
                  Chat
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-primary-light transition">
                  Profile
                </Link>
                <Link href="/dashboard" className="text-gray-600 hover:text-primary-light transition">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-primary-light text-white hover:bg-primary-dark transition"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link href="/login" className="px-4 py-2 text-primary-light hover:bg-gray-100 rounded-lg transition">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-primary-light text-white hover:bg-primary-dark transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/jobs" className="block px-4 py-2 text-gray-600 hover:bg-surface rounded">
              Jobs
            </Link>
            {user && (
              <>
                <Link href="/chat" className="block px-4 py-2 text-gray-600 hover:bg-surface rounded">
                  Chat
                </Link>
                <Link href="/profile" className="block px-4 py-2 text-gray-600 hover:bg-surface rounded">
                  Profile
                </Link>
                <Link href="/dashboard" className="block px-4 py-2 text-gray-600 hover:bg-surface rounded">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg bg-primary-light text-white hover:bg-primary-dark transition"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link href="/login" className="block px-4 py-2 text-gray-600 hover:bg-surface rounded">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 rounded-lg bg-primary-light text-white hover:bg-primary-dark transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
