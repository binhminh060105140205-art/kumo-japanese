# Kumo Japanese

Web app học từ vựng tiếng Nhật lấy cảm hứng từ Quizlet, được tổ chức theo module để dễ mở rộng.

## Chạy dự án

```powershell
npm install
npm run dev
```

Mở địa chỉ Vite hiện trong terminal, thường là `http://localhost:5173`.

## Cấu trúc

- `src/data/`: dữ liệu từ vựng đã chuẩn hóa từ nguồn JPD kỳ 5 và cấu hình bộ lọc.
- `src/app/`: app controller, router, store và phiên luyện tập.
- `src/screens/`: các màn hình Dashboard, Thư viện, Luyện tập, Thống kê, Cài đặt.
- `src/components/`: shell chung, mode card và các component của từng chế độ học.
- `src/services/`: tích hợp Web Speech API để nghe phát âm tiếng Nhật.
- `src/styles/`: CSS được chia theo token, layout, component, screen, practice và responsive.

## Chức năng hiện có

- Dashboard với streak, tiến độ khóa học, mục tiêu hàng ngày và từ cần ôn.
- Bài kiểm tra hàng ngày gồm 5 từ chọn ngẫu nhiên từ toàn bộ kho, có cả chữ Hán; hoàn thành đủ 5 câu sẽ cộng 1 ngày vào chuỗi.
- Thẻ ghi nhớ: lật thẻ, nghe phát âm, dùng `Space` để lật, `←` để chọn chưa nhớ và `→` để chọn đã nhớ; hệ thống luôn hiển thị hết các từ chưa xuất hiện trong vòng hiện tại trước, rồi mới ôn lại các từ chưa nhớ.
- Trắc nghiệm 4 đáp án, hỗ trợ phím `1–4`.
- Gõ cách đọc bằng romaji, hiragana hoặc kanji.
- Ghép cặp từ tiếng Nhật với nghĩa tiếng Việt.
- Thư viện tìm kiếm, lọc theo bài, nghe phát âm, thêm từ mới.
- Thống kê, cài đặt âm thanh/romaji, đổi theme sáng tối.
- Tiến độ học được lưu tự động trong `localStorage`.

## Nạp lại dữ liệu từ thư mục JPD kỳ 5

File dữ liệu web được tạo từ `D:\KY5\JPD\99_LUU_TRU_FILE_CU\03_FILE_TRUNG_GIAN_KY_THUAT\mizu_vocab_text.txt` và `handbook_data.json`. Khi dữ liệu nguồn thay đổi, chạy:

```powershell
node scripts/import-jpd-data.mjs
npm run build
```

Script tạo lại `src/data/jpd-vocabulary.json`, gồm các trường bài, loại từ, chữ Nhật, cách đọc, nghĩa và từ gốc. Các nhóm trong Thư viện là `Động từ`, `Tính từ`, `Danh từ`, `Chữ Hán` và `Khác`.
