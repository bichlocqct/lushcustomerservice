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
4. Giữ `DATABASE_URL` ở server, tuyệt đối không đưa vào biến `VITE_` hoặc commit file `.env`.

## Kiểm tra production build

```bash
npm run build
```
