import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle,
  ChatCircleDots,
  Heart,
  MapPin,
  Package,
  Smiley,
  Sparkle,
  Storefront,
} from '@phosphor-icons/react'
import { submitReview } from './lib/api.js'

const ratingOptions = [
  {
    value: 1,
    label: 'Chưa sủi bọt',
    english: 'Barely fizzing',
    image: '/bathbombs/lush-rating-deep-blue-cutout.png',
    alt: 'Bath bomb LUSH màu xanh dương đậm, nền trong suốt',
  },
  {
    value: 2,
    label: 'Sủi nhẹ',
    english: 'A little fizz',
    image: '/bathbombs/lush-rating-blue-pink-cutout.png',
    alt: 'Bath bomb LUSH màu xanh dương với các dải màu hồng và vàng, nền trong suốt',
  },
  {
    value: 3,
    label: 'Vừa đủ thơm',
    english: 'Just right',
    image: '/bathbombs/lush-rating-white-pink-cutout.png',
    alt: 'Bath bomb LUSH màu trắng với họa tiết hồng, nền trong suốt',
  },
  {
    value: 4,
    label: 'Sủi tưng bừng',
    english: 'Full of fizz',
    image: '/bathbombs/lush-rating-pink-cyan-cutout.png',
    alt: 'Bath bomb LUSH màu hồng và xanh ngọc, nền trong suốt',
  },
  {
    value: 5,
    label: 'Bung lụa cả bồn',
    english: 'Bath-tastic!',
    image: '/bathbombs/lush-rating-yellow-pink-cutout.png',
    alt: 'Bath bomb LUSH màu vàng với các dải màu hồng và cam, nền trong suốt',
  },
]

const impressionOptions = [
  { id: 'consultation', label: 'Được tư vấn tận tình', english: 'Thoughtful consultation', note: 'Nhân viên hiểu nhu cầu và gợi ý sản phẩm phù hợp với bạn', Icon: ChatCircleDots },
  { id: 'demo', label: 'Được trải nghiệm, demo sản phẩm', english: 'Product demo experience', note: 'Được thử trực tiếp trên tay, trên da hoặc với nước', Icon: Sparkle },
  { id: 'team', label: 'Nhân viên thân thiện, nhiệt tình', english: 'Friendly, welcoming staff', note: 'Chào đón niềm nở, tạo cảm giác thoải mái', Icon: Smiley },
  { id: 'space', label: 'Không gian cửa hàng dễ chịu', english: 'Pleasant store atmosphere', note: 'Mùi hương, màu sắc, gọn gàng và sạch sẽ', Icon: Storefront },
  { id: 'product-range', label: 'Sản phẩm đa dạng, dễ chọn', english: 'A varied, easy-to-shop range', note: 'Có đủ sản phẩm bạn cần, dễ tìm', Icon: Package },
  { id: 'checkout', label: 'Thanh toán nhanh gọn', english: 'Quick, easy checkout', note: 'Không phải chờ lâu, được hướng dẫn rõ ràng', Icon: CheckCircle },
  { id: 'other', label: 'Khác', english: 'Other', note: 'Chia sẻ thêm điều bạn yêu thích', Icon: Heart },
]

const dissatisfactionOptions = [
  { label: 'Chưa được tư vấn kỹ', english: 'Not enough consultation', note: 'Chưa hiểu rõ sản phẩm hoặc chưa được gợi ý phù hợp' },
  { label: 'Chưa được trải nghiệm, demo sản phẩm', english: 'No product demo experience' },
  { label: 'Nhân viên chưa chủ động, chưa thân thiện', english: 'Staff were not proactive or friendly' },
  { label: 'Phải chờ lâu để được hỗ trợ', english: 'Waited too long for support' },
  { label: 'Không gian, vệ sinh cửa hàng chưa tốt', english: 'Store space or cleanliness' },
  { label: 'Sản phẩm mình cần đang hết hàng', english: 'Product I needed was out of stock' },
  { label: 'Thanh toán chậm hoặc chưa rõ ràng', english: 'Checkout was slow or unclear' },
  { label: 'Khác', english: 'Other' },
]

const storeOptions = [
  'LUSH Vincom Đồng Khởi',
  'LUSH Saigon Center',
  'LUSH Hùng Vương Plaza',
  'LUSH Hanoi Center',
  'LUSH Lotte Tây Hồ',
  'LUSH AEON Hà Đông',
]

