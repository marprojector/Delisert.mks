# Panduan Admin Delisert

Panduan ini untuk pemilik bisnis. Tidak perlu pengetahuan teknis.

---

## 1. Masuk ke halaman admin

1. Buka `https://<domain-anda>/admin` di browser.
2. Anda akan diarahkan ke halaman **Masuk**.
3. Ketik kata sandi admin, lalu tekan **Masuk**.

Sesi berlaku **12 jam**. Setelah itu Anda otomatis diminta masuk lagi. Ini
normal dan bukan tanda ada masalah.

> **Kalau lupa kata sandi:** kata sandi disimpan di pengaturan server, bukan di
> website. Hubungi pengembang untuk menggantinya.

---

## 1b. Navigasi admin

- **Di komputer:** menu ada di sisi kiri, dikelompokkan:
  - **Utama** — Ringkasan, Analitik
  - **Katalog** — Produk (dengan jumlah produk), Kategori
  - **Website** — Konten website, MCP & asisten AI
  - **Lihat website** dan **Keluar** ada di bagian bawah.
- **Di HP:** tab di bawah layar — Ringkasan, Produk, Konten, Analitik, dan
  **Lainnya** (membuka menu lengkap).

Kalau salah kata sandi, pesan error menyebut sisa percobaan. Setelah 5 kali
salah, login dikunci 15 menit.

---

## 2. Halaman Ringkasan

Setelah masuk, halaman pertama menampilkan:

- **Pengunjung · 7 hari** dan **Tayangan halaman**, dengan persentase naik/turun
  dibanding minggu sebelumnya (dari Cloudflare Web Analytics).
- **Produk dijual** — produk yang tidak habis dari total produk.
- **Perlu perhatian** — jumlah produk habis + produk tanpa foto. Berwarna emas
  selama masih ada yang perlu dibereskan.
- **Grafik pengunjung** 7 hari terakhir dan **Aktivitas terbaru** — setiap
  perubahan tercatat, termasuk siapa yang mengubah (Admin atau asisten AI lewat MCP).
- **Kesehatan katalog**, **Halaman paling dilihat**, dan **Pintasan** ke
  tugas yang sering dilakukan.

## 2b. Analitik

Menu **Analitik** menampilkan pengunjung dan tayangan per hari (7, 30, atau 90
hari), halaman teratas, situs asal pengunjung, negara, dan jenis perangkat.
Arahkan kursor atau sentuh batang grafik untuk melihat angkanya; tombol
**Lihat sebagai tabel** menampilkan semua angka. Data tidak memakai cookie,
jadi website tidak perlu banner persetujuan.

---

## 3. Menambah produk baru

1. Buka tab **Produk**, lalu klik **Tambah produk**.
2. Isi kolom berikut:

| Kolom | Keterangan |
|---|---|
| **Nama produk** | Nama yang dilihat pelanggan, mis. `Mochi Stroberi`. |
| **Slug URL** | Alamat halaman produk, huruf kecil dan tanda hubung. Mis. `mochi-stroberi` menjadi `/menu/mochi-stroberi`. |
| **Kategori** | Pilih dari daftar. Kategori baru belum bisa ditambah dari sini. |
| **Harga (rupiah)** | **Tulis angka rupiah utuh.** Untuk Rp 8.000 tulis `8000`, bukan `80` dan bukan `800000`. Di bawah kolom akan muncul pratinjau harga supaya Anda bisa memeriksa. |
| **Ketersediaan** | Tersedia / Pre-Order / Habis. |
| **Deskripsi** | Penjelasan singkat produk. |
| **Foto produk** | Unggah JPG, PNG, atau WebP. Foto otomatis dikecilkan dan dikompres sebelum diunggah, jadi foto langsung dari kamera HP tidak masalah. |
| **Alt text foto** | Kalimat singkat yang dibacakan untuk pembaca layar, mis. `Mochi stroberi Delisert Makassar`. |
| **Produk unggulan** | Nyalakan sakelar agar muncul di beranda. |

