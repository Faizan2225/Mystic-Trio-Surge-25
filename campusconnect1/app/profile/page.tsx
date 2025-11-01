"use client"

import type React from "react"

import { useAuthState } from "react-firebase-hooks/auth"
import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import type { User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { FileUpload } from "@/components/file-upload"
import { ImageUpload } from "@/components/image-upload"
import { SkillsInput } from "@/components/skills-input"
import { uploadResume, uploadProfileImage } from "@/lib/upload"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle } from "lucide-react"

function ProfileContent() {
  const [user] = useAuthState(auth)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [bio, setBio] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const userRef = doc(db, "users", user.uid)
          const userSnap = await getDoc(userRef)
          if (userSnap.exists()) {
            const profile = userSnap.data() as User
            setUserProfile(profile)
            setSkills(profile.skills || [])
            setBio(profile.bio || "")
          }
        } catch (err) {
          console.error("Error fetching profile:", err)
          setError("Failed to load profile")
        } finally {
          setLoading(false)
        }
      }
      fetchUserProfile()
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      if (!user) return

      let resumeUrl = userProfile?.resumeUrl || ""
      let photoUrl = userProfile?.photoUrl || ""

      if (resumeFile) {
        resumeUrl = await uploadResume(user.uid, resumeFile)
      }

      if (photoFile) {
        photoUrl = await uploadProfileImage(user.uid, photoFile)
      }

      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        skills,
        bio,
        ...(resumeUrl && { resumeUrl }),
        ...(photoUrl && { photoUrl }),
      })

      setSuccess("Profile updated successfully!")
      setResumeFile(null)
      setPhotoFile(null)

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-primary-light rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Complete your profile to improve your matches</p>
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
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8 bg-white rounded-lg border border-border p-8">
          {/* Profile Photo */}
          {userProfile?.role === "seeker" && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">Profile Picture</label>
              <ImageUpload
                onFileSelect={setPhotoFile}
                currentImage={userProfile?.photoUrl}
                onRemove={() => setPhotoFile(null)}
              />
            </div>
          )}

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
            <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">Skills</label>
            <SkillsInput
              skills={skills}
              onChange={setSkills}
              placeholder="Add your technical skills"
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

          {/* Resume - Only for Seekers */}
          {userProfile?.role === "seeker" && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">Resume</label>
              <FileUpload
                onFileSelect={setResumeFile}
                accept=".pdf,.doc,.docx"
                maxSize={5 * 1024 * 1024}
                currentFile={userProfile?.resumeUrl ? "Resume uploaded" : undefined}
              />
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary-light text-white font-semibold rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Profile"}
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

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
