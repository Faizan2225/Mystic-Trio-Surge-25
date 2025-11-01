"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  currentFile?: string
}

export function FileUpload({
  onFileSelect,
  accept = ".pdf,.doc,.docx",
  maxSize = 5 * 1024 * 1024,
  currentFile,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(e.type === "dragover" || e.type === "dragenter")
  }

  const handleFile = (file: File) => {
    setError("")

    if (!accept.split(",").some((ext) => file.name.endsWith(ext.trim()))) {
      setError(`Invalid file type. Allowed: ${accept}`)
      return
    }

    if (file.size > maxSize) {
      setError(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div>
      <div
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition ${
          isDragging ? "border-primary-light bg-blue-50" : "border-border hover:border-primary-light"
        }`}
      >
        <input ref={inputRef} type="file" onChange={handleInputChange} accept={accept} className="hidden" />

        <div className="flex flex-col items-center justify-center">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="font-semibold text-gray-700">{currentFile ? "Change file" : "Drag & drop your file here"}</p>
          <p className="text-sm text-gray-500">or click to browse</p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {currentFile && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <FileText className="text-green-600" size={20} />
          <span className="text-sm font-medium text-green-700">File uploaded successfully</span>
        </div>
      )}
    </div>
  )
}
