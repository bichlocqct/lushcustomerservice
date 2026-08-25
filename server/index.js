import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import pg from 'pg'

const { Pool } = pg

const app = express()
const port = Number(process.env.PORT || 3001)
const allowedImpressions = new Set(['service', 'space', 'team'])
const allowedDissatisfactions = new Set([
  'Thời gian chờ',
  'Tư vấn chưa đủ rõ',
  'Khó tìm sản phẩm phù hợp',
  'Không gian / trải nghiệm tại cửa hàng',
  'Khác',
])
const reviewsInDemoMode = []

const databaseUrl = process.env.DATABASE_URL
const database = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    })
  : null

app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }))
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', async (_request, response) => {
  if (!database) return response.json({ ok: true, persistence: 'demo' })

  try {
    const { rows } = await database.query('select now() as connected_at')
    return response.json({ ok: true, persistence: 'supabase-postgres', connectedAt: rows[0].connected_at })
  } catch (error) {
    console.error('PostgreSQL health check failed:', error.message)
    return response.status(503).json({ ok: false, persistence: 'supabase-postgres', message: 'Không thể kết nối cơ sở dữ liệu.' })
  }
})

function normalizePhone(phone = '') {
  const compact = String(phone).replace(/[\s().-]/g, '')
  if (compact.startsWith('+84')) return `0${compact.slice(3)}`
  return compact
}

function validateReview(body = {}) {
  const rating = Number(body.rating)
  const impressions = Array.isArray(body.impressions) ? body.impressions : []
  const dissatisfactions = Array.isArray(body.dissatisfactions) ? body.dissatisfactions : []
  const phone = normalizePhone(body.phone)
  const errors = []

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('Mức đánh giá không hợp lệ.')
  if (!impressions.length || impressions.some((item) => !allowedImpressions.has(item))) errors.push('Điểm ấn tượng không hợp lệ.')
  if (dissatisfactions.some((item) => !allowedDissatisfactions.has(item))) errors.push('Mục chưa hài lòng không hợp lệ.')
  if (!/^(0)(3|5|7|8|9)\d{8}$/.test(phone)) errors.push('Số điện thoại không hợp lệ.')
  if (typeof body.dissatisfactionNote !== 'string' || body.dissatisfactionNote.length > 1000) errors.push('Nội dung chia sẻ quá dài.')
  if (typeof body.customerName !== 'string' || body.customerName.length > 80) errors.push('Tên không hợp lệ.')
  if (body.consentToContact !== true) errors.push('Cần có sự đồng ý liên hệ.')

  return { errors, rating, impressions, dissatisfactions, phone }
}

app.post('/api/reviews', async (request, response) => {
  const { errors, rating, impressions, dissatisfactions, phone } = validateReview(request.body)
  if (errors.length) return response.status(400).json({ message: errors[0], errors })

  const review = {
    rating,
    impressions,
    dissatisfactions,
    dissatisfaction_note: request.body.dissatisfactionNote.trim(),
    customer_name: request.body.customerName.trim(),
    phone,
    store: request.body.store || 'Cửa hàng LUSH hôm nay',
    consent_to_contact: true,
  }

  if (!database) {
    if (process.env.DEMO_MODE === 'true') {
      reviewsInDemoMode.push({ ...review, created_at: new Date().toISOString() })
      return response.status(201).json({ ok: true, mode: 'demo' })
    }
    return response.status(503).json({ message: 'Kết nối cơ sở dữ liệu chưa được cấu hình cho server.' })
  }

  try {
    await database.query(
      `insert into service_reviews
        (rating, impressions, dissatisfactions, dissatisfaction_note, customer_name, phone, store, consent_to_contact)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        review.rating,
        review.impressions,
        review.dissatisfactions,
        review.dissatisfaction_note,
        review.customer_name,
        review.phone,
        review.store,
        review.consent_to_contact,
      ],
    )
  } catch (error) {
    console.error('PostgreSQL insert failed:', error.message)
    return response.status(502).json({ message: 'LUSH chưa thể lưu đánh giá lúc này. Vui lòng thử lại sau ít phút.' })
  }

  return response.status(201).json({ ok: true, mode: 'supabase-postgres' })
})

app.listen(port, () => {
  console.log(`LUSH review API listening on http://localhost:${port}`)
  console.log(`Persistence: ${database ? 'Supabase PostgreSQL' : process.env.DEMO_MODE === 'true' ? 'demo memory' : 'not configured'}`)
})
