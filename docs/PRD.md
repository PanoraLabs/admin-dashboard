# Product Requirements Document (PRD): PANORA v1.0
**Project Name:** PANORA (Pangan Nusantara & Orkes Rantai Pasok)
**Status:** Draft 
**Core Infrastructure:** Solana Blockchain (High-throughput & Low-cost)

## 1. Visi Produk
Menjadi *backbone* digital pangan nasional yang menyatukan arus barang (logistik), arus uang (pembiayaan), dan arus data (matching supply-demand) dalam satu ekosistem Web3 yang transparan, aman, dan efisien.

## 2. Pilar Strategis 
* **Direct-to-Consumer (D2C):** Memangkas rantai distribusi panjang untuk margin yang lebih adil.
* **Cross-Region Matching:** Menyeimbangkan stok antar-wilayah secara cerdas berdasarkan data real-time.
* **Smart Financing & Subsidy:** Transformasi subsidi fisik menjadi aset digital yang terukur dan tepat sasaran.
* **Intelligent Logistics:** Pelacakan kondisi barang (suhu & GPS) secara real-time berbasis IoT.

---

## 3. Target Pengguna (User Personas)

| Atribut | Pak Totok (Petani) | Budi (Transporter/Logistik) | Santi (Pembeli B2B/Retailer) |
| :--- | :--- | :--- | :--- |
| **Profil** | Petani jagung/kopra di Maluku Utara. | Pemilik truk engkel/colt diesel. | Pemilik toko kelontong/agen sembako. |
| **Pain Points** | Harga ditekan tengkulak; Butuh modal cepat untuk musim tanam. | Truk sering pulang kosong (*backload*); Pembayaran jasa lama. | Kualitas barang tidak stabil; Harga fluktuatif; Sulit lacak pengiriman. |
| **Kebutuhan** | Akses pinjaman instan; Jalur jual langsung ke kota. | Kepastian muatan; Pembayaran instan via aplikasi. | Transparansi asal barang; Kepastian stok dan harga beli. |
| **Literasi Teknis**| Menengah (WhatsApp/Facebook). | Tinggi (Terbiasa Maps/App Logistik). | Tinggi (Sering belanja online). |

---

## 4. Fitur Utama & Spesifikasi Teknis

### A. Panora-Match (Demand-Supply Engine)
* **Fungsional:** Algoritma pendeteksi lonjakan permintaan di satu titik yang dicocokkan dengan jadwal panen petani di titik lain.
* **On-Chain Data:** Memanfaatkan *Solana State Compression* untuk mencatat estimasi volume panen ribuan petani tanpa biaya *gas fee* yang membengkak.

### B. Panora-Pay (Financing & Targeted Subsidy)
* **Tokenized Warehouse Receipt:** Mengubah hasil panen di gudang menjadi Programmable NFT (pNFT) sebagai jaminan pinjaman di protokol DeFi mitra.
* **Closed-Loop Subsidy:** Voucher subsidi input tani (pupuk/benih) dikirim berupa Token SPL-20 yang hanya dapat di-redeem di kios resmi terverifikasi on-chain.

### C. Panora-Log (Smart Logistics)
* **Proof of Integrity:** Data sensor IoT (Suhu & GPS) yang disinkronisasi ke blockchain. Kerusakan barang akibat suhu memicu eksekusi *Smart Contract* asuransi secara otomatis.
* **Backload Optimization:** Fitur penawaran ruang kosong truk saat perjalanan kembali (*return trip*) dengan harga diskon.

---

## 5. Sinergi Ekosistem & Strategi Bisnis

### A. PANORA x Sistem Resi Gudang (SRG)
* **Dari Kertas ke On-Chain:** Mengubah birokrasi resi fisik menjadi pNFT di Solana.
* **Likuiditas Instan (RWA):** pNFT masuk ke *Liquidity Pool*, memungkinkan pencairan pinjaman *stablecoin* dalam hitungan menit tanpa harus ke bank.
* **Proof of Reserve:** Dashboard real-time (*tamper-proof*) bagi pemerintah/investor untuk melacak stok fisik di gudang SRG.

### B. PANORA x Koperasi Merah Putih
* **Validator & Oracle Manusia:** Koperasi bertindak sebagai verifikator kualitas/kuantitas barang fisik sebelum masuk ke ekosistem digital.
* **Pusat Distribusi (Hub):** Menjadi titik awal logistik menggunakan PANORA-Log.
* **Pengelola Subsidi:** Menyalurkan dan mencairkan token subsidi (*Closed-Loop Subsidy*) melalui kios koperasi.

