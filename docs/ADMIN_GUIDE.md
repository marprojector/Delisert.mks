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

- **Di komputer:** menu ada di sisi kiri — **Ringkasan**, **Produk** (dengan
  jumlah produk), **Lihat website**, dan **Keluar** di bagian bawah.
- **Di HP:** menu ada di bawah layar — Ringkasan, Produk, Website, Keluar.

Kalau salah kata sandi, pesan error menyebut sisa percobaan. Setelah 5 kali
salah, login dikunci 15 menit.

---

## 2. Halaman Ringkasan

Setelah masuk, halaman pertama menampilkan:

- **Total produk** — jumlah produk di katalog.
- **Produk unggulan** — jumlah produk yang tampil di beranda.
- **Stok habis** — jumlah produk yang ditandai habis.
- **Belum ada foto** — produk yang belum punya foto. Sebaiknya dilengkapi
  sebelum diumumkan ke pelanggan. Kotak ini berwarna emas selama masih ada
  produk tanpa foto.

Di bawahnya ada daftar **Produk terbaru**. Klik salah satu untuk mengubahnya.

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

## 5b. Mengelola varian (ukuran / rasa)

Varian hanya bisa dikelola pada produk yang **sudah tersimpan**. Buka produk,
lalu gulir ke bagian **Varian**.

- **Tambah varian** — isi nama (mis. `Isi 4 pcs`) dan harga rupiah utuh, lalu
  klik **+ Tambah varian**. Perubahan langsung tersimpan, tidak perlu klik
  Simpan.
- **Sakelar tersedia** — matikan sakelar di samping varian bila varian itu
  habis. Varian tetap tampil di halaman produk dengan tulisan "Habis" dan
  tidak bisa dipilih pelanggan.
- Urutan varian belum bisa diubah dari admin.
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

## 9. Yang **tidak** bisa diubah dari admin

Bagian berikut sengaja dikunci di kode karena jarang berubah. Perubahannya
memerlukan bantuan pengembang:

- Jadwal TikTok Live dan jam CFD
- Alamat operasional
- Metode pengiriman
- Nomor WhatsApp dan tautan media sosial
- Kategori produk (menambah atau mengganti nama)
- Teks halaman Tentang, Jadwal, dan Kontak

---

## 10. Batasan yang perlu diketahui

- **Harga dan ketersediaan adalah tanggung jawab Anda.** Website tidak
  terhubung ke sistem stok. Kalau produk habis di dunia nyata tetapi masih
  "Tersedia" di website, pelanggan akan kecewa.
- **Tidak ada pembayaran daring.** Semua pesanan tetap melalui WhatsApp.
- **Foto yang diunggah langsung publik.** Jangan unggah foto yang belum ingin
  dilihat pelanggan.
