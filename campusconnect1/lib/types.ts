import type { Timestamp } from "firebase/firestore"

export interface User {
  uid: string
  name: string
  email: string
  role: "finder" | "seeker"
  skills: string[]
  bio: string
  resumeUrl?: string
  photoUrl?: string
  createdAt: Timestamp
}

export interface Job {
  id: string
  title: string
  description: string
  type: "Internship" | "Project" | "Job"
  tags: string[]
  creatorId: string
  views?: number
  createdAt: Timestamp
}

export interface Application {
  id: string
  jobId: string
  applicantId: string
  message: string
  status: "pending" | "shortlisted" | "accepted" | "rejected"
  appliedAt: Timestamp
}

export interface ChatMessage {
  id: string
  text: string
  senderId: string
  timestamp: Timestamp
}

export interface ChatRoom {
  id: string
  participants: string[]
  lastMessage?: string
  lastMessageTime?: Timestamp
}
