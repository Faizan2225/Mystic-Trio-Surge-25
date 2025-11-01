"use client"

import { useEffect, useState } from "react"
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { useRouter } from "next/navigation"
import type { Job, User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { calculateMatch, formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft, Tag, Calendar, CheckCircle } from "lucide-react"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [user] = useAuthState(auth)
  const [job, setJob] = useState<Job | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasApplied, setHasApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [appliedMessage, setAppliedMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // Fetch job
        const jobRef = doc(db, "jobs", params.id)
        const jobSnap = await getDoc(jobRef)

        if (jobSnap.exists()) {
          const jobData = { id: jobSnap.id, ...jobSnap.data() } as Job
          setJob(jobData)

          // Increment views
          await updateDoc(jobRef, {
            views: increment(1),
          })
        }

        // Fetch user profile if logged in
        if (user) {
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as User)
          }

          // Check if user has already applied
          const applicationsQuery = query(
            collection(db, "applications"),
            where("jobId", "==", params.id),
            where("applicantId", "==", user.uid),
          )
          const applicationsSnap = await getDocs(applicationsQuery)
          setHasApplied(applicationsSnap.docs.length > 0)
        }
      } catch (err) {
        console.error("Error fetching job details:", err)
        setError("Failed to load job details")
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [params.id, user])

  const handleApply = async () => {
    if (!user || !userProfile) {
      router.push("/login")
      return
    }

    setApplying(true)
    setError("")

    try {
      // Create application
      await addDoc(collection(db, "applications"), {
        jobId: params.id,
        applicantId: user.uid,
        message: appliedMessage,
        status: "pending",
        appliedAt: serverTimestamp(),
      })

      setHasApplied(true)
      setAppliedMessage("")
      setError("")
    } catch (err: any) {
      setError(err.message || "Failed to apply")
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading job details...</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!job) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">Job not found</p>
          <Link href="/jobs" className="text-primary-light font-semibold hover:underline">
            Back to jobs
          </Link>
        </main>
      </>
    )
  }

  const matchScore = userProfile ? calculateMatch(userProfile.skills, job.tags) : 0

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-primary-light font-semibold mb-8 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to jobs
        </Link>

        <div className="bg-white rounded-lg border border-border p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 text-primary-light text-sm font-semibold rounded-full mb-3">
                {job.type}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span>Posted {formatDate(job.createdAt)}</span>
                {job.views !== undefined && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{job.views} views</span>
                  </>
                )}
              </div>
            </div>

            {userProfile && (
              <div
                className={`text-right px-4 py-2 rounded-lg ${
                  matchScore >= 80 ? "bg-green-100" : matchScore >= 50 ? "bg-yellow-100" : "bg-gray-100"
                }`}
              >
                <div className="text-2xl font-bold">{matchScore}%</div>
                <div className="text-xs text-gray-600">Match</div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Tags/Skills */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-primary-light rounded-full text-sm font-medium"
                >
                  <Tag size={16} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Application Section */}
          {userProfile && (
            <div className="border-t border-border pt-8">
              {hasApplied ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={24} />
                  <div>
                    <p className="font-semibold text-green-900">Already Applied</p>
                    <p className="text-sm text-green-800">
                      We've received your application. Check your dashboard for updates.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply Now</h2>
                  <div className="space-y-4">
                    <textarea
                      value={appliedMessage}
                      onChange={(e) => setAppliedMessage(e.target.value)}
                      placeholder="Add a message to introduce yourself (optional)"
                      rows={4}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full py-3 bg-primary-light text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                    >
                      {applying ? "Applying..." : "Submit Application"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className="border-t border-border pt-8 text-center">
              <p className="text-gray-600 mb-4">Sign in to apply for this opportunity</p>
              <Link
                href="/login"
                className="inline-flex px-6 py-2 bg-primary-light text-white font-semibold rounded-lg hover:bg-primary-dark transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
