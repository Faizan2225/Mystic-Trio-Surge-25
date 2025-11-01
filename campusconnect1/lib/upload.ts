import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "./firebase"

export async function uploadResume(userId: string, file: File): Promise<string> {
  const fileName = `resumes/${userId}/${file.name}`
  const fileRef = ref(storage, fileName)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  return url
}

export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  const fileName = `profiles/${userId}/avatar`
  const fileRef = ref(storage, fileName)
  await uploadBytes(fileRef, file)
  const url = await getDownloadURL(fileRef)
  return url
}
