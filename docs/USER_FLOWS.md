# Alur Pengguna — Delisert Website

| Metadata | |
|---|---|
| **Dokumen** | User Journeys & Detailed Flows |
| **Versi** | 1.0 |
| **Tanggal** | 30 Oktober 2026 |
| **Terintegrasi dengan** | `docs/PRD.md`, `docs/PRODUCT_REQUIREMENTS.md` |

---

## 1. Peta Alur Utama

```mermaid
graph LR
    subgraph "Titik Masuk"
        A1[Tautan Bio Instagram]
        A2[Tautan Bio TikTok]
        A3[Pencarian Google]
        A4[Berbagi Tautan]
        A5[Google Maps]
    end

    subgraph "Website"
        B[Homepage]
        C[Tentang]
        D[Menu]
        E[Detail Produk]
        F[Jadwal & Lokasi]
        G[Kontak]
    end

    subgraph "Konversi"
        H[WhatsApp]
        I[Instagram]
        J[TikTok]
        K[Kunjungan CFD]
    end

    A1 --> B
    A2 --> B
    A3 --> B
    A4 --> E
    A5 --> B

    B --> C
    B --> D
    B --> F
    B --> G
    D --> E
    E --> D
    F --> G
    C --> D

    E --> H
    G --> H
    D --> H
    B --> H
    B --> I
    B --> J
    F --> J
    F --> K
```

---

## 2. User Journey Detail

### Journey 1 — Nadia: Penemuan via TikTok Live

**Konteks:** Nadia, mahasiswi UNHAS usia 20, menonton TikTok Live Delisert saat istirahat kuliah. Dia tertarik pada mochi tapi ragu karena tidak tahu harga dan cara pesan.

```mermaid
journey
    title Journey Nadia — TikTok Live ke Pesanan WhatsApp
    section Penemuan
      Menonton TikTok Live Delisert: 3: Nadia
      Melihat produk mochi menarik: 4: Nadia
      Klik tautan di bio TikTok: 4: Nadia
    section Eksplorasi Website
      Mendarat di Homepage: 4: Nadia
      Melihat hero & produk unggulan: 5: Nadia
      Scroll ke section kategori: 4: Nadia
      Klik kategori Mochi: 4: Nadia
    section Evaluasi
      Melihat grid produk mochi: 4: Nadia
      Membaca harga & varian: 3: Nadia
      Membuka detail produk: 5: Nadia
      Melihat foto & deskripsi lengkap: 5: Nadia
    section Konversi
      Klik "Pesan via WhatsApp": 5: Nadia
      WhatsApp terbuka dengan pesan siap: 5: Nadia
      Kirim pesan ke Delisert: 4: Nadia
      Terima konfirmasi harga & pengiriman: 4: Nadia
```

**Titik gesek (friction points) dan solusi:**

| Titik Gesek | Solusi Desain |
|---|---|
| Tidak tahu harga | Tampilkan harga jelas di kartu produk; jika belum ada, tampilkan "Hubungi untuk harga" secara elegan |
| Tidak yakin varian | Tampilkan daftar varian di kartu dan detail produk |
| Ragu chat WA tanpa info | Berikan informasi lengkap sebelum CTA WhatsApp |
| Pesan WA kosong | Isi otomatis dengan nama produk dan varian |

---

### Journey 2 — Nadia: Mencari Lokasi CFD Minggu

**Konteks:** Hari Minggu, Nadia ingin dessert dan tahu Delisert berjualan di CFD.

```mermaid
journey
    title Journey Nadia — Mencari Lokasi CFD Minggu
    section Kebutuhan
      Inginkan dessert hari Minggu: 3: Nadia
      Ingat Delisert jualan di CFD: 4: Nadia
    section Pencarian Info
      Buka website Delisert: 4: Nadia
      Klik navigasi "Jadwal": 4: Nadia
      Baca section TikTok Live: 4: Nadia
      Baca section CFD Minggu: 3: Nadia
      Paham lokasi diumumkan via sosial: 3: Nadia
    section Tindak Lanjut
      Klik ikon Instagram di footer: 4: Nadia
      Lihat postingan lokasi terbaru: 4: Nadia
      Datang ke CFD Boulevard: 4: Nadia
      Membeli mochi langsung: 5: Nadia
```

