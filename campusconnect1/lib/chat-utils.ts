export function generateChatId(userId1: string, userId2: string): string {
  // Create consistent chat ID by sorting user IDs
  const sortedIds = [userId1, userId2].sort()
  return `${sortedIds[0]}_${sortedIds[1]}`
}
