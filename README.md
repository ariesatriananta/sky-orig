## Sistem Manajemen Rental (sky-orig)

Aplikasi web sederhana untuk manajemen penyewaan barang: kategori, barang, penyewaan, pengembalian, dan laporan dasar. Proyek ini berjalan murni di browser menggunakan `localStorage` — tidak membutuhkan backend.

### Fitur
- Login sederhana (akun demo: `admin` / `admin123`)
- Manajemen kategori dan barang
- Opsi harga fleksibel per barang
- Pencatatan penyewaan dan pengembalian
- Ringkasan dashboard dan grafik sederhana
- Invoice/receipt cetak di browser

### Menjalankan
- Buka `index.html` langsung di browser atau via server lokal (mis. XAMPP).
- Akun demo: `admin` / `admin123`.
- Auto-login opsional: tambahkan query string `?username=admin&password=admin123`.

### Struktur
- `index.html` — markup aplikasi
- `styles.css` — gaya UI
- `script.js` — logika aplikasi (CRUD, dashboard, invoice)

### Catatan
- Data disimpan di `localStorage` pada browser Anda.
- Tidak ada dependensi Node/PHP; `.gitignore` disiapkan untuk skenario umum bila ditambahkan nanti.

### Git
```
# inisialisasi repo sudah dilakukan dan branch default: main
# set remote (sudah diset di lokal jika mengikuti instruksi di akhir)
# push pertama kali:

git push -u origin main
```

### Lisensi
Internal/non-licensed pada tahap awal. Tambahkan lisensi sesuai kebutuhan sebelum publik.

