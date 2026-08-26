import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle,
  FlowerLotus,
  MapPin,
  Phone,
  Sparkle,
} from '@phosphor-icons/react'
import { submitReview } from './lib/api.js'

const ratingOptions = [
  {
    value: 1,
    label: 'Chưa trọn vẹn',
    image: '/bathbombs/bathbomb-pink-lilac-cutout.png',
    alt: 'Bath bomb màu hồng tím, nền trong suốt',
  },
  {
    value: 2,
    label: 'Cần cải thiện',
    image: '/bathbombs/bathbomb-sunny-cutout.png',
    alt: 'Bath bomb màu vàng hồng, nền trong suốt',
  },
  {
    value: 3,
    label: 'Ổn',
    image: '/bathbombs/bathbomb-white-cutout.png',
    alt: 'Bath bomb màu trắng có hình sao hồng, nền trong suốt',
  },
  {
    value: 4,
    label: 'Rất tốt',
    image: '/bathbombs/bathbomb-rose-cutout.png',
    alt: 'Bath bomb màu hồng, nền trong suốt',
  },
  {
    value: 5,
    label: 'Tuyệt vời',
    image: '/bathbombs/bathbomb-fifth-cutout.png',
    alt: 'Bath bomb nhiều màu tím, xanh, vàng và hồng, nền trong suốt',
  },
]

const impressionOptions = [
  { id: 'service', label: 'Dịch vụ cửa hàng' },
  { id: 'space', label: 'Không gian cửa hàng', note: 'Mùi hương, màu sắc' },
  { id: 'team', label: 'Thái độ nhân viên', note: 'Nhiệt tình, tư vấn chuyên nghiệp, …' },
  { id: 'product-range', label: 'Sản phẩm đa dạng', note: 'Sản phẩm phù hợp nhiều nhu cầu' },
  { id: 'other', label: 'Khác', note: 'Bạn có thể chia sẻ thêm điều mình yêu thích' },
]

const dissatisfactionOptions = [
  'Thái độ nhân viên',
  'Kỹ năng tư vấn / Kiến thức sản phẩm',
  'Thanh toán lâu',
  'Không được chào đón và tư vấn sản phẩm',
  'Khác',
]

const storeOptions = [
  'LUSH Vincom Đồng Khởi',
  'LUSH Saigon Center',
  'LUSH Hùng Vương Plaza',
  'LUSH Hanoi Center',
  'LUSH Lotte Tây Hồ',
  'LUSH AEON Hà Đông',
]

const vietnamTimeZone = 'Asia/Ho_Chi_Minh'

function getTodayLabel() {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: vietnamTimeZone,
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date())
}

