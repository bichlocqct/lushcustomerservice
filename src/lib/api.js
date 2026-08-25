const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export async function submitReview(payload) {
  const response = await fetch(`${apiBaseUrl}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Chưa thể gửi đánh giá. Vui lòng thử lại sau ít phút.')
  }

  return data
}
