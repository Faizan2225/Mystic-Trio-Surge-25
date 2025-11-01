"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import type { Job, User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { JobCard } from "@/components/job-card"
import { doc, getDoc } from "firebase/firestore"
import { Search, Filter } from "lucide-react"

export default function JobsPage() {
  const [user] = useAuthState(auth)
  const [jobs, setJobs] = useState<Job[]>([])
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"))
        const jobsSnap = await getDocs(jobsQuery)
        const jobsList: Job[] = []

        for (const doc of jobsSnap.docs) {
          jobsList.push({
            id: doc.id,
            ...doc.data(),
          } as Job)
        }

        setJobs(jobsList)

        // Fetch user profile if logged in
        if (user) {
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as User)
          }
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = !selectedType || job.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Opportunities</h1>
          <p className="text-gray-600">Find jobs and internships that match your skills</p>
        </div>

        {/* Search and Filter */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="">All Types</option>
            <option value="Job">Full-time Job</option>
            <option value="Internship">Internship</option>
            <option value="Project">Project</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading opportunities...</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No opportunities found</p>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} userSkills={userProfile?.skills || []} showMatch={!!userProfile} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