Di HP, kolom **Kategori, deskripsi, slug** dilipat. Ketuk **Buka** untuk
mengisinya.

3. Bar gelap **Simpan perubahan** muncul di bawah layar. Klik untuk menyimpan.
   Produk langsung tampil di halaman Menu.

> **Harga:** kosongkan kolom harga **hanya** jika harga memang belum
> ditentukan. Produk seperti itu akan tampil "Harga menyusul" — jangan
> dikosongkan karena lupa.

---

## 4. Mengubah produk

1. Buka tab **Produk**. Gunakan kotak **Cari nama produk** atau filter
   **Tersedia / Pre-Order / Habis** untuk menemukan produk lebih cepat.
2. Klik **Ubah** (di HP: ketuk kartunya).
3. Begitu ada yang diubah, bar **"Ada perubahan yang belum disimpan"** muncul
   di bawah layar. Klik **Simpan perubahan**, atau **Batal** untuk
   mengembalikan isian semula.

Perubahan langsung terlihat di website.

---

## 5. Menandai produk habis

Cara tercepat (di komputer): di tab **Produk**, ubah pilihan di kolom
**Ketersediaan** langsung dari tabel. Perubahan tersimpan saat itu juga.

Cara lain: buka produk → pilih **Habis** di bagian **Ketersediaan** → **Simpan
perubahan**.

Produk tetap ada di katalog tetapi diberi tanda "Habis" dengan teks dan ikon,
bukan hanya warna. Pelanggan tetap bisa melihat produknya.

---

## 5a. Mengelola varian rasa

Rasa (mis. Matcha Oreo, Lotus Biscoff) diatur terpisah dari ukuran karena
tidak mengubah harga. Buka produk yang sudah tersimpan, lalu bagian
**Varian rasa**:

- Ketik nama rasa lalu **Tambah rasa**. Langsung tersimpan.
- Panah ↑/↓ mengubah urutan tampil.
- Matikan sakelar bila rasa sedang habis: rasa tetap tampil dengan tulisan
  "Habis" dan tidak bisa dipilih.
- Tanda × menghapus rasa.

Pelanggan melihat rasa sebagai pilihan di halaman produk dan sebagai ringkasan
di kartu menu. Rasa yang dipilih ikut tertulis di pesan WhatsApp, mis.
"Artisanal Mochi Daifuku (Isi 4 pcs, rasa Matcha Oreo)".

## 5b. Mengelola varian ukuran & harga

Varian hanya bisa dikelola pada produk yang **sudah tersimpan**. Buka produk,
lalu gulir ke bagian **Varian ukuran & harga**.

- **Tambah varian** — isi nama (mis. `Isi 4 pcs`) dan harga rupiah utuh, lalu
  klik **+ Tambah varian**. Perubahan langsung tersimpan, tidak perlu klik
  Simpan.
- **Sakelar tersedia** — matikan sakelar di samping varian bila varian itu
  habis. Varian tetap tampil di halaman produk dengan tulisan "Habis" dan
  tidak bisa dipilih pelanggan.
- **Hapus** — menghapus varian dari produk. Riwayat pesanan lama tidak
  terpengaruh karena pesanan berjalan lewat WhatsApp.

Contoh produk dengan varian: **Mochi** punya `1 Pcs` Rp 8.000, `Isi 4 pcs`
Rp 30.000, dan `Isi 8 pcs` Rp 50.000. Kalau semua varian seharga, halaman
produk menampilkan satu harga saja, bukan rentang.

## 6. Mengganti foto produk

1. Buka produk → bagian **Foto produk**.
2. Klik kotak **Tarik foto ke sini atau pilih file** (atau tarik foto dari
   komputer ke kotak itu). Kalau produk sudah punya foto, bisa juga klik
   **Ganti foto** di pojok foto.
3. Tunggu sampai tulisan **Mengunggah…** hilang dan pratinjau foto muncul.
4. Klik **Simpan perubahan** di bar bawah.

