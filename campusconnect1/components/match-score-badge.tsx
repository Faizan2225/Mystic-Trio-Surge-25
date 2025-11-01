"use client"

import { Target } from "lucide-react"

interface MatchScoreBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  label?: string
}

export function MatchScoreBadge({ score, size = "md", label = "Match" }: MatchScoreBadgeProps) {
  const getColor = () => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-200"
    if (score >= 60) return "bg-blue-100 text-blue-700 border-blue-200"
    if (score >= 40) return "bg-yellow-100 text-yellow-700 border-yellow-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${getColor()} ${sizeClasses[size]}`}
    >
      <Target size={size === "sm" ? 14 : size === "md" ? 16 : 18} />
      <span>{score}%</span>
      {label && <span className="text-xs opacity-75">{label}</span>}
    </div>
  )
}