function ToggleOption({ checked, label, note, onChange }) {
  return (
    <label className={`toggle-option ${checked ? 'is-selected' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-mark" aria-hidden="true">
        {checked ? <Check size={15} weight="bold" /> : null}
      </span>
      <span className="toggle-copy">
        <span className="toggle-label">{label}</span>
        {note ? <span className="toggle-note">{note}</span> : null}
      </span>
    </label>
  )
}

function RatingSelector({ rating, onChange }) {
  return (
    <div className="rating-selector" role="radiogroup" aria-label="Mức độ hài lòng">
      {ratingOptions.map((option, index) => {
        const isSelected = rating === option.value
        const isLit = rating ? option.value <= rating : false

        return (
          <button
            className={`rating-option ${isSelected ? 'is-selected' : ''} ${isLit ? 'is-lit' : ''}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${option.value} trên 5 — ${option.label}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{ '--item-index': index }}
          >
            <span className="rating-image-wrap">
              <img src={option.image} alt={option.alt} />
            </span>
            <span className="rating-number">0{option.value}</span>
            <span className="rating-label">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function SuccessState({ onReset }) {
  return (
    <section className="success-panel" aria-live="polite">
      <div className="success-orbit success-orbit-one" />
      <div className="success-orbit success-orbit-two" />
      <div className="success-icon">
        <CheckCircle size={38} weight="light" />
      </div>
      <p className="eyebrow">Cảm ơn bạn đã ghé LUSH</p>
      <h2>Cảm nhận của bạn đã được ghi nhận.</h2>
      <p className="success-copy">
        Phản hồi của bạn đã được lưu vào mục Tổng hợp đánh giá. Đội ngũ LUSH trân trọng từng chia sẻ để mỗi lần bạn ghé thăm đều trở nên dễ chịu hơn.
      </p>
      <button className="secondary-button" type="button" onClick={onReset}>
        Gửi thêm một đánh giá <ArrowRight size={17} weight="bold" />
      </button>
    </section>
  )
}

function App() {
  const [rating, setRating] = useState(0)
  const [impressions, setImpressions] = useState([])
  const [impressionNote, setImpressionNote] = useState('')
  const [dissatisfactions, setDissatisfactions] = useState([])
  const [dissatisfactionNote, setDissatisfactionNote] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [store, setStore] = useState(storeOptions[0])
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const todayLabel = useMemo(getTodayLabel, [])
  const currentStep = rating ? 2 : 1

  function toggleValue(value, values, setValues) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  function resetForm() {
    setRating(0)
    setImpressions([])
    setImpressionNote('')
    setDissatisfactions([])
    setDissatisfactionNote('')
    setCustomerName('')
    setPhone('')
    setStore(storeOptions[0])
    setConsent(false)
    setStatus('idle')
    setErrorMessage('')
    setFieldErrors({})
  }

  function validate() {
    const errors = {}
    const normalizedPhone = phone.replace(/\D/g, '')
    if (!rating) errors.rating = 'Bạn hãy chọn một mức độ trải nghiệm.'
    if (!impressions.length) errors.impressions = 'Bạn có thể chọn ít nhất một điểm ấn tượng.'
    if (impressions.includes('other') && !impressionNote.trim()) {
      errors.impressionNote = 'Bạn hãy chia sẻ thêm điều mình yêu thích.'
    }
    if (!/^\d+$/.test(normalizedPhone)) {
      errors.phone = 'Vui lòng nhập số điện thoại chỉ bằng chữ số.'
    }
    if (!consent) errors.consent = 'Vui lòng đồng ý để LUSH có thể liên hệ khi cần.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    if (!validate()) return

    setStatus('submitting')
    try {
      await submitReview({
        rating,
        impressions,
        impressionNote: impressionNote.trim(),
        dissatisfactions,
        dissatisfactionNote: dissatisfactionNote.trim(),
        customerName: customerName.trim(),
        phone: phone.replace(/\D/g, ''),
        store,
        consentToContact: consent,
      })
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  return (
    <main className="site-shell">
      <div className="ambient-shape ambient-shape-one" aria-hidden="true" />
      <div className="ambient-shape ambient-shape-two" aria-hidden="true" />

      <header className="topbar page-width">
        <a className="brand" href="/" aria-label="LUSH — trang chủ">
          <img className="brand-logo" src="/brand/lush-logo-white.png" alt="LUSH fresh handmade cosmetics" />
        </a>
        <div className="header-meta">
          <span className="live-dot" aria-hidden="true" />
          <span>Ghi nhận trong ngày</span>
          <span className="header-divider" aria-hidden="true" />
          <span className="date-label">{todayLabel}</span>
        </div>
      </header>

      <section className="hero page-width">
        <div className="hero-copy">
          <p className="eyebrow"><Sparkle size={15} weight="fill" /> LUSH service notes</p>
          <h1>Mỗi lần ghé LUSH đều đáng nhớ hơn</h1>
          <p className="hero-description">
            Chia sẻ vài dòng về trải nghiệm hôm nay. Những điều nhỏ bạn nói ra giúp chúng mình chăm chút cửa hàng tốt hơn mỗi ngày.
          </p>
          <div className="hero-stamp" aria-label="Thông tin khảo sát">
            <div className="stamp-icon"><FlowerLotus size={22} weight="light" /></div>
            <div>
              <span className="stamp-kicker">Your voice matters</span>
              <span className="stamp-copy">Mất khoảng 60 giây</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Các bath bomb của LUSH">
          <div className="hero-note hero-note-top">made with care <ArrowUpRight size={15} /></div>
          <div className="visual-blob visual-blob-green" />
          <div className="visual-blob visual-blob-pink" />
          <img className="hero-bomb hero-bomb-back" src="/bathbombs/bathbomb-white-cutout.png" alt="Bath bomb trắng hồng" />
          <img className="hero-bomb hero-bomb-main" src="/bathbombs/bathbomb-pink-lilac-cutout.png" alt="Bath bomb hồng tím" />
          <img className="hero-bomb hero-bomb-small" src="/bathbombs/bathbomb-rose-cutout.png" alt="Bath bomb hồng" />
          <div className="hero-note hero-note-bottom">one bath at a time</div>
        </div>
      </section>

      <section className="review-layout page-width" id="review-form">
        <aside className="review-aside">
          <div className="step-heading">
            <span className="step-current">0{currentStep}</span>
            <span className="step-total">/ 03</span>
          </div>
          <div className="step-line"><span style={{ width: `${(currentStep / 3) * 100}%` }} /></div>
          <p className="aside-kicker">Một chút thời gian của bạn</p>
          <h2>Để LUSH<br /><em>lắng nghe</em><br />thật kỹ</h2>
          <p className="aside-copy">Bạn không cần viết dài. Một lựa chọn cũng đủ để chúng mình hiểu điều gì đang làm nên một ngày thật vui tại cửa hàng.</p>
          <div className="aside-location"><MapPin size={17} weight="fill" /><span>Feedback của bạn sẽ được gửi riêng đến đội ngũ LUSH.</span></div>
        </aside>

        {status === 'success' ? (
          <SuccessState onReset={resetForm} />
        ) : (
          <form className="review-form" onSubmit={handleSubmit} noValidate>
            <section className="form-section rating-section">
              <div className="section-heading">
                <div>
                  <span className="section-number">01 / 03</span>
                  <h2>Hôm nay bạn thấy trải nghiệm thế nào?</h2>
                </div>
                <span className="required-note">Bắt buộc</span>
              </div>
              <p className="section-helper">Hãy chọn cục bath bomb gần nhất với cảm nhận của bạn.</p>
              <RatingSelector rating={rating} onChange={(value) => { setRating(value); setFieldErrors((current) => ({ ...current, rating: '' })) }} />
              {fieldErrors.rating ? <p className="field-error">{fieldErrors.rating}</p> : null}
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-number">02 / 03</span>
                  <h2>Điều gì đã để lại ấn tượng với bạn hôm nay?</h2>
                </div>
                <span className="required-note">Chọn nhiều</span>
              </div>
              <div className="option-list">
                {impressionOptions.map((option) => (
                  <ToggleOption
                    key={option.id}
                    checked={impressions.includes(option.id)}
                    label={option.label}
                    note={option.note}
                    onChange={() => {
                      toggleValue(option.id, impressions, setImpressions)
                      setFieldErrors((current) => ({ ...current, impressions: '' }))
                      if (option.id === 'other' && impressions.includes('other')) {
                        setImpressionNote('')
                        setFieldErrors((current) => ({ ...current, impressionNote: '' }))
                      }
                    }}
                  />
                ))}
              </div>
              {fieldErrors.impressions ? <p className="field-error">{fieldErrors.impressions}</p> : null}
              {impressions.includes('other') ? (
                <label className="input-group other-feedback-group">
                  <span>Bạn muốn chia sẻ thêm điều gì khiến mình hài lòng?</span>
                  <textarea
                    className={fieldErrors.impressionNote ? 'has-error' : ''}
                    value={impressionNote}
                    onChange={(event) => {
                      setImpressionNote(event.target.value)
                      setFieldErrors((current) => ({ ...current, impressionNote: '' }))
                    }}
                    placeholder="Một điều nhỏ nhưng đáng nhớ với bạn hôm nay…"
                    rows="3"
                    maxLength="1000"
                  />
                  {fieldErrors.impressionNote ? <small className="field-error">{fieldErrors.impressionNote}</small> : null}
                </label>
              ) : null}
            </section>

            <section className="form-section">
              <div className="section-heading">
                <div>
                  <span className="section-number">03 / 03</span>
                  <h2>Bạn chưa hài lòng về điều gì hôm nay?</h2>
                </div>
                <span className="optional-note">Không bắt buộc</span>
              </div>
              <p className="section-helper">Bạn có thể chọn một hoặc vài mục để LUSH hiểu rõ hơn điều cần cải thiện.</p>
              <div className="chip-list">
                {dissatisfactionOptions.map((option) => {
                  const checked = dissatisfactions.includes(option)
                  return (
                    <label className={`choice-chip ${checked ? 'is-selected' : ''}`} key={option}>
                      <input type="checkbox" checked={checked} onChange={() => toggleValue(option, dissatisfactions, setDissatisfactions)} />
                      <span>{option}</span>
                      {checked ? <Check size={14} weight="bold" /> : null}
                    </label>
                  )
                })}
              </div>
              <label className="input-group note-group">
                <span>Bạn muốn chia sẻ thêm?</span>
                <textarea value={dissatisfactionNote} onChange={(event) => setDissatisfactionNote(event.target.value)} placeholder="Một góp ý nhỏ cũng có thể tạo nên thay đổi lớn…" rows="3" maxLength="1000" />
              </label>
            </section>

            <section className="contact-section">
              <div className="contact-heading">
                <div className="contact-icon"><Phone size={21} weight="light" /></div>
                <div>
                  <span className="section-number">Liên hệ khi cần</span>
                  <h2>LUSH có thể gọi cho bạn chứ?</h2>
                  <p>Chúng mình chỉ liên hệ để trao đổi thêm về trải nghiệm này.</p>
                </div>
              </div>
              <div className="contact-grid">
                <label className="input-group">
                  <span>Tên của bạn</span>
                  <input type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Bạn muốn được gọi là gì?" autoComplete="name" maxLength="80" />
                </label>
                <label className="input-group">
                  <span>Số điện thoại</span>
                  <input className={fieldErrors.phone ? 'has-error' : ''} type="tel" value={phone} onChange={(event) => { setPhone(event.target.value.replace(/\D/g, '')); setFieldErrors((current) => ({ ...current, phone: '' })) }} placeholder="Nhập số điện thoại" autoComplete="tel" inputMode="numeric" pattern="[0-9]*" />
                  {fieldErrors.phone ? <small className="field-error">{fieldErrors.phone}</small> : null}
                </label>
              </div>
              <label className="input-group store-group">
                <span>Cửa hàng bạn đã ghé</span>
                <select value={store} onChange={(event) => setStore(event.target.value)}>
                  {storeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className={`consent-row ${fieldErrors.consent ? 'has-error' : ''}`}>
                <input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); setFieldErrors((current) => ({ ...current, consent: '' })) }} />
                <span className="consent-mark" aria-hidden="true">{consent ? <Check size={13} weight="bold" /> : null}</span>
                <span>Tôi đồng ý để LUSH lưu thông tin và liên hệ với tôi về phản hồi này.</span>
              </label>
              {fieldErrors.consent ? <p className="field-error consent-error">{fieldErrors.consent}</p> : null}
              {status === 'error' ? <div className="submit-error" role="alert">{errorMessage}</div> : null}
              <div className="submit-row">
                <p>Thông tin của bạn được bảo mật và chỉ dùng cho mục đích chăm sóc trải nghiệm.</p>
                <button className="submit-button" type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? <span className="button-loader" aria-hidden="true" /> : <ArrowRight size={18} weight="bold" />}
                  {status === 'submitting' ? 'Đang gửi…' : 'Gửi đánh giá'}
                </button>
              </div>
            </section>
          </form>
        )}
      </section>

      <footer className="footer page-width">
        <span>LUSH — fresh handmade cosmetics</span>
        <span>Thank you for helping us grow.</span>
      </footer>
    </main>
  )
}

export default App
