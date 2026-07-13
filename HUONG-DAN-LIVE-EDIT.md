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

> 🔧 3 trang `Marketing.html`, `Dieu-hanh.html`, `Sales.html` trước đây có sẵn các
> công cụ chỉnh sửa cũ tự chế (mỗi trang một kiểu) — đã được **gỡ bỏ** để tránh
> xung đột/trùng thanh công cụ. Riêng `Sales.html` có ràng buộc đặc biệt (hàm khởi
> tạo hiệu ứng nằm trong code editor cũ) nên đã được **giữ lại lời gọi khởi tạo**
> để trang vẫn chạy hiệu ứng bình thường. Nay cả 6 trang dùng chung một bộ Live
> Edit thống nhất.

Dòng đã được chèn tự động vào cuối mỗi trang (ngay trước `</body>`):

```html
<!-- Live Edit (chỉ hiện khi mở kèm ?edit) -->
<script src="live-edit.js"></script>
```

Nếu sau này bạn tạo **trang mới**, chỉ cần dán đúng dòng trên vào trước `</body>`
là trang đó cũng có tính năng chỉnh sửa.

---

## 2. Cách sếp chỉnh sửa nội dung

### Bước 1 — Mở trang
**Double-click** thẳng vào file cần sửa (ví dụ `homepage.html`) để mở bằng trình
duyệt (Chrome/Edge/Firefox). **Không cần gõ gì thêm** — thanh công cụ Live Edit
tự hiện ở góc dưới bên trái.

> ⚠️ Bản này để thanh công cụ **luôn hiện** (dùng nội bộ). Nếu sau này đưa website
> cho khách xem, xem lại Mục 5 để ẩn công cụ đi.

### Bước 2 — Chọn chế độ trên thanh công cụ
Thanh công cụ có **3 chế độ** (bấm để chuyển):

| Chế độ | Dùng để |
|--------|---------|
| **👀 Xem** | Xem trang y như khách. Ở chế độ này **các nút bấm/link hoạt động bình thường** (ví dụ nút “Gửi CV ngay” sẽ mở email). |
| **✍️ Sửa chữ** | Click thẳng vào chữ để sửa nội dung (như gõ Word). |
| **🧩 Bố cục** | Chọn 1 khối rồi **kéo góc để đổi kích thước** hoặc chỉnh khoảng cách. Các khối khác **tự dồn theo**. |

### Bước 3a — Sửa chữ (chế độ ✍️ Sửa chữ)
Click vào bất kỳ đoạn chữ nào (tiêu đề, đoạn văn, nút, menu…) và gõ. Xoá/thêm/sửa thoải mái.

### Bước 3b — Chỉnh bố cục / khoảng cách (chế độ 🧩 Bố cục)
1. **Click 1 khối** bất kỳ → khối được chọn có viền vàng và hiện **tay kéo ⤡** ở góc.
2. **Kéo tay ⤡** để phóng to/thu nhỏ khối. Các khối bên dưới tự dồn lại cho vừa.
3. Hoặc dùng các nút tinh chỉnh: **Trên / Dưới** (khoảng cách ngoài), **Trong**
   (khoảng đệm bên trong), **Rộng** (chiều rộng) — mỗi cái có **−** và **＋**.
4. **⬆️ Khối cha**: nếu muốn chọn cả khung lớn bao ngoài (thay vì khối nhỏ).
5. **↺ Đặt lại khối**: trả khối đang chọn về kích thước/khoảng cách gốc.

### Bước 4 — Lưu lại (2 nút tách riêng bên phải)
| Nút | Khi nào dùng |
|-----|--------------|
| **💾 Lưu** | Lưu ngay **tại trang** (vào bộ nhớ trình duyệt). **Mở lại trang là bản của bạn tự hiện** — dùng để làm dở rồi quay lại làm tiếp. *Chỉ lưu trên máy này.* |
| **⤓ Tải xuống** | Xuất ra **file HTML** để giao kỹ thuật / thay lên hosting. Đây là bước để **cập nhật website thật**. |

> Mẹo: cứ sửa → bấm **💾 Lưu** để không mất. Khi ưng ý rồi thì bấm **⤓ Tải xuống**
> để lấy file đưa lên web.

### Bước 5 — Cập nhật lên website
Gửi file vừa **Tải xuống** cho **bộ phận kỹ thuật**, hoặc tự **thay thế** file cũ
bằng file mới. Xong!

---

## 3. Các nút trên thanh công cụ

| Nút | Tác dụng |
|-----|----------|
| **👀 Xem / ✍️ Sửa chữ / 🧩 Bố cục** | Chuyển giữa 3 chế độ (xem / sửa chữ / chỉnh bố cục). |
| **Trên · Dưới · Trong · Rộng** (chế độ Bố cục) | Tăng/giảm khoảng cách & kích thước của khối đang chọn. |
| **⬆️ Khối cha** | Chọn khung lớn bao ngoài khối hiện tại. |
| **↺ Đặt lại khối** | Trả khối đang chọn về mặc định. |
| **💾 Lưu** | Lưu tại trang (mở lại vẫn còn). Tách riêng bên phải. |
| **⤓ Tải xuống** | Xuất file HTML để cập nhật website. Tách riêng bên phải. |
| **↩️ Hoàn tác** | Quay về bản gốc ban đầu (xoá cả bản đã Lưu). |

**Tính năng an toàn tự động:**
- **Tự lưu nháp**: lỡ đóng tab, khi mở lại sẽ hỏi *“Khôi phục bản nháp?”*.
- **Cảnh báo thoát**: sửa mà chưa Lưu, đóng trang sẽ được nhắc lại.
- Khi đang **Sửa chữ / Bố cục**, click link **không nhảy trang** (tránh mất nội dung).
  Muốn thử bấm link/nút thật (mở email…) thì chuyển về **👀 Xem**.

---

## 4. Câu hỏi thường gặp

**Sửa xong mà trang gốc không đổi?**
Đúng vậy — chỉnh sửa chỉ hiển thị trên màn hình. Chỉ khi bấm **Lưu & Tải xuống**
và **thay file cũ bằng file mới** thì website thật mới đổi.

**Có sửa được khoảng cách / kích thước khối không?**
Có — dùng chế độ **🧩 Bố cục**: kéo góc khối hoặc chỉnh Trên/Dưới/Trong/Rộng.
Riêng việc **đổi ảnh và đổi màu** thì vẫn nên nhờ kỹ thuật.

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
