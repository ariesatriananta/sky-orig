# TODO: Perbaikan Form addCategoryModal dan Konsistensi ID

## Tugas Utama
- [x] Perbaiki form addCategoryModal agar dapat menyimpan data ke localStorage
- [x] Perbaiki inkonsistensi ID di script.js untuk form return

## Langkah-langkah Perbaikan

### 1. Tambahkan Event Listener untuk Form Submissions
- [x] Tambahkan event listener untuk `addCategoryForm` di DOMContentLoaded
- [x] Tambahkan event listener untuk `addItemForm`
- [x] Tambahkan event listener untuk `addRentalForm`
- [x] Tambahkan event listener untuk `addReturnForm`

### 2. Perbaiki ID Inconsistency untuk Return Form
- [x] Ubah 'returnForm' menjadi 'addReturnForm' di `showAddReturnModal()`
- [x] Ubah 'returnForm' menjadi 'addReturnForm' di `editReturn()`
- [x] Ubah 'returnDiscount' menjadi 'discount' di `calculateFinalCost()`
- [x] Ubah 'returnDiscount' menjadi 'discount' di `showAddReturnModal()`
- [x] Ubah 'returnDiscount' menjadi 'discount' di `editReturn()`
- [x] Ubah 'returnDiscount' menjadi 'discount' di `saveReturn()`

### 3. Testing
- [ ] Test penambahan kategori baru
- [ ] Test pengeditan kategori
- [ ] Test form return dengan diskon
- [ ] Verifikasi data tersimpan di localStorage