Website otomatis membuat beberapa ukuran foto (480, 960, dan 1600 px, format
WebP) supaya halaman cepat dibuka di HP. Foto lama otomatis dihapus dari
penyimpanan saat diganti atau saat produknya dihapus.

Kalau foto gagal diunggah, pesan kesalahan akan muncul. Penyebab umum: format
bukan JPG/PNG/WebP, atau sesi admin sudah berakhir (keluar lalu masuk lagi).
Di browser yang sangat lama, foto diunggah apa adanya dan batasnya 5 MB.

---

## 7. Menghapus produk

1. Buka tab **Produk**.
2. Klik **Hapus** di baris produk.
3. Konfirmasi pada kotak dialog.

> **Perhatian:** menghapus produk membuat halamannya hilang dari website dan
> dari hasil pencarian Google. Kalau produk hanya sedang tidak dijual,
> **tandai Habis** saja — jangan dihapus.

---

## 8. Setelah mengubah apa pun

Buka website di tab lain dan muat ulang halaman untuk memastikan perubahan
sudah benar. Halaman detail produk yang sudah pernah dibuka mungkin masih
menampilkan versi lama selama beberapa menit — ini normal.

---

## 9. Konten website

Menu **Konten website** mengatur teks dan foto di luar katalog. Pilih bagian
di kiri (di HP: di atas), ubah isinya, lalu klik **Simpan perubahan** di bar
bawah. Perubahan langsung tampil di website.

- **Brand & kontak** — nomor WhatsApp (dipakai semua tombol pesan), akun
  Instagram/TikTok, kalimat footer, dan **pita pengumuman** di atas semua
  halaman (nyalakan, isi teks, opsional tautan).
- **Beranda** — judul besar, kalimat pendukung, sampai 3 foto pembuka, judul
  Menu Andalan, serta tampil/sembunyikan ubin kategori dan kotak cerita.
- **Jadwal & lokasi** — jenis tiap hari (Live / CFD / Libur), jam TikTok Live,
  jam dan titik CFD, alamat operasional.
- **Tentang** — judul, foto, cerita, angka, dan langkah "Cara kerja kami".
- **Kontak** — langkah cara pesan, instruksi pengambilan, layanan antar.

**Kembalikan ke bawaan** mengembalikan satu bagian ke isi awal website.

## 9b. Kategori

Menu **Kategori**: tambah, ganti nama, ubah urutan (↑/↓), dan sembunyikan
kategori (sakelar). Kategori yang disembunyikan menyembunyikan semua produknya
dari website. Kategori yang masih dipakai produk tidak bisa dihapus.

## 9c. MCP & asisten AI

Menu **MCP & asisten AI** menghubungkan Claude (atau asisten lain yang
mendukung MCP) ke katalog, supaya bisa mengelola website lewat perintah
seperti "Tandai Mille Crepes rasa Red Velvet sedang habis".

1. Isi nama koneksi, pilih hak akses (**Hanya baca** atau **Baca & ubah**),
   klik **Buat token**.
2. **Salin token sekarang** — token hanya ditampilkan sekali.
3. Pilih aplikasi (Claude Code, Claude Desktop, atau claude.ai) dan ikuti
   petunjuk yang muncul.

Semua perubahan lewat MCP tercatat di Aktivitas dengan nama koneksinya. Klik
**Cabut** untuk memutus koneksi kapan saja.

---

## 10. Batasan yang perlu diketahui

- **Harga dan ketersediaan adalah tanggung jawab Anda.** Website tidak
  terhubung ke sistem stok. Kalau produk habis di dunia nyata tetapi masih
  "Tersedia" di website, pelanggan akan kecewa.
- **Tidak ada pembayaran daring.** Semua pesanan tetap melalui WhatsApp.
- **Foto yang diunggah langsung publik.** Jangan unggah foto yang belum ingin
  dilihat pelanggan.