### C. Matriks Sinergi Tradisional vs Digital

| Komponen | Peran Tradisional (SRG/Koperasi) | Peran Digital (PANORA) |
| :--- | :--- | :--- |
| **Aset** | Komoditas Fisik (Beras, Jagung, dll.) | RWA (pNFT) di Solana |
| **Verifikasi** | Manajer Gudang / Pengurus Koperasi | Smart Contract & Data IoT |
| **Pendanaan**| Kredit Usaha Rakyat (KUR) / Bank | DeFi Lending & Stablecoins |
| **Pasar** | Tengkulak / Pasar Lokal | Cross-Region Matching (Nasional) |

> **Keunggulan Strategis:** Model ini menyelesaikan *Trust Gap* dengan memanfaatkan legalitas SRG yang sudah ada, mempercepat adopsi pengguna melalui basis komunitas Koperasi Merah Putih, dan menjamin skalabilitas tinggi menggunakan jaringan Solana. PANORA bertindak sebagai jembatan yang membuat program pemerintah sefleksibel protokol DeFi.

---

## 6. Arsitektur Teknis (Solana-Based)

| Komponen | Teknologi | Alasan Penggunaan |
| :--- | :--- | :--- |
| **Smart Contract** | Anchor Framework | Keamanan, efisiensi, dan standarisasi pengembangan dApps di Solana. |
| **Digital Asset** | Metaplex Core | Efisiensi tata kelola metadata untuk representasi aset fisik (komoditas). |
| **Price Feed** | Pyth Network | Oracle harga pangan on-chain yang akurat untuk penentuan nilai agunan. |
| **Identity** | Solana Mobile Stack (SMS) | Aksesibilitas via *smartphone* bagi petani agar mudah bertransaksi. |

---

## 7. UI/UX & Panduan Desain

### A. Konsep Visual Web3 Terabstraksi
* **Warna Utama:** *Emerald Green* (Kesegaran/Pertanian) dipadukan dengan *Solana Purple/Cyan* (Modernitas/Tech).
* **Tipografi:** Sans-serif bersih dan modern (Inter atau Roboto).
* **Aset Visual:** Penggunaan ikon sederhana untuk status "On-Chain" (contoh: ikon gembok kecil untuk Escrow).

### B. Alur Pengguna (User Flow) – *Abstracted Blockchain*
1.  **Onboarding:** Login menggunakan No. HP (terintegrasi *Embedded Wallet* seperti Dynamic/Privy). User tidak perlu menyimpan *seed phrase* rumit di awal.
2.  **Listing:** Petani input data -> Barang masuk gudang -> pNFT di-minting otomatis di *background*.
3.  **Financing:** Petani klik "Ambil Modal" -> *Smart Contract* mengunci pNFT -> *Stablecoin* cair ke wallet.
4.  **Logistics:** Pembeli *checkout* -> Transporter dipanggil -> Data IoT dicatat tiap 30 menit (via *State Compression*).
5.  **Settlement:** Barang diterima -> *Scan* QR -> Escrow cair ke Petani & Transporter -> pNFT di-*burn* atau dipindah tangankan.

### C. High-Level Wireframes
* **Dashboard Utama (The Hub):** Menampilkan Saldo (*Stablecoin*/IDR), Notifikasi, dan *Quick Actions* (Jual, Cari Muatan, Belanja). Fitur unggulan: Limit pinjaman PANORA-Pay.
* **Modul Petani:** Form input komoditas, verifikasi foto, dan tombol "Terbitkan Resi Digital". Opsi *Instant Loan* (Cairkan 60%).
* **Modul Transporter:** Tampilan Peta (*Pickup/Drop-off*), Notifikasi *Backload*, Dashboard IoT (suhu *live*), dan fitur *Scan* QR untuk bukti pengiriman (*Proof of Delivery*).
* **Modul Pembeli (Demand):** Peta *Supply* (stok real-time), *Smart Filter* (Grade, Harga, Jarak), dan *Checkout* berbasis Escrow *Smart Contract*.

---

## 8. Roadmap Pengembangan (MVP)
* **Fase 1:** Peluncuran modul Listing Petani dan Marketplace D2C sederhana.
* **Fase 2:** Integrasi Resi Gudang Digital (pNFT) dan fitur pembiayaan awal.
* **Fase 3:** Implementasi IoT Logistik dan dashboard Matching antar-wilayah berskala nasional.
