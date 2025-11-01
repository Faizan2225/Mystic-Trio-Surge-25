export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function calculateMatch(userSkills: string[], jobTags: string[]): number {
  if (jobTags.length === 0) return 0
  const matchCount = userSkills.filter((skill) =>
    jobTags.some((tag) => tag.toLowerCase() === skill.toLowerCase()),
  ).length
  return Math.min(100, Math.round((matchCount / jobTags.length) * 100))
}

export function formatDate(date: Date | { toDate: () => Date }): string {
  const d = "toDate" in date ? date.toDate() : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str
}
