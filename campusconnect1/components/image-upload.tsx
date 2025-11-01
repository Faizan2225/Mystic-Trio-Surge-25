"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onFileSelect: (file: File) => void
  currentImage?: string
  onRemove?: () => void
}

export function ImageUpload({ onFileSelect, currentImage, onRemove }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState(currentImage || "")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(e.type === "dragover" || e.type === "dragenter")
  }

  const handleFile = (file: File) => {
    setError("")

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

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

  const handleRemove = () => {
    setPreview("")
    onRemove?.()
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div>
      {!preview ? (
        <div
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-lg cursor-pointer transition flex flex-col items-center justify-center ${
            isDragging ? "border-primary-light bg-blue-50" : "border-border hover:border-primary-light"
          }`}
        >
          <input ref={inputRef} type="file" onChange={handleInputChange} accept="image/*" className="hidden" />

          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <p className="font-semibold text-gray-700">Upload profile picture</p>
          <p className="text-sm text-gray-500">PNG, JPG up to 2MB</p>
        </div>
      ) : (
        <div className="relative inline-block">
          <div className="w-32 h-32 relative rounded-lg overflow-hidden border-2 border-border">
            <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