**Titik gesek dan solusi:**

| Titik Gesek | Solusi Desain |
|---|---|
| Tidak tahu lokasi pasti hari ini | Jangan tampilkan jam pasti; arahkan ke sosial media dengan CTA jelas |
| Khawatir lokasi berubah | Tegaskan bahwa titik penjualan bersifat sementara |
| Perlu info cepat | Section CFD harus mudah ditemukan dari navigasi utama |

---

### Journey 3 — Raka: Pesanan Mango Sticky Rice untuk Kantor

**Konteks:** Raka, karyawan kantor usia 28, ingin pesan mango sticky rice untuk dibagikan ke tim besok.

```mermaid
journey
    title Journey Raka — Pesanan untuk Kantor
    section Penemuan
      Inginkan dessert untuk tim: 3: Raka
      Google "mango sticky rice Makassar": 4: Raka
      Menemukan website Delisert: 4: Raka
    section Eksplorasi
      Mendarat di Homepage: 4: Raka
      Klik navigasi "Menu": 4: Raka
      Filter kategori Mango Sticky Rice: 4: Raka
      Membaca deskripsi produk: 4: Raka
    section Konversi
      Klik produk: 5: Raka
      Lihat detail & foto: 4: Raka
      Klik "Pesan via WhatsApp": 5: Raka
      Pesan terisi otomatis: 5: Raka
      Konfirmasi pengiriman via GoSend: 4: Raka
      Pesanan diproses: 5: Raka
```

**Titik gesek dan solusi:**

| Titik Gesek | Solusi Desain |
|---|---|
| Tidak tahu bisa dikirim | Section pengiriman di halaman Kontak |
| Tidak tahu cara pesan jumlah banyak | Pesan WA terisi otomatis memudahkan penyesuaian |
| Ingin cepat | Satu klik dari produk ke WhatsApp |

---

### Journey 4 — Sari: Mencari Kue Ulang Tahun Anak

**Konteks:** Sari, ibu rumah tangga usia 34, anak ulang tahun minggu depan. Ingin kue yang berbeda.

```mermaid
journey
    title Journey Sari — Mencari Kue Ulang Tahun
    section Penemuan
      Inginkan kue unik untuk anak: 3: Sari
      Bertanya di grup ibu Makassar: 3: Sari
      Dapat rekomendasi Delisert: 4: Sari
    section Eksplorasi
      Buka website Delisert: 4: Sari
      Baca halaman Tentang: 4: Sari
      Klik navigasi "Menu": 4: Sari
      Melihat kategori produk: 3: Sari
      Tidak menemukan kategori acara: 2: Sari
    section Konversi
      Klik "Kontak" untuk bertanya: 3: Sari
      Klik tombol WhatsApp: 4: Sari
      Tanya tentang mochi birthday: 4: Sari
      Dapat informasi pre-order: 4: Sari
      Pesan untuk acara: 5: Sari
```

**Titik gesek dan solusi:**

| Titik Gesek | Solusi Desain |
|---|---|
| Kategori "Mochi Birthday" belum ada di MVP | Sampaikan melalui WhatsApp; tambahkan kategori di Fase 2 |
| Tidak tahu lead time pre-order | Instruksi pre-order di detail produk (Fase 2); sementara via WA |
| Ingin yakin kualitas | Halaman Tentang dan testimoni (Fase 2) |

**Catatan produk:** Journey ini mengungkap kebutuhan kategori "Mochi Birthday" dan "Small Wholecake" yang terlihat di story highlights Instagram. Direkomendasikan masuk Fase 2.

---

### Journey 5 — Pengunjung Pertama Kali: Membangun Kepercayaan

**Konteks:** Pengunjung yang belum pernah mendengar Delisert, datang dari pencarian atau berbagi tautan.

