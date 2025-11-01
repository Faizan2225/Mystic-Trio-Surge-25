"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { SkillsInput } from "@/components/skills-input"
import Link from "next/link"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

function CreateJobContent() {
  const [user] = useAuthState(auth)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"Job" | "Internship" | "Project">("Job")
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Job title is required")
      return
    }

    if (!description.trim()) {
      setError("Job description is required")
      return
    }

    if (tags.length === 0) {
      setError("Please add at least one skill tag")
      return
    }

    setLoading(true)

    try {
      if (!user) return

      await addDoc(collection(db, "jobs"), {
        title: title.trim(),
        description: description.trim(),
        type,
        tags,
        creatorId: user.uid,
        views: 0,
        createdAt: serverTimestamp(),
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to create job")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary-light font-semibold mb-8 hover:underline"
        >
          <ArrowLeft size={20} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Opportunity</h1>
          <p className="text-gray-600">Connect with talented students and professionals</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
            <p className="text-green-600 text-sm">Job posted successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleCreateJob} className="bg-white rounded-lg border border-border p-8 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Full-stack Developer Internship"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Job Type *</label>
            <div className="grid grid-cols-3 gap-3">
              {(["Job", "Internship", "Project"] as const).map((jobType) => (
                <button
                  key={jobType}
                  type="button"
                  onClick={() => setType(jobType)}
                  className={`p-3 rounded-lg border-2 transition text-center font-medium ${
                    type === jobType
                      ? "border-primary-light bg-blue-50 text-primary-light"
                      : "border-border hover:border-gray-300"
                  }`}
                >
                  {jobType}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={6}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/1000 characters</p>
          </div>

          {/* Skills/Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">Required Skills *</label>
            <SkillsInput
              skills={tags}
              onChange={setTags}
              placeholder="Add required skills"
              suggestions={[
                "Python",
                "JavaScript",
                "TypeScript",
                "React",
                "Node.js",
                "Java",
                "C++",
                "SQL",
                "HTML",
                "CSS",
                "Vue.js",
                "Angular",
                "Django",
                "Express",
                "MongoDB",
                "PostgreSQL",
                "AWS",
                "Docker",
                "Kubernetes",
              ]}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary-light text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post Opportunity"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 border border-border rounded-lg hover:bg-surface transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </>
  )
}

export default function CreateJobPage() {
  return (
    <AuthGuard>
      <CreateJobContent />
    </AuthGuard>
  )
}
