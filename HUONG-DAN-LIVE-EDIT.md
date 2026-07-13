# 📝 Hướng dẫn Live Edit — Tự sửa nội dung website (không cần biết code)

Giải pháp này giúp **sếp/người không rành kỹ thuật** tự chỉnh sửa chữ trên các
trang web bằng cách **click thẳng vào chữ để sửa**, rồi bấm một nút để **tải về
file HTML mới**. Không cần cài phần mềm, không cần internet.

---

## 1. File có sẵn

| File | Vai trò |
|------|---------|
| `live-edit.js` | Bộ máy chỉnh sửa (đã tạo sẵn). |
| `homepage.html`, `Sales.html`, `Marketing.html`, `Dieu-hanh.html`, `Phuc-loi.html`, `vi-tri-tuyen-dung.html` | Các trang web — **đã được gắn sẵn** dòng gọi `live-edit.js`. |

> ⚠️ Luôn giữ `live-edit.js` **nằm chung thư mục** với các file `.html`.

Dòng đã được chèn tự động vào cuối mỗi trang (ngay trước `</body>`):

```html
<!-- Live Edit (chỉ hiện khi mở kèm ?edit) -->
<script src="live-edit.js"></script>
```

Nếu sau này bạn tạo **trang mới**, chỉ cần dán đúng dòng trên vào trước `</body>`
là trang đó cũng có tính năng chỉnh sửa.

---

## 2. Cách sếp chỉnh sửa nội dung — 5 bước

### Bước 1 — Mở trang ở chế độ chỉnh sửa
Thêm `?edit` vào cuối địa chỉ trang rồi mở bằng trình duyệt (Chrome/Edge/Firefox):

```
homepage.html?edit
Sales.html?edit
Marketing.html?edit
```

- Nếu xem trên **máy tính có sẵn file**: mở file HTML, rồi bấm vào thanh địa chỉ
  và thêm `?edit` vào cuối, Enter.
- Nếu website **đã đưa lên mạng**: mở đường link trang và thêm `?edit` vào cuối.

> Khách vào xem website bình thường (không có `?edit`) sẽ **không thấy** gì cả —
> công cụ chỉ hiện cho người biết mẹo `?edit`.

### Bước 2 — Bấm nút **“✏️ Bật chỉnh sửa”**
Thanh công cụ màu đen nằm ở **góc dưới bên trái** màn hình. Sau khi bấm, mọi dòng
chữ sửa được sẽ có **viền nét đứt màu xanh**.

### Bước 3 — Click vào chữ và sửa
Click vào bất kỳ đoạn chữ nào (tiêu đề, đoạn văn, nút, menu…) và gõ như gõ Word.
Có thể xoá, thêm, sửa thoải mái.

### Bước 4 — Bấm **“💾 Lưu & Tải xuống”**
Trình duyệt sẽ tải về một **file HTML mới cùng tên** (ví dụ `homepage.html`) đã
chứa nội dung vừa sửa. File nằm trong thư mục **Downloads/Tải xuống**.

### Bước 5 — Cập nhật lên website
Gửi file vừa tải cho **bộ phận kỹ thuật**, hoặc tự **thay thế** file cũ bằng file
mới (đưa lên hosting / thư mục website). Xong!

---

## 3. Các nút trên thanh công cụ

| Nút | Tác dụng |
|-----|----------|
| **✏️ Bật chỉnh sửa** | Cho phép click vào chữ để sửa. Bấm lại (**⏸️ Tắt chỉnh sửa**) để xem thử như khách. |
| **💾 Lưu & Tải xuống** | Tải về file HTML mới đã sửa. |
| **↩️ Hoàn tác tất cả** | Quay về nội dung gốc ban đầu (huỷ mọi thay đổi). |

**Tính năng an toàn tự động:**
- **Tự lưu nháp**: nếu lỡ đóng tab, khi mở lại (kèm `?edit`) sẽ hỏi *“Khôi phục
  bản nháp?”* để không mất công.
- **Cảnh báo thoát**: nếu sửa mà chưa bấm Lưu, đóng trang sẽ được nhắc lại.
- Khi đang chỉnh sửa, **click vào link sẽ không nhảy trang** (để tránh mất nội dung).

---

## 4. Câu hỏi thường gặp

**Sửa xong mà trang gốc không đổi?**
Đúng vậy — chỉnh sửa chỉ hiển thị trên màn hình. Chỉ khi bấm **Lưu & Tải xuống**
và **thay file cũ bằng file mới** thì website thật mới đổi.

**Có sửa được ảnh, màu, bố cục không?**
Công cụ này tập trung cho **văn bản (chữ)** — an toàn, khó làm hỏng giao diện.
Việc đổi ảnh/màu/bố cục vẫn nên nhờ kỹ thuật.

**Không thấy thanh công cụ?**
Kiểm tra địa chỉ đã có `?edit` ở cuối chưa, và `live-edit.js` có nằm cùng thư mục
với file HTML không.

**Có ảnh hưởng người xem website không?**
Không. Khi mở bình thường (không `?edit`), file chạy y như cũ, không hiện gì thêm.

---

## 5. Tuỳ chỉnh cho kỹ thuật viên (không bắt buộc)

Mở `live-edit.js`, phần `CONFIG` ở đầu file:

```js
var CONFIG = {
  activation: 'query',   // 'query' = chỉ hiện khi có ?edit  |  'always' = luôn hiện
  queryFlag: 'edit',     // đổi từ khoá kích hoạt, ví dụ 'suachua' -> ...html?suachua
  autosave: true         // true = tự lưu nháp vào trình duyệt
};
```

- Muốn từ khoá bí mật hơn: đổi `queryFlag` thành chuỗi khó đoán (ví dụ `'sua2026'`),
  khi đó link chỉnh sửa là `homepage.html?sua2026`.
- Bản nội bộ (không public): đặt `activation: 'always'` để thanh công cụ luôn hiện.