```mermaid
journey
    title Journey Pengunjung Baru — Membangun Kepercayaan
    section Kesan Pertama
      Mendarat di Homepage: 3: Pengunjung
      Melihat fotografi produk: 5: Pengunjung
      Membaca headline & posisioning: 4: Pengunjung
    section Pembelajaran Merek
      Scroll ke brand introduction: 4: Pengunjung
      Klik "Tentang": 4: Pengunjung
      Membaca latar belakang 2021: 4: Pengunjung
    section Evaluasi
      Kembali ke Menu: 4: Pengunjung
      Melihat katalog lengkap: 4: Pengunjung
      Memeriksa jadwal & lokasi: 3: Pengunjung
    section Keputusan
      Merasa yakin dengan merek: 4: Pengunjung
      Klik WhatsApp atau ikuti Instagram: 4: Pengunjung
```

**Titik gesek dan solusi:**

| Titik Gesek | Solusi Desain |
|---|---|
| Tidak yakin merek ini nyata | Fotografi asli berkualitas, informasi "Sejak 2021" |
| Tidak yakin halal | Tampilkan status klaim halal sesuai verifikasi; jangan klaim sertifikasi |
| Tidak yakin cara pesan | Alur pemesanan yang jelas di halaman Kontak |

---

## 3. Alur Fungsional Detail

### 3.1 Alur Pemesanan WhatsApp

```mermaid
sequenceDiagram
    actor P as Pelanggan
    participant W as Website
    participant WA as WhatsApp
    actor D as Delisert

    rect rgb(240, 248, 255)
    Note over P,W: Tahap 1 — Penemuan Produk
    P->>W: Membuka halaman produk
    W->>P: Menampilkan foto, deskripsi, harga, varian
    P->>W: Memilih varian (jika ada)
    end

    rect rgb(255, 248, 240)
    Note over P,WA: Tahap 2 — Inisiasi Pesanan
    P->>W: Klik tombol "Pesan via WhatsApp"
    W->>W: Menyusun pesan terisi otomatis
    W->>WA: Membuka wa.me dengan pesan terenkode
    end

    rect rgb(240, 255, 240)
    Note over P,D: Tahap 3 — Konfirmasi Manual
    WA->>P: Menampilkan pesan siap kirim
    P->>WA: Mengirim pesan
    WA->>D: Pesanan masuk ke WhatsApp bisnis
    D->>P: Konfirmasi detail, harga, pengiriman
    P->>D: Konfirmasi akhir
    D->>P: Proses pesanan
    end
```

**Format pesan terisi otomatis:**

Dari halaman detail produk dengan varian:
```
Halo Delisert! Saya ingin memesan:

Produk: Mochi Matcha
Varian: Isi 8 pcs
Harga: Rp 35.000

Apakah produk ini tersedia?
```

Dari navigasi atau homepage:
```
Halo Delisert! Saya ingin memesan produk Delisert.
```

**Aturan penyusunan pesan:**
- Sertakan nama produk ketika pengguna mengklik dari halaman produk
- Sertakan varian terpilih ketika ada
- **Tidak** sertakan harga jika harga belum dikonfirmasi pemilik
- Gunakan Bahasa Indonesia yang sopan
- Encode URL dengan benar (`encodeURIComponent`)

---

### 3.2 Alur Filter Kategori

```mermaid
sequenceDiagram
    actor U as Pengunjung
    participant M as Halaman Menu
    participant A as API tRPC
    participant DB as Cloudflare D1

    U->>M: Membuka /menu
    M->>A: product.list()
    A->>DB: SELECT produk + kategori
    DB->>A: Daftar produk
    A->>M: Data produk
    M->>U: Grid produk (semua kategori)

    U->>M: Klik filter "Mochi"
    M->>A: product.list({ category: "mochi" })
    A->>DB: SELECT produk WHERE kategori = mochi
    DB->>A: Produk terfilter
    A->>M: Data terfilter
    M->>U: Grid produk (mochi saja)
    M->>M: Perbarui URL menjadi /menu?kategori=mochi
```

---

### 3.3 Alur Navigasi Mobile

```mermaid
stateDiagram-v2
    [*] --> Tertutup
    Tertutup --> Terbuka: Tap hamburger
    Terbuka --> Tertutup: Tap hamburger
    Terbuka --> Tertutup: Tap di luar menu
    Terbuka --> Tertutup: Tekan Escape
    Terbuka --> Navigasi: Tap item menu
    Navigasi --> Tertutup: Halaman dimuat
```

