# LUSH service review

Trang thu thập phản hồi sau trải nghiệm tại cửa hàng LUSH, dùng React + Vite cho giao diện và Node.js + Express cho API. Các ảnh bathbomb và font trong `docs/` đã được đưa vào `public/` để giao diện dùng asset cục bộ.

## Chạy local

```bash
npm install
copy .env.example .env
npm run dev
```

Ở terminal khác, chạy API:

```bash
npm run server
```

Nếu chưa có Supabase, đặt `DEMO_MODE=true` trong `.env` để kiểm tra luồng giao diện. Dữ liệu demo chỉ được giữ trong bộ nhớ của server.

## Kết nối Supabase

1. Mở SQL Editor của project Supabase và chạy `supabase/schema.sql`.
2. Lấy chuỗi kết nối PostgreSQL pooler trong Supabase và điền vào `DATABASE_URL` trong `.env` của server.
3. Server dùng `pg.Pool`, kết nối SSL và câu lệnh SQL parameterized để ghi vào bảng `service_reviews`.
4. Mục `review_summary` là view Tổng hợp đánh giá, gồm thời gian gửi theo múi giờ Việt Nam, mức độ hài lòng, điểm ấn tượng, nội dung khách tự nhập và thông tin liên hệ.
5. Giữ `DATABASE_URL` ở server, tuyệt đối không đưa vào biến `VITE_` hoặc commit file `.env`.

## Kiểm tra production build

```bash
npm run build
```

## Deploy cùng một domain trên Vercel

Repo này có sẵn hai Vercel Functions tại `/api/health` và `/api/reviews`. Khi deploy frontend và API cùng một project Vercel, không cần đặt `VITE_API_URL`; frontend sẽ gọi API bằng đường dẫn tương đối `/api/reviews`.

Trong Vercel → Project Settings → Environment Variables, đặt cho Production:

```env
DATABASE_URL=<chuỗi kết nối Supabase PostgreSQL>
DATABASE_SSL=true
CLIENT_ORIGIN=https://lushcustomerservice.vercel.app
DEMO_MODE=false
```

Nếu đang có `VITE_API_URL=http://localhost:3001` trên Vercel, hãy xóa biến đó rồi redeploy. Các biến Vite được đưa vào frontend ở bước build, nên thay đổi env cần một deployment mới.
