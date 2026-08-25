const apiBaseUrl = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')).replace(/\/$/, '')

export async function submitReview(payload) {
  let response
  try {
    response = await fetch(`${apiBaseUrl}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Không thể kết nối đến hệ thống lưu đánh giá. Vui lòng kiểm tra server và thử lại.')
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Chưa thể gửi đánh giá. Vui lòng thử lại sau ít phút.')
  }

  return data
}