const reviewQrByStore = {
  'LUSH Vincom Đồng Khởi': { src: '/review-qr/vincom-dong-khoi.png', alt: 'Mã QR viết review Google cho LUSH Vincom Đồng Khởi' },
  'LUSH Saigon Center': { src: '/review-qr/saigon-center.png', alt: 'Mã QR viết review Google cho LUSH Saigon Center' },
  'LUSH Hùng Vương Plaza': { src: '/review-qr/hung-vuong-plaza.png', alt: 'Mã QR viết review Google cho LUSH Hùng Vương Plaza' },
  'LUSH Hanoi Center': { src: '/review-qr/hanoi-center.png', alt: 'Mã QR viết review Google cho LUSH Hanoi Center' },
  'LUSH Lotte Tây Hồ': { src: '/review-qr/lotte-tay-ho.png', alt: 'Mã QR viết review Google cho LUSH Lotte Tây Hồ' },
  'LUSH AEON Hà Đông': { src: '/review-qr/aeon-ha-dong.png', alt: 'Mã QR viết review Google cho LUSH AEON Hà Đông' },
}

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

function ToggleOption({ checked, label, english, note, Icon, onChange }) {
  return (
    <label className={`toggle-option ${checked ? 'is-selected' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-mark" aria-hidden="true">
        {checked ? <Check size={15} weight="bold" /> : null}
      </span>
      <span className="toggle-icon" aria-hidden="true">
        <Icon size={22} weight="duotone" />
      </span>
      <span className="toggle-copy">
        <span className="toggle-label">{label}</span>
        <span className="toggle-english">{english}</span>
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
            className={`rating-option ${option.tone ? `rating-option--${option.tone}` : ''} ${isSelected ? 'is-selected' : ''} ${isLit ? 'is-lit' : ''}`}
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
            <span className="rating-english">{option.english}</span>
          </button>
        )
      })}
    </div>
  )
}

function SuccessState({ store }) {
  const reviewQr = reviewQrByStore[store]

  return (
    <section className="success-panel" aria-live="polite">
      <div className="success-orbit success-orbit-one" />
      <div className="success-orbit success-orbit-two" />
      <div className="success-icon">
        <CheckCircle size={38} weight="light" />
      </div>
      <h2>Cảm ơn bạn đã ghé LUSH</h2>
      <p className="success-copy">
        Nếu bạn có thời gian, một vài dòng trên Google sẽ giúp những người ghé LUSH sau bạn biết thêm về cửa hàng.
      </p>
      {reviewQr ? (
        <div className="google-review-qr">
          <span>Viết review trên Google</span>
          <img src={reviewQr.src} alt={reviewQr.alt} />
        </div>
      ) : null}
      <p className="success-note">Không bắt buộc. Bạn có thể viết bất cứ lúc nào.</p>
    </section>
  )
}

function App() {
  const [rating, setRating] = useState(0)
  const [impressions, setImpressions] = useState([])
  const [impressionNote, setImpressionNote] = useState('')
  const [dissatisfactions, setDissatisfactions] = useState([])
  const [dissatisfactionNote, setDissatisfactionNote] = useState('')
  const [store, setStore] = useState(storeOptions[0])
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [page, setPage] = useState(1)

  const todayLabel = useMemo(getTodayLabel, [])
  const currentStep = page

  function toggleValue(value, values, setValues) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  function resetForm() {
    setRating(0)
    setImpressions([])
    setImpressionNote('')
    setDissatisfactions([])
    setDissatisfactionNote('')
    setStore(storeOptions[0])
    setStatus('idle')
    setErrorMessage('')
    setFieldErrors({})
    setPage(1)
  }

  function changePage(nextPage) {
    setPage(nextPage)
    setFieldErrors({})
    setErrorMessage('')
    window.requestAnimationFrame(() => {
      document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function validatePage(pageToValidate) {
    const errors = {}
    if (pageToValidate === 1) {
      if (!rating) errors.rating = 'Bạn hãy chọn một mức độ trải nghiệm.'
      if (!impressions.length) errors.impressions = 'Bạn có thể chọn ít nhất một điểm ấn tượng.'
      if (impressions.includes('other') && !impressionNote.trim()) {
        errors.impressionNote = 'Bạn hãy chia sẻ thêm điều mình yêu thích.'
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleNext(event) {
    event.preventDefault()
    if (validatePage(1)) changePage(2)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    if (!validatePage(2)) return

    setStatus('submitting')
    try {
      await submitReview({
        rating,
        impressions,
        impressionNote: impressionNote.trim(),
        dissatisfactions,
        dissatisfactionNote: dissatisfactionNote.trim(),
        store,
      })
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  return (
    <main className="site-shell">
      <div className="ambient-art-layer" aria-hidden="true">
        <img className="ambient-art ambient-art-lime" src="/lush-elements/lime.png" alt="" />
        <img className="ambient-art ambient-art-lavender" src="/lush-elements/lavender.png" alt="" />
        <img className="ambient-art ambient-art-lemon" src="/lush-elements/lemon.png" alt="" />
        <img className="ambient-art ambient-art-tomato" src="/lush-elements/tomato.png" alt="" />
        <img className="ambient-art ambient-art-side-hero" src="/lush-elements/orange.png" alt="" />
        <img className="ambient-art ambient-art-coconut" src="/lush-elements/coconut.png" alt="" />
      </div>

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
          <p className="eyebrow"><img className="eyebrow-fruit" src="/lush-elements/strawberry.png" alt="" aria-hidden="true" /> Tell us about today</p>
          <h1><span>Để lần sau ghé LUSH</span><span>còn vui hơn nữa</span></h1>
          <p className="hero-description">
            Chia sẻ vài dòng về trải nghiệm hôm nay. Những điều nhỏ bạn nói ra giúp chúng mình chăm chút cửa hàng tốt hơn mỗi ngày.
          </p>
          <div className="hero-stamp" aria-label="Thông tin khảo sát">
            <div className="stamp-icon"><Heart size={22} weight="fill" /></div>
            <div>
              <span className="stamp-kicker">Quà nhỏ cho bạn</span>
              <span className="stamp-copy">Hoàn thành trong 1 phút, nhận ngay mẫu thử LUSH tại quầy</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Các bath bomb của LUSH">
          <div className="hero-note hero-note-top">made with care <ArrowUpRight size={15} /></div>
          <img className="hero-bomb hero-bomb-back" src="/bathbombs/bathbomb-white-cutout.png" alt="Bath bomb LUSH màu trắng hồng" />
          <img className="hero-bomb hero-bomb-main" src="/bathbombs/bathbomb-pink-lilac-cutout.png" alt="Bath bomb LUSH màu hồng tím" />
          <img className="hero-bomb hero-bomb-small" src="/bathbombs/bathbomb-rose-cutout.png" alt="Bath bomb LUSH màu hồng" />
          <div className="hero-note hero-note-bottom">one bath at a time</div>
        </div>
      </section>

      <section className="review-layout page-width" id="review-form">
        <aside className="review-aside">
          <div className="step-heading">
            <span className="step-current">0{currentStep}</span>
            <span className="step-total">/ 02</span>
          </div>
          <div className="step-line"><span style={{ width: `${(currentStep / 2) * 100}%` }} /></div>
          <p className="aside-kicker">Một chút thời gian của bạn</p>
          <h2><span>Để LUSH</span><span>lắng nghe thật kỹ</span></h2>
          <p className="aside-copy">Bạn không cần viết dài. Một lựa chọn cũng đủ để chúng mình hiểu điều gì đang làm nên một ngày thật vui tại cửa hàng.</p>
          <div className="aside-location"><MapPin size={17} weight="fill" /><span>Feedback của bạn sẽ được gửi riêng đến đội ngũ LUSH.</span></div>
        </aside>

        {status === 'success' ? (
          <SuccessState store={store} />
        ) : (
          <form className="review-form" onSubmit={page === 1 ? handleNext : handleSubmit} noValidate>
            {page === 1 ? (
              <>
                <section className="form-section rating-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-number">01 / 02</span>
                      <h2>Hôm nay bạn “thả” cho LUSH mấy viên bath bomb?</h2>
                      <span className="question-english">How many bath bombs would you give us today?</span>
                    </div>
                    <span className="required-note">Bắt buộc</span>
                  </div>
                  <p className="section-helper">Hãy chọn số viên gần nhất với cảm nhận của bạn.</p>
                  <RatingSelector rating={rating} onChange={(value) => { setRating(value); setFieldErrors((current) => ({ ...current, rating: '' })) }} />
                  {fieldErrors.rating ? <p className="field-error">{fieldErrors.rating}</p> : null}
                </section>

                <section className="form-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-number">Điểm hài lòng</span>
                      <h2>Điều gì khiến bạn thấy vui khi ghé LUSH hôm nay?</h2>
                      <span className="question-english">What made your visit special today?</span>
                    </div>
                    <span className="required-note">Chọn nhiều</span>
                  </div>
                  <p className="section-helper">Chọn một hoặc vài điều bạn thích nhất.</p>
                  <div className="option-list">
                    {impressionOptions.map((option) => (
                      <ToggleOption
                        key={option.id}
                        checked={impressions.includes(option.id)}
                        label={option.label}
                        english={option.english}
                        note={option.note}
                        Icon={option.Icon}
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
                      <span>
                        Bạn muốn chia sẻ thêm điều gì bạn yêu thích?
                        <small>Would you like to share anything else you enjoyed?</small>
                      </span>
                      <textarea
                        className={fieldErrors.impressionNote ? 'has-error' : ''}
                        value={impressionNote}
                        onChange={(event) => {
                          setImpressionNote(event.target.value)
                          setFieldErrors((current) => ({ ...current, impressionNote: '' }))
                        }}
                        placeholder="Chia sẻ thêm điều bạn yêu thích…"
                        rows="3"
                        maxLength="1000"
                      />
                      {fieldErrors.impressionNote ? <small className="field-error">{fieldErrors.impressionNote}</small> : null}
                    </label>
                  ) : null}
                </section>

                <div className="form-navigation">
                  <p>Trang 1 trong 2 · Bạn có thể quay lại chỉnh sửa.</p>
                  <button className="submit-button" type="submit">
                    Tiếp tục <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <section className="form-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-number">02 / 02</span>
                      <h2>Có điều gì LUSH có thể làm tốt hơn không?</h2>
                      <span className="question-english">Is there anything we could do better?</span>
                    </div>
                    <span className="optional-note">Không bắt buộc</span>
                  </div>
                  <p className="section-helper">
                    <span>Bạn có thể chọn một hoặc vài mục, hoặc bỏ qua nếu hôm nay mọi thứ đều ổn.</span>
                    <span className="section-helper-english">You may select one or more options, or skip this section if everything felt just right today.</span>
                  </p>
                  <div className="chip-list">
                    {dissatisfactionOptions.map((option) => {
                      const checked = dissatisfactions.includes(option.label)
                      return (
                        <label className={`choice-chip ${checked ? 'is-selected' : ''}`} key={option.label}>
                          <input type="checkbox" checked={checked} onChange={() => toggleValue(option.label, dissatisfactions, setDissatisfactions)} />
                          <span className="choice-chip-copy">
                            <span>{option.label}</span>
                            <span className="choice-chip-english">{option.english}</span>
                            {option.note ? <span className="choice-chip-note">{option.note}</span> : null}
                          </span>
                          {checked ? <Check size={14} weight="bold" /> : null}
                        </label>
                      )
                    })}
                  </div>
                  <label className="input-group note-group">
                    <span>
                      Chia sẻ thêm nếu bạn muốn (không bắt buộc)
                      <small>Share anything else if you wish (optional)</small>
                    </span>
                    <textarea value={dissatisfactionNote} onChange={(event) => setDissatisfactionNote(event.target.value)} placeholder="Một góp ý nhỏ cũng giúp chúng mình thay đổi lớn…" rows="3" maxLength="1000" />
                  </label>
                </section>

                <section className="store-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-number">Địa điểm trải nghiệm</span>
                      <h2>Bạn đã ghé cửa hàng nào hôm nay?</h2>
                      <span className="question-english">Which LUSH store did you visit today?</span>
                    </div>
                    <span className="required-note">Bắt buộc</span>
                  </div>
                  <p className="section-helper">Chọn cửa hàng để LUSH hiểu rõ hơn về trải nghiệm của bạn.</p>
                  <label className="input-group store-group">
                    <span>Cửa hàng đã ghé <small>Store visited</small></span>
                    <select value={store} onChange={(event) => setStore(event.target.value)}>
                      {storeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  {status === 'error' ? <div className="submit-error" role="alert">{errorMessage}</div> : null}
                  <div className="submit-row">
                    <p>Cảm ơn bạn đã dành thời gian chia sẻ trải nghiệm cùng LUSH.</p>
                    <div className="navigation-actions">
                      <button className="back-button" type="button" onClick={() => changePage(1)}>
                        <ArrowLeft size={18} weight="bold" /> Quay lại
                      </button>
                      <button className="submit-button" type="submit" disabled={status === 'submitting'}>
                        {status === 'submitting' ? <span className="button-loader" aria-hidden="true" /> : <ArrowRight size={18} weight="bold" />}
                        {status === 'submitting' ? 'Đang gửi…' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}
          </form>
        )}
      </section>

      <section className="closing-art" aria-hidden="true">
        <img className="closing-art-background" src="/lush-elements/lush-fruit-background.png" alt="" />
      </section>

      <footer className="footer page-width">
        <span>LUSH — fresh handmade cosmetics</span>
        <span>Thank you for helping us grow.</span>
      </footer>
    </main>
  )
}

export default App
