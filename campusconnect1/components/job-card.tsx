"use client"

import type { Job } from "@/lib/types"
import { calculateMatch, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Briefcase, Calendar, Tag, Target } from "lucide-react"

interface JobCardProps {
  job: Job
  userSkills?: string[]
  showMatch?: boolean
}

export function JobCard({ job, userSkills = [], showMatch = true }: JobCardProps) {
  const matchScore = showMatch ? calculateMatch(userSkills, job.tags) : 0

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="p-6 bg-white rounded-lg border border-border hover:shadow-lg hover:border-primary-light transition cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase size={16} />
              <span>{job.type}</span>
            </div>
          </div>
          {showMatch && matchScore > 0 && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                matchScore >= 80
                  ? "bg-green-100 text-green-700"
                  : matchScore >= 50
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              <Target size={14} />
              {matchScore}%
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-primary-light text-xs rounded-full"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && <span className="px-2 py-1 text-xs text-gray-600">+{job.tags.length - 3}</span>}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(job.createdAt)}
          </div>
          {job.views !== undefined && <span>{job.views} views</span>}
        </div>
      </div>
    </Link>
  )
}
