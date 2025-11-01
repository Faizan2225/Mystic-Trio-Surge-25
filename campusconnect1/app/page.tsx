"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { ArrowRight, Briefcase, Users, MessageSquare, Target } from "lucide-react"

export default function Home() {
  const [user] = useAuthState(auth)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
              Connect Skills with Opportunities
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
              CampusConnect is the intelligent platform connecting students and employers through AI-powered matching
              and real-time collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-light text-white font-semibold hover:bg-primary-dark transition"
                  >
                    Get Started <ArrowRight className="ml-2" size={20} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border text-gray-900 font-semibold hover:bg-surface transition"
                  >
                    Sign In
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-light text-white font-semibold hover:bg-primary-dark transition"
                >
                  Go to Dashboard <ArrowRight className="ml-2" size={20} />
                </Link>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Briefcase className="text-primary-light" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse Jobs</h3>
              <p className="text-gray-600">Discover tailored job and internship opportunities matching your skills.</p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Target className="text-primary-light" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Get match scores showing compatibility between your skills and job requirements.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <MessageSquare className="text-primary-light" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-time Chat</h3>
              <p className="text-gray-600">Communicate instantly with employers to discuss opportunities in detail.</p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-border hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <Users className="text-primary-light" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Manage Talent</h3>
              <p className="text-gray-600">For employers: track applications and build your ideal team.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-light text-white py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your next opportunity?</h2>
            <p className="text-lg mb-8 text-blue-100">Join hundreds of students and employers on CampusConnect</p>
            {!user && (
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3 rounded-lg bg-white text-primary-light font-semibold hover:bg-gray-100 transition"
              >
                Sign Up Now
              </Link>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
