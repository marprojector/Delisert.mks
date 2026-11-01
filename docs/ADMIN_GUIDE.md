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

## 2. Halaman Ringkasan

Setelah masuk, halaman pertama menampilkan:

- **Total produk** — jumlah produk di katalog.
- **Produk unggulan** — jumlah produk yang tampil di beranda.
- **Stok habis** — jumlah produk yang ditandai habis.
- **Belum ada foto** — produk yang belum punya foto. Sebaiknya dilengkapi
  sebelum diumumkan ke pelanggan.

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
| **Foto produk** | Unggah JPG, PNG, atau WebP, maksimal 5 MB. |
| **Alt text foto** | Kalimat singkat yang dibacakan untuk pembaca layar, mis. `Mochi stroberi Delisert Makassar`. |
| **Produk unggulan** | Centang agar muncul di beranda. |

3. Klik **Simpan**. Produk langsung tampil di halaman Menu.

> **Harga:** kosongkan kolom harga **hanya** jika harga memang belum
> ditentukan. Produk seperti itu akan tampil "Harga menyusul" — jangan
> dikosongkan karena lupa.

---

## 4. Mengubah produk

1. Buka tab **Produk**.
2. Klik **Ubah** di baris produk.
3. Ubah isian yang perlu, lalu klik **Simpan**.

Perubahan langsung terlihat di website.

---

## 5. Menandai produk habis

Cara tercepat: buka produk → ubah **Ketersediaan** menjadi **Habis** → **Simpan**.

Produk tetap ada di katalog tetapi diberi tanda "Habis" dengan teks dan ikon,
bukan hanya warna. Pelanggan tetap bisa melihat produknya.

---

## 6. Mengganti foto produk

1. Buka produk → bagian **Foto produk**.
2. Klik **Pilih file**, pilih foto dari komputer atau ponsel.
3. Tunggu sampai tulisan **Mengunggah…** hilang dan pratinjau foto muncul.
4. Klik **Simpan**.

Kalau foto gagal diunggah, pesan kesalahan akan muncul. Penyebab umum:
ukuran lebih dari 5 MB, atau format bukan JPG/PNG/WebP.

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
