import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import pg from 'pg'

const { Pool } = pg

const app = express()
const port = Number(process.env.PORT || 3001)
const vietnamTimeZone = 'Asia/Ho_Chi_Minh'
const impressionLabels = new Map([
  ['service', 'Dịch vụ cửa hàng'],
  ['space', 'Không gian cửa hàng'],
  ['team', 'Thái độ nhân viên'],
  ['product-range', 'Sản phẩm đa dạng'],
  ['other', 'Khác'],
])
const allowedImpressions = new Set(['service', 'space', 'team', 'product-range', 'other'])
const allowedStores = new Set([
  'LUSH Vincom Đồng Khởi',
  'LUSH Saigon Center',
  'LUSH Hùng Vương Plaza',
  'LUSH Hanoi Center',
  'LUSH Lotte Tây Hồ',
  'LUSH AEON Hà Đông',
])
const allowedDissatisfactions = new Set([
  'Thái độ nhân viên',
  'Kỹ năng tư vấn / Kiến thức sản phẩm',
  'Thanh toán lâu',
  'Không được chào đón và tư vấn sản phẩm',
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

app.get(['/api/health', '/health'], async (_request, response) => {
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
  return String(phone).trim()
}

function getVietnamDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: vietnamTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]))
}

function getVietnamTimestamp(date = new Date()) {
  const values = getVietnamDateParts(date)
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}.${milliseconds}+07:00`
}

function getVietnamLocalTimestamp(date = new Date()) {
  const values = getVietnamDateParts(date)
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}.${milliseconds}`
}

function validateReview(body = {}) {
  const rating = Number(body.rating)
  const impressions = Array.isArray(body.impressions) ? body.impressions : []
  const dissatisfactions = Array.isArray(body.dissatisfactions) ? body.dissatisfactions : []
  const impressionNote = typeof body.impressionNote === 'string' ? body.impressionNote.trim() : ''
  const dissatisfactionNote = typeof body.dissatisfactionNote === 'string' ? body.dissatisfactionNote.trim() : ''
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : ''
  const phone = normalizePhone(body.phone)
  const errors = []

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('Mức đánh giá không hợp lệ.')
  if (!impressions.length || impressions.some((item) => !allowedImpressions.has(item))) errors.push('Điểm ấn tượng không hợp lệ.')
  if (impressions.includes('other') && !impressionNote) errors.push('Vui lòng chia sẻ thêm điều bạn yêu thích.')
  if (dissatisfactions.some((item) => !allowedDissatisfactions.has(item))) errors.push('Mục chưa hài lòng không hợp lệ.')
  if (!allowedStores.has(body.store)) errors.push('Cửa hàng không hợp lệ.')
  if (!/^\d+$/.test(phone)) errors.push('Số điện thoại chỉ được chứa chữ số.')
  if (impressionNote.length > 1000 || dissatisfactionNote.length > 1000) errors.push('Nội dung chia sẻ quá dài.')
  if (customerName.length > 80) errors.push('Tên không hợp lệ.')
  if (body.consentToContact !== true) errors.push('Cần có sự đồng ý liên hệ.')

  return { errors, rating, impressions, impressionNote, dissatisfactions, dissatisfactionNote, customerName, phone }
}

app.post(['/api/reviews', '/reviews'], async (request, response) => {
  const { errors, rating, impressions, impressionNote, dissatisfactions, dissatisfactionNote, customerName, phone } = validateReview(request.body)
  if (errors.length) return response.status(400).json({ message: errors[0], errors })

  const submittedAt = getVietnamTimestamp()
  const submittedAtVietnam = getVietnamLocalTimestamp()
  const review = {
    created_at: submittedAtVietnam,
    submitted_at_vietnam: submittedAtVietnam,
    rating,
    impressions: impressions.map((item) => impressionLabels.get(item) || item),
    impression_note: impressionNote,
    dissatisfactions,
    dissatisfaction_note: dissatisfactionNote,
    customer_name: customerName,
    phone,
    store: request.body.store || 'LUSH Vincom Đồng Khởi',
    consent_to_contact: true,
  }

  if (!database) {
    if (process.env.DEMO_MODE === 'true') {
      reviewsInDemoMode.push({ ...review })
      return response.status(201).json({ ok: true, mode: 'demo', submittedAt })
    }
    return response.status(503).json({ message: 'Kết nối cơ sở dữ liệu chưa được cấu hình cho server.' })
  }

  try {
    await database.query(
      `insert into service_reviews
        (created_at, submitted_at_vietnam, rating, impressions, impression_note, dissatisfactions, dissatisfaction_note, customer_name, phone, store, consent_to_contact)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        review.created_at,
        review.submitted_at_vietnam,
        review.rating,
        review.impressions,
        review.impression_note,
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

  return response.status(201).json({ ok: true, mode: 'supabase-postgres', submittedAt })
})

export default app

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`LUSH review API listening on http://localhost:${port}`)
    console.log(`Persistence: ${database ? 'Supabase PostgreSQL' : process.env.DEMO_MODE === 'true' ? 'demo memory' : 'not configured'}`)
  })
}
