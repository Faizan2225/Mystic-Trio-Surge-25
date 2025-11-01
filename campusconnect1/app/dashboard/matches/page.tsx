"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore"
import type { Job, User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { JobCard } from "@/components/job-card"
import { MatchScoreBadge } from "@/components/match-score-badge"
import { calculateMatch } from "@/lib/utils"
import Link from "next/link"
import { Zap, Filter } from "lucide-react"

function MatchesContent() {
  const [user] = useAuthState(auth)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [jobs, setJobs] = useState<(Job & { matchScore: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"score" | "recent">("score")

  useEffect(() => {
    const fetchMatchedJobs = async () => {
      try {
        if (!user) return

        // Fetch user profile
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const profile = userSnap.data() as User
          setUserProfile(profile)

          // Fetch all jobs
          const jobsQuery = query(collection(db, "jobs"))
          const jobsSnap = await getDocs(jobsQuery)
          const jobsList: (Job & { matchScore: number })[] = []

          for (const jobDoc of jobsSnap.docs) {
            const job = jobDoc.data() as Job
            const score = calculateMatch(profile.skills, job.tags)

            jobsList.push({
              ...job,
              id: jobDoc.id,
              matchScore: score,
            })
          }

          // Filter and sort
          const filtered = jobsList.filter((j) => j.matchScore > 0)
          const sorted = filtered.sort((a, b) => {
            if (sortBy === "score") {
              return b.matchScore - a.matchScore
            } else {
              return new Date(b.createdAt.toDate()).getTime() - new Date(a.createdAt.toDate()).getTime()
            }
          })

          setJobs(sorted)
        }
      } catch (error) {
        console.error("Error fetching matched jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatchedJobs()
  }, [user, sortBy])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Calculating matches...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  const avgScore = jobs.length > 0 ? Math.round(jobs.reduce((sum, j) => sum + j.matchScore, 0) / jobs.length) : 0

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Matches</h1>
          <p className="text-gray-600">Jobs tailored to your skills</p>
        </div>

        {/* Stats */}
        {jobs.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 bg-white rounded-lg border border-border">
              <p className="text-gray-600 text-sm font-medium mb-1">Matched Opportunities</p>
              <p className="text-3xl font-bold text-primary-light">{jobs.length}</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-border">
              <p className="text-gray-600 text-sm font-medium mb-1">Average Match Score</p>
              <p className="text-3xl font-bold text-primary-light">{avgScore}%</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-border">
              <p className="text-gray-600 text-sm font-medium mb-1">Your Skills</p>
              <p className="text-3xl font-bold text-primary-light">{userProfile?.skills.length || 0}</p>
            </div>
          </div>
        )}

        {/* Sort */}
        <div className="mb-6 flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "score" | "recent")}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="score">Sort by Match Score</option>
            <option value="recent">Sort by Recent</option>
          </select>
        </div>

        {/* Jobs */}
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg mb-2">No matches yet</p>
            <p className="text-gray-500 mb-6">
              {userProfile?.skills.length === 0
                ? "Add some skills to your profile to see matched opportunities"
                : "Check back soon for new opportunities that match your skills"}
            </p>
            <Link
              href="/profile"
              className="inline-flex px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition"
            >
              Edit Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <MatchScoreBadge score={job.matchScore} size="lg" label="" />
                </div>
                <JobCard job={job} userSkills={userProfile?.skills || []} showMatch={false} />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default function MatchesPage() {
  return (
    <AuthGuard>
      <MatchesContent />
    </AuthGuard>
  )
}
