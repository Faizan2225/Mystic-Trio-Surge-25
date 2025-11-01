"use client"

import { useAuthState } from "react-firebase-hooks/auth"
import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import type { Application, Job, User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Briefcase, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface ApplicationWithDetails extends Application {
  job?: Job
  applicant?: User
}

function ApplicationsContent() {
  const [user] = useAuthState(auth)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "shortlisted" | "accepted" | "rejected">("all")

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (!user) return

        // Fetch user profile
        const userRef = doc(db, "users", user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as User)

          const isFinder = (userSnap.data() as User).role === "finder"

          // Fetch applications
          const q = isFinder
            ? query(collection(db, "applications"), where("jobId", "in", []))
            : query(collection(db, "applications"), where("applicantId", "==", user.uid))

          const appsSnap = await getDocs(isFinder ? query(collection(db, "applications")) : q)

          const appsList: ApplicationWithDetails[] = []

          for (const appDoc of appsSnap.docs) {
            const app = appDoc.data() as Application

            if (isFinder) {
              // For finders: only show applications for their jobs
              const jobRef = doc(db, "jobs", app.jobId)
              const jobSnap = await getDoc(jobRef)
              if (jobSnap.exists() && (jobSnap.data() as Job).creatorId === user.uid) {
                const applicantRef = doc(db, "users", app.applicantId)
                const applicantSnap = await getDoc(applicantRef)

                appsList.push({
                  ...app,
                  id: appDoc.id,
                  job: { ...jobSnap.data(), id: jobSnap.id } as Job,
                  applicant: applicantSnap.exists() ? (applicantSnap.data() as User) : undefined,
                })
              }
            } else {
              // For seekers: show their applications
              const jobRef = doc(db, "jobs", app.jobId)
              const jobSnap = await getDoc(jobRef)

              appsList.push({
                ...app,
                id: appDoc.id,
                job: jobSnap.exists() ? ({ ...jobSnap.data(), id: jobSnap.id } as Job) : undefined,
              })
            }
          }

          setApplications(appsList)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [user])

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true
    return app.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700 border-green-200"
      case "shortlisted":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle size={16} />
      case "shortlisted":
        return <AlertCircle size={16} />
      case "pending":
        return <Clock size={16} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading applications...</p>
            </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isFinder ? "Applications Received" : "My Applications"}
          </h1>
          <p className="text-gray-600">
            {isFinder ? "Review applicants for your posted opportunities" : "Track the status of your job applications"}
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["all", "pending", "shortlisted", "accepted", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg border transition capitalize ${
                filter === status
                  ? "bg-primary-light text-white border-primary-light"
                  : "border-border hover:border-primary-light"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Applications */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No applications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <div key={app.id} className="p-6 bg-white rounded-lg border border-border hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="text-primary-light" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">{app.job?.title || "Job Removed"}</h3>
                    </div>
                    {isFinder && app.applicant && <p className="text-gray-600">Applicant: {app.applicant.name}</p>}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar size={16} />
                      Applied {formatDate(app.appliedAt)}
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full border text-sm font-semibold inline-flex items-center gap-1 ${getStatusColor(app.status)}`}
                  >
                    {getStatusIcon(app.status)}
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </div>
                </div>

                {app.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Message:</strong> {app.message}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {app.job && (
                    <Link
                      href={`/jobs/${app.job.id}`}
                      className="px-4 py-2 text-sm text-primary-light border border-primary-light rounded-lg hover:bg-blue-50 transition"
                    >
                      View Job
                    </Link>
                  )}
                  {isFinder && app.applicant && (
                    <Link
                      href={`/chat/${app.applicant.uid}`}
                      className="px-4 py-2 text-sm bg-primary-light text-white rounded-lg hover:bg-primary-dark transition"
                    >
                      Message Applicant
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default function ApplicationsPage() {
  return (
    <AuthGuard>
      <ApplicationsContent />
    </AuthGuard>
  )
}