---

### 3.4 Alur Berbagi Tautan Produk

```mermaid
sequenceDiagram
    actor P1 as Pengirim
    participant S as Media Sosial
    participant W as Website
    actor P2 as Penerima

    P1->>S: Bagikan tautan /menu/mochi-matcha
    S->>S: Membaca Open Graph tags
    Note over S: og:title, og:description,<br/>og:image (foto produk)
    S->>P2: Menampilkan preview kaya
    P2->>W: Klik tautan
    W->>P2: Halaman detail produk
    P2->>P2: Melihat produk yang sama
```

---

## 4. Peta Halaman dan Aksi

| Halaman | Aksi Utama | Aksi Sekunder |
|---|---|---|
| `/` | Klik CTA Menu, klik CTA WhatsApp | Klik kategori, klik sosial, scroll ke jadwal |
| `/tentang` | Membaca cerita merek | Klik CTA Menu, klik WhatsApp |
| `/menu` | Filter kategori, klik produk | Klik WhatsApp per kartu |
| `/menu/$slug` | Klik "Pesan via WhatsApp" | Klik produk terkait, lihat galeri, pilih varian |
| `/jadwal` | Membaca jadwal, klik ikon TikTok | Klik Google Maps, klik sosial |
| `/kontak` | Klik tombol WhatsApp | Klik Instagram, klik TikTok, baca instruksi |

---

## 5. Prinsip Interaksi

### 5.1 Umpan Balik (Feedback)

| Aksi | Umpan Balik |
|---|---|
| Klik tombol WhatsApp | Membuka aplikasi/WhatsApp Web (tidak ada feedback internal perlu) |
| Filter kategori | Grid diperbarui, URL berubah, indikator filter aktif |
| Buka menu mobile | Animasi slide, overlay, tutup dengan Escape |
| Hover kartu produk | Elevasi halus, transisi warna |
| Scroll | Section muncul dengan reveal halus (jika tidak mengganggu performa) |

### 5.2 Status dan Kondisi

| Kondisi | Perilaku |
|---|---|
| Produk habis | Kartu tetap tampil dengan badge "Habis", CTA WhatsApp dinonaktifkan atau diubah menjadi "Tanya Ketersediaan" |
| Harga belum tersedia | Tampilkan "Hubungi untuk harga" bukan angka kosong |
| Kategori kosong | Empty state dengan pesan dan CTA ke kategori lain |
| Slug tidak ditemukan | Halaman 404 dengan tautan kembali ke Menu |
| Gambar gagal muat | Placeholder dengan alt text, tidak merusak layout |

### 5.3 Mobile-First

| Elemen | Perilaku Mobile |
|---|---|
| Navigasi | Hamburger menu, sticky |
| Grid produk | 1 kolom, kartu full-width |
| Tombol WhatsApp | Ukuran besar, mudah dijangkau jempol |
| Teks | Minimal 16px untuk body |
| Target sentuh | Minimal 44×44px |
| Gambar | Responsif, lazy load |

---

## 6. Alur Konten (Content Flow)

```mermaid
graph TD
    subgraph "Sumber Konten"
        O[Pemilik Bisnis]
        R[Riset Media Sosial]
    end

    subgraph "Pemrosesan"
        V[Verifikasi & Klasifikasi]
        T[Terjemahan ke Kebutuhan]
    end

    subgraph "Output Website"
        H[Homepage]
        M[Menu]
        J[Jadwal]
        K[Kontak]
    end

    O --> V
    R --> V
    V --> T
    T --> H
    T --> M
    T --> J
    T --> K

    style V fill:#fff3cd
    style O fill:#d1ecf1
```

**Aturan alur konten:**
1. Setiap konten dari pemilik bisnis diverifikasi sebelum publikasi.
2. Informasi yang tidak terkonfirmasi tidak ditampilkan sebagai fakta.
3. Klaim pemasaran ditandai status verifikasinya.
4. Perubahan konten memerlukan pembaruan dokumen PRD.

---

*Dokumen ini terintegrasi dengan `docs/PRD.md` dan `docs/PRODUCT_REQUIREMENTS.md`.*
