"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface SkillsInputProps {
  skills: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  suggestions?: string[]
}

export function SkillsInput({
  skills,
  onChange,
  placeholder = "Add a skill and press Enter",
  suggestions = ["Python", "JavaScript", "React", "Node.js", "TypeScript", "Java", "SQL"],
}: SkillsInputProps) {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
      setInput("")
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSkill(input)
    }
  }

  const handleRemoveSkill = (skill: string) => {
    onChange(skills.filter((s) => s !== skill))
  }

  const filteredSuggestions = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s),
  )

  return (
    <div>
      <div className="space-y-3">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-primary-light rounded-full"
              >
                <span className="text-sm font-medium">{skill}</span>
                <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-600 transition">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
            onFocus={() => input && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
          />

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleAddSkill(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-surface transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
