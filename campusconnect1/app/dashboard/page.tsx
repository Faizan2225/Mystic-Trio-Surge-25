"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import type { User, Job, Application } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { Briefcase, Users, BarChart3, MessageSquare, TrendingUp, Clock } from "lucide-react"

function DashboardContent() {
  const [user] = useAuthState(auth)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    totalViews: 0,
    pendingApplications: 0,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        try {
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)

          if (userSnap.exists()) {
            const profile = userSnap.data() as User
            setUserProfile(profile)

            if (profile.role === "finder") {
              // Finder stats
              const jobsQuery = query(collection(db, "jobs"), where("creatorId", "==", user.uid))
              const jobsSnap = await getDocs(jobsQuery)
              const jobsList = jobsSnap.docs.map((d) => d.data()) as Job[]

              let totalViews = 0
              jobsList.forEach((job) => {
                totalViews += job.views || 0
              })

              const applicationsQuery = query(
                collection(db, "applications"),
                where("jobId", "in", jobsSnap.docs.map((d) => d.id) || [""]),
              )
              const applicationsSnap = await getDocs(applicationsQuery)
              const pendingApps = applicationsSnap.docs.filter(
                (d) => (d.data() as Application).status === "pending",
              ).length

              setStats({
                jobs: jobsList.length,
                applications: applicationsSnap.docs.length,
                totalViews,
                pendingApplications: pendingApps,
              })
            } else {
              // Seeker stats
              const applicationsQuery = query(collection(db, "applications"), where("applicantId", "==", user.uid))
              const applicationsSnap = await getDocs(applicationsQuery)
              const pendingApps = applicationsSnap.docs.filter(
                (d) => (d.data() as Application).status === "pending",
              ).length

              setStats({
                jobs: 0,
                applications: applicationsSnap.docs.length,
                totalViews: 0,
                pendingApplications: pendingApps,
              })
            }
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </main>
      </>
    )
  }

  const isFinder = userProfile?.role === "finder"

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {userProfile?.name}!</h1>
          <p className="text-lg text-gray-600">
            {isFinder ? "Manage your opportunities and build your team" : "Discover and apply to great opportunities"}
          </p>
        </div>

        {/* Quick Actions */}
        {!userProfile?.skills || userProfile.skills.length === 0 ? (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg flex items-start justify-between">
            <div>
              <p className="text-blue-900 font-semibold mb-2">Complete your profile to get started</p>
              <p className="text-blue-800 text-sm">Add your skills to unlock smart matching and better opportunities</p>
            </div>
            <Link
              href="/profile"
              className="px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition whitespace-nowrap"
            >
              Complete Profile
            </Link>
          </div>
        ) : null}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {isFinder ? (
            <>
              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Briefcase className="text-primary-light" size={24} />
                  </div>
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Posted Opportunities</p>
                <p className="text-3xl font-bold text-gray-900">{stats.jobs}</p>
                <Link href="/jobs/create" className="text-primary-light text-sm font-semibold mt-3 hover:underline">
                  Post new →
                </Link>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="text-primary-light" size={24} />
                  </div>
                  <Clock className="text-orange-600" size={20} />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Pending Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
                <Link
                  href="/dashboard/applications"
                  className="text-primary-light text-sm font-semibold mt-3 hover:underline"
                >
                  Review →
                </Link>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="text-primary-light" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
                <Link
                  href="/dashboard/applications"
                  className="text-primary-light text-sm font-semibold mt-3 hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="text-primary-light" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
                <p className="text-primary-light text-sm font-semibold mt-3">All opportunities</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Briefcase className="text-primary-light" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Applications Sent</p>
                <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
                <Link
                  href="/dashboard/applications"
                  className="text-primary-light text-sm font-semibold mt-3 hover:underline"
                >
                  Track status →
                </Link>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Clock className="text-primary-light" size={24} />
                  </div>
                  <Clock className="text-orange-600" size={20} />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
                <p className="text-gray-500 text-sm mt-3">Waiting for response</p>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="text-primary-light" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Skills on Profile</p>
                <p className="text-3xl font-bold text-gray-900">{userProfile?.skills?.length || 0}</p>
                <Link href="/profile" className="text-primary-light text-sm font-semibold mt-3 hover:underline">
                  Update skills →
                </Link>
              </div>

              <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Briefcase className="text-primary-light" size={24} />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Smart Matches</p>
                <p className="text-3xl font-bold text-gray-900">→</p>
                <Link
                  href="/dashboard/matches"
                  className="text-primary-light text-sm font-semibold mt-3 hover:underline"
                >
                  View matches →
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Quick Links Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              {isFinder ? (
                <Briefcase className="text-primary-light" size={32} />
              ) : (
                <Briefcase className="text-primary-light" size={32} />
              )}
              <h3 className="text-xl font-semibold text-gray-900">
                {isFinder ? "Post a New Opportunity" : "Browse More Jobs"}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {isFinder
                ? "Share a new internship, project, or job with talented candidates"
                : "Explore all available opportunities and find your perfect match"}
            </p>
            <Link
              href={isFinder ? "/jobs/create" : "/jobs"}
              className="inline-flex px-6 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition font-semibold"
            >
              {isFinder ? "Post Opportunity" : "Browse Jobs"}
            </Link>
          </div>

          <div className="p-8 bg-gradient-to-br from-green-50 to-white rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="text-green-600" size={32} />
              <h3 className="text-xl font-semibold text-gray-900">Connect & Chat</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {isFinder
                ? "Message candidates and discuss opportunities directly"
                : "Chat with recruiters and ask questions about opportunities"}
            </p>
            <Link
              href="/chat"
              className="inline-flex px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Start Messaging
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
