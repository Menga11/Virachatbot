-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 27 Jun 2026 pada 11.37
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `chatbot_polda`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `chatbot_memory`
--

CREATE TABLE `chatbot_memory` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY, -- Gabungin AUTO_INCREMENT dan PRIMARY KEY di sini!
  `pertanyaan` text DEFAULT NULL,
  `jawaban` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `link` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `chatbot_memory`
--

INSERT INTO `chatbot_memory` (`id`, `pertanyaan`, `jawaban`, `created_at`, `link`) VALUES
(1, 'halo', 'Halo, ada yang bisa saya bantu terkait informasi Keterbukaan Informasi Publik?', '2026-05-28 07:46:22', NULL),
(2, 'hai', 'Halo, ada yang bisa saya bantu terkait informasi Keterbukaan Informasi Publik?', '2026-05-28 07:46:22', NULL),
(3, 'hi', 'Halo, ada yang bisa saya bantu terkait informasi Keterbukaan Informasi Publik?', '2026-05-28 07:46:22', NULL),
(4, 'selamat pagi', 'Halo, ada yang bisa saya bantu terkait informasi Keterbukaan Informasi Publik?', '2026-05-28 07:46:22', NULL),
(5, 'assalamualaikum', 'Halo, ada yang bisa saya bantu terkait informasi Keterbukaan Informasi Publik?', '2026-05-28 07:46:22', NULL),
(6, 'pangkat tertinggi', 'Pangkat tertinggi di Kepolisian adalah Jenderal Polisi.', '2026-05-28 07:46:22', NULL),
(7, 'pangkat polisi', 'Pangkat tertinggi di Kepolisian adalah Jenderal Polisi.', '2026-05-28 07:46:22', NULL),
(8, 'urutan pangkat', 'Pangkat tertinggi di Kepolisian adalah Jenderal Polisi.', '2026-05-28 07:46:22', NULL),
(9, 'kapolda', 'Kapolda adalah pimpinan tertinggi di tingkat Polda.', '2026-05-28 07:46:22', NULL),
(10, 'kepala polda', 'Kapolda adalah pimpinan tertinggi di tingkat Polda.', '2026-05-28 07:46:22', NULL),
(11, 'pimpinan polda', 'Kapolda adalah pimpinan tertinggi di tingkat Polda.', '2026-05-28 07:46:22', NULL),
(12, 'cara membuat sim', 'Pembuatan SIM baru memerlukan KTP, mengikuti tes kesehatan, psikologi, ujian teori, dan ujian praktik.', '2026-05-28 07:46:22', 'https://korlantas.polri.go.id'),
(13, 'syarat sim baru', 'Pembuatan SIM baru memerlukan KTP, mengikuti tes kesehatan, psikologi, ujian teori, dan ujian praktik.', '2026-05-28 07:46:22', 'https://korlantas.polri.go.id'),
(14, 'pembuatan sim baru', 'Pembuatan SIM baru memerlukan KTP, mengikuti tes kesehatan, psikologi, ujian teori, dan ujian praktik.', '2026-05-28 07:46:22', 'https://korlantas.polri.go.id'),
(15, 'sim', 'Pembuatan SIM baru memerlukan KTP, mengikuti tes kesehatan, psikologi, ujian teori, dan ujian praktik.', '2026-05-28 07:46:22', 'https://korlantas.polri.go.id'),
(16, 'perpanjang sim', 'Perpanjangan SIM dapat dilakukan di Satpas atau SIM Keliling dengan membawa KTP, SIM lama, surat kesehatan, dan hasil tes psikologi.', '2026-05-28 07:46:22', 'https://korlantas.polri.go.id'),
(17, 'cara perpanjang sim', 'Perpanjangan SIM dapat dilakukan di Satpas atau SIM Keliling dengan membawa KTP, SIM lama, surat kesehatan, dan hasil tes psikologi.', '2026-05-28 07:46:22', 'https://korlantas.polri.go.id'),
(18, 'masa berlaku sim', 'SIM memiliki masa berlaku selama 5 tahun sejak tanggal penerbitan.', '2026-05-28 07:46:22', NULL),
(19, 'sim berlaku berapa lama', 'SIM memiliki masa berlaku selama 5 tahun sejak tanggal penerbitan.', '2026-05-28 07:46:22', NULL),
(20, 'apa itu skck', 'SKCK adalah Surat Keterangan Catatan Kepolisian yang digunakan sebagai syarat administrasi untuk pekerjaan, pendidikan, dan keperluan lainnya.', '2026-05-28 07:46:22', NULL),
(21, 'fungsi skck', 'SKCK adalah Surat Keterangan Catatan Kepolisian yang digunakan sebagai syarat administrasi untuk pekerjaan, pendidikan, dan keperluan lainnya.', '2026-05-28 07:46:22', NULL),
(22, 'cara membuat skck online', 'Pembuatan SKCK dapat dilakukan secara online melalui aplikasi atau website resmi Polri dengan melengkapi data dan dokumen persyaratan.', '2026-05-28 07:46:22', 'https://skck.polri.go.id'),
(23, 'skck online', 'Pembuatan SKCK dapat dilakukan secara online melalui aplikasi atau website resmi Polri dengan melengkapi data dan dokumen persyaratan.', '2026-05-28 07:46:22', 'https://skck.polri.go.id'),
(24, 'nomor darurat polisi', 'Masyarakat dapat menghubungi layanan darurat Kepolisian melalui nomor 110 yang aktif selama 24 jam.', '2026-05-28 07:46:22', 'https://polri.go.id'),
(25, 'call center polisi', 'Masyarakat dapat menghubungi layanan darurat Kepolisian melalui nomor 110 yang aktif selama 24 jam.', '2026-05-28 07:46:22', 'https://polri.go.id'),
(26, 'hotline polisi', 'Masyarakat dapat menghubungi layanan darurat Kepolisian melalui nomor 110 yang aktif selama 24 jam.', '2026-05-28 07:46:22', 'https://polri.go.id'),
(27, 'apa itu presisi', 'PRESISI adalah program Polri yang berarti Prediktif, Responsibilitas, dan Transparansi Berkeadilan dalam pelayanan kepada masyarakat.', '2026-05-28 07:46:22', 'https://polri.go.id'),
(28, 'program presisi polri', 'PRESISI adalah program Polri yang berarti Prediktif, Responsibilitas, dan Transparansi Berkeadilan dalam pelayanan kepada masyarakat.', '2026-05-28 07:46:22', 'https://polri.go.id'),
(29, 'jam', 'Jam pelayanan: Senin - Jumat, 08.00 - 16.00 WIB.', '2026-05-28 07:46:22', NULL),
(30, 'pelayanan', 'Jam pelayanan: Senin - Jumat, 08.00 - 16.00 WIB.', '2026-05-28 07:46:22', NULL),
(31, 'alamat', 'Alamat Polda Sumut berada di Jl. Sisingamangaraja No.60, Medan. Anda dapat melihat lokasi melalui Google Maps berikut.', '2026-05-28 07:46:22', 'https://maps.app.goo.gl/douZogtjcybzttWq6'),
(32, 'alamat polda', 'Alamat Polda Sumut berada di Jl. Sisingamangaraja No.60, Medan. Anda dapat melihat lokasi melalui Google Maps berikut.', '2026-05-28 07:46:22', 'https://maps.app.goo.gl/douZogtjcybzttWq6'),
(33, 'lokasi polda', 'Alamat Polda Sumut berada di Jl. Sisingamangaraja No.60, Medan. Anda dapat melihat lokasi melalui Google Maps berikut.', '2026-05-28 07:46:22', 'https://maps.app.goo.gl/douZogtjcybzttWq6'),
(34, 'maps polda', 'Alamat Polda Sumut berada di Jl. Sisingamangaraja No.60, Medan. Anda dapat melihat lokasi melalui Google Maps berikut.', '2026-05-28 07:46:22', 'https://maps.app.goo.gl/douZogtjcybzttWq6'),
(35, 'google maps polda', 'Alamat Polda Sumut berada di Jl. Sisingamangaraja No.60, Medan. Anda dapat melihat lokasi melalui Google Maps berikut.', '2026-05-28 07:46:22', 'https://maps.app.goo.gl/douZogtjcybzttWq6'),
(36, 'apa itu humas', 'Humas adalah bagian yang bertugas membangun komunikasi dan hubungan baik antara instansi dengan masyarakat.', '2026-05-28 07:46:22', NULL),
(37, 'pengertian humas', 'Humas adalah bagian yang bertugas membangun komunikasi dan hubungan baik antara instansi dengan masyarakat.', '2026-05-28 07:46:22', NULL),
(38, 'cara melapor ke polisi', 'Masyarakat dapat melapor ke kantor polisi terdekat dengan membawa identitas diri dan bukti pendukung terkait kejadian yang dilaporkan.', '2026-05-28 07:46:22', NULL),
(39, 'lapor polisi', 'Masyarakat dapat melapor ke kantor polisi terdekat dengan membawa identitas diri dan bukti pendukung terkait kejadian yang dilaporkan.', '2026-05-28 07:46:22', NULL),
(40, 'apa itu laporan polisi', 'Laporan Polisi adalah dokumen resmi yang dibuat oleh petugas kepolisian atas laporan suatu kejadian atau tindak pidana.', '2026-05-28 07:46:22', NULL),
(41, 'pengertian lp', 'Laporan Polisi adalah dokumen resmi yang dibuat oleh petugas kepolisian atas laporan suatu kejadian atau tindak pidana.', '2026-05-28 07:46:22', NULL),
(42, 'apa itu samsat', 'Samsat adalah sistem administrasi terpadu untuk pengurusan pajak kendaraan bermotor, STNK, dan TNKB.', '2026-05-28 07:46:22', NULL),
(43, 'fungsi samsat', 'Samsat adalah sistem administrasi terpadu untuk pengurusan pajak kendaraan bermotor, STNK, dan TNKB.', '2026-05-28 07:46:22', NULL),
(44, 'cara bayar pajak kendaraan', 'Pembayaran pajak kendaraan dapat dilakukan di kantor Samsat, Samsat Keliling, atau aplikasi digital resmi pemerintah daerah.', '2026-05-28 07:46:22', NULL),
(45, 'bayar pajak motor', 'Pembayaran pajak kendaraan dapat dilakukan di kantor Samsat, Samsat Keliling, atau aplikasi digital resmi pemerintah daerah.', '2026-05-28 07:46:22', NULL),
(46, 'apa itu stnk', 'STNK adalah Surat Tanda Nomor Kendaraan sebagai bukti registrasi dan identifikasi kendaraan bermotor.', '2026-05-28 07:46:22', NULL),
(47, 'fungsi stnk', 'STNK adalah Surat Tanda Nomor Kendaraan sebagai bukti registrasi dan identifikasi kendaraan bermotor.', '2026-05-28 07:46:22', NULL),
(48, 'apa itu tilang elektronik', 'ETLE adalah sistem penindakan pelanggaran lalu lintas berbasis kamera elektronik secara otomatis.', '2026-05-28 07:46:22', 'https://etle-pmj.id'),
(49, 'etle', 'ETLE adalah sistem penindakan pelanggaran lalu lintas berbasis kamera elektronik secara otomatis.', '2026-05-28 07:46:22', 'https://etle-pmj.id'),
(50, 'electronic traffic law enforcement', 'ETLE adalah sistem penindakan pelanggaran lalu lintas berbasis kamera elektronik secara otomatis.', '2026-05-28 07:46:22', 'https://etle-pmj.id'),
(51, 'pengaduan', 'Pengaduan dapat dilakukan melalui website resmi atau datang langsung ke kantor.', '2026-05-28 07:46:22', NULL),
(52, 'uu kip', 'UU KIP adalah Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik yang mengatur hak masyarakat untuk memperoleh informasi dari badan publik.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id/pdf/20250131103700-Kajian_UU_KIP.pdf'),
(53, 'apa itu keterbukaan informasi publik', 'UU KIP adalah Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik yang mengatur hak masyarakat untuk memperoleh informasi dari badan publik.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id/pdf/20250131103700-Kajian_UU_KIP.pdf'),
(54, 'keterbukaan informasi publik', 'UU KIP adalah Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik yang mengatur hak masyarakat untuk memperoleh informasi dari badan publik.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id/pdf/20250131103700-Kajian_UU_KIP.pdf'),
(55, 'uu kip tujuan', 'UU KIP bertujuan menjamin hak masyarakat untuk memperoleh informasi, meningkatkan transparansi, dan mewujudkan pemerintahan yang akuntabel.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id/pdf/20250131103700-Kajian_UU_KIP.pdf'),
(56, 'tujuan keterbukaan informasi publik', 'UU KIP bertujuan menjamin hak masyarakat untuk memperoleh informasi, meningkatkan transparansi, dan mewujudkan pemerintahan yang akuntabel.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id/pdf/20250131103700-Kajian_UU_KIP.pdf'),
(57, 'kenapa keterbukaan informasi penting', 'Keterbukaan informasi penting agar masyarakat dapat mengawasi kinerja pemerintah dan mencegah penyalahgunaan wewenang.', '2026-05-28 07:46:22', NULL),
(58, 'hak masyarakat dalam uu kip', 'Masyarakat berhak meminta, memperoleh, melihat, dan menyebarluaskan informasi publik sesuai aturan yang berlaku.', '2026-05-28 07:46:22', NULL),
(59, 'siapa yang wajib memberi informasi', 'Badan publik seperti instansi pemerintah wajib menyediakan dan memberikan informasi kepada masyarakat.', '2026-05-28 07:46:22', NULL),
(60, 'apa itu badan publik', 'Badan publik adalah lembaga yang menggunakan dana negara atau dana masyarakat dan memiliki kewajiban memberikan informasi publik.', '2026-05-28 07:46:22', NULL),
(61, 'contoh badan publik', 'Contoh badan publik adalah kementerian, kepolisian, pemerintah daerah, sekolah negeri, dan lembaga negara lainnya.', '2026-05-28 07:46:22', NULL),
(62, 'apa itu informasi publik', 'Informasi publik adalah informasi yang dihasilkan, disimpan, atau dikelola oleh badan publik untuk kepentingan masyarakat.', '2026-05-28 07:46:22', NULL),
(63, 'contoh informasi publik', 'Contoh informasi publik adalah laporan kegiatan, anggaran, pelayanan publik, dan kebijakan pemerintah.', '2026-05-28 07:46:22', NULL),
(64, 'apa manfaat uu kip', 'UU KIP membantu masyarakat mendapatkan informasi secara terbuka sehingga tercipta pemerintahan yang lebih jujur dan transparan.', '2026-05-28 07:46:22', NULL),
(65, 'fungsi uu kip', 'UU KIP berfungsi melindungi hak masyarakat dalam memperoleh informasi dari badan publik.', '2026-05-28 07:46:22', NULL),
(66, 'cara meminta informasi publik', 'Permintaan informasi publik dapat dilakukan dengan mengajukan permohonan kepada badan publik atau PPID.', '2026-05-28 07:46:22', NULL),
(67, 'apa itu ppid', 'PPID adalah Pejabat Pengelola Informasi dan Dokumentasi yang bertugas melayani permintaan informasi publik.', '2026-05-28 07:46:22', NULL),
(68, 'fungsi ppid', 'PPID bertugas menyimpan, mengelola, mendokumentasikan, dan memberikan informasi publik kepada masyarakat.', '2026-05-28 07:46:22', NULL),
(69, 'berapa lama jawaban informasi publik', 'Permintaan informasi publik wajib dijawab paling lambat 10 hari kerja dan dapat diperpanjang 7 hari kerja.', '2026-05-28 07:46:22', NULL),
(70, 'apakah meminta informasi bayar', 'Permintaan informasi publik umumnya gratis, masyarakat hanya membayar biaya penggandaan dokumen jika diperlukan.', '2026-05-28 07:46:22', NULL),
(71, 'informasi yang wajib diumumkan', 'Badan publik wajib mengumumkan informasi penting secara berkala, serta-merta, dan setiap saat.', '2026-05-28 07:46:22', NULL),
(72, 'apa itu informasi berkala', 'Informasi berkala adalah informasi yang diumumkan rutin oleh badan publik dalam jangka waktu tertentu.', '2026-05-28 07:46:22', NULL),
(73, 'apa itu informasi serta merta', 'Informasi serta-merta adalah informasi yang harus diumumkan segera karena berkaitan dengan keselamatan masyarakat.', '2026-05-28 07:46:22', NULL),
(74, 'apa itu informasi setiap saat', 'Informasi setiap saat adalah informasi yang selalu tersedia dan dapat diminta kapan saja oleh masyarakat.', '2026-05-28 07:46:22', NULL),
(75, 'apakah semua informasi bisa dibuka', 'Tidak semua informasi dapat dibuka karena ada informasi yang dikecualikan demi keamanan dan kepentingan negara.', '2026-05-28 07:46:22', NULL),
(76, 'apa itu informasi dikecualikan', 'Informasi dikecualikan adalah informasi yang tidak dapat diberikan kepada publik karena dapat membahayakan negara atau privasi seseorang.', '2026-05-28 07:46:22', NULL),
(77, 'contoh informasi dikecualikan', 'Contoh informasi dikecualikan adalah rahasia negara, data pribadi, dan informasi yang dapat mengganggu proses hukum.', '2026-05-28 07:46:22', NULL),
(78, 'data pribadi dalam uu kip', 'Data pribadi masyarakat dilindungi dan tidak boleh diberikan tanpa izin sesuai ketentuan hukum.', '2026-05-28 07:46:22', NULL),
(79, 'rahasia negara', 'Rahasia negara adalah informasi yang berkaitan dengan pertahanan, keamanan, dan kedaulatan negara.', '2026-05-28 07:46:22', NULL),
(80, 'apa akibat jika badan publik menolak informasi', 'Badan publik dapat dikenakan sanksi jika sengaja tidak memberikan informasi publik yang wajib diberikan.', '2026-05-28 07:46:22', NULL),
(81, 'apa akibat menyalahgunakan informasi publik', 'Penyalahgunaan informasi publik secara melawan hukum dapat dikenakan pidana dan denda.', '2026-05-28 07:46:22', NULL),
(82, 'apa itu mediasi sengketa informasi', 'Mediasi sengketa informasi adalah proses penyelesaian sengketa informasi publik melalui musyawarah dengan bantuan Komisi Informasi.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id'),
(83, 'siapa yang menyelesaikan sengketa informasi', 'Sengketa informasi diselesaikan oleh Komisi Informasi melalui mediasi atau ajudikasi.', '2026-05-28 07:46:22', NULL),
(84, 'apa itu ajudikasi', 'Ajudikasi nonlitigasi adalah proses penyelesaian sengketa informasi oleh Komisi Informasi di luar pengadilan.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id'),
(85, 'ajudikasi non litigasi', 'Ajudikasi nonlitigasi adalah proses penyelesaian sengketa informasi oleh Komisi Informasi di luar pengadilan.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id'),
(86, 'apa itu komisi informasi', 'Komisi Informasi adalah lembaga yang bertugas menyelesaikan sengketa informasi publik.', '2026-05-28 07:46:22', NULL),
(87, 'apa itu transparansi', 'Transparansi adalah keterbukaan pemerintah dalam memberikan informasi kepada masyarakat.', '2026-05-28 07:46:22', NULL),
(88, 'apa itu akuntabilitas', 'Akuntabilitas adalah tanggung jawab badan publik terhadap kebijakan dan pelayanan kepada masyarakat.', '2026-05-28 07:46:22', NULL),
(89, 'hubungan uu kip dengan demokrasi', 'UU KIP mendukung demokrasi karena masyarakat dapat mengetahui dan mengawasi kebijakan pemerintah.', '2026-05-28 07:46:22', NULL),
(90, 'uu kip mencegah korupsi', 'Keterbukaan informasi membantu mencegah korupsi, kolusi, dan nepotisme melalui pengawasan masyarakat.', '2026-05-28 07:46:22', NULL),
(91, 'hak mendapatkan salinan informasi', 'Masyarakat berhak memperoleh salinan dokumen informasi publik sesuai prosedur yang berlaku.', '2026-05-28 07:46:22', NULL),
(92, 'cara keberatan informasi publik', 'Jika permintaan informasi ditolak, masyarakat dapat mengajukan keberatan kepada atasan PPID.', '2026-05-28 07:46:22', NULL),
(93, 'hak masyarakat mengawasi pemerintah', 'Masyarakat memiliki hak mengawasi pemerintah melalui akses terhadap informasi publik.', '2026-05-28 07:46:22', NULL),
(94, 'tujuan transparansi pemerintah', 'Transparansi pemerintah bertujuan meningkatkan kepercayaan masyarakat terhadap pelayanan publik.', '2026-05-28 07:46:22', NULL),
(95, 'mengapa informasi publik harus mudah diakses', 'Informasi publik harus mudah diakses agar masyarakat dapat memahami dan menggunakan informasi tersebut dengan baik.', '2026-05-28 07:46:22', NULL),
(96, 'siapa bisa meminta informasi publik', 'Setiap warga negara Indonesia berhak meminta informasi publik kepada badan publik sesuai ketentuan UU KIP.', '2026-05-28 07:46:22', NULL),
(97, 'apa itu informasi rahasia', 'Informasi rahasia adalah informasi yang dikecualikan untuk melindungi keamanan negara, proses hukum, dan privasi seseorang.', '2026-05-28 07:46:22', NULL),
(98, 'informasi yang tidak boleh dibuka', 'Informasi rahasia adalah informasi yang dikecualikan untuk melindungi keamanan negara, proses hukum, dan privasi seseorang.', '2026-05-28 07:46:22', NULL),
(99, 'berapa lama sengketa informasi selesai', 'Penyelesaian sengketa informasi melalui Komisi Informasi paling lambat diselesaikan dalam waktu 100 hari kerja.', '2026-05-28 07:46:22', 'https://komisiinformasi.go.id'),
(100, 'apa sanksi penyalahgunaan informasi publik', 'Penyalahgunaan informasi publik secara melawan hukum dapat dikenakan pidana penjara dan denda sesuai UU KIP.', '2026-05-28 07:46:22', 'https://jdih.kominfo.go.id'),
(101, 'informasi wajib berkala', 'Informasi berkala adalah informasi yang wajib diumumkan rutin oleh badan publik dalam jangka waktu tertentu.', '2026-05-28 07:46:22', NULL),
(102, 'apa arti akuntabilitas', 'Akuntabilitas adalah bentuk pertanggungjawaban badan publik atas kebijakan dan pelayanan kepada masyarakat.', '2026-05-28 07:46:22', NULL),
(103, 'bidhumas', 'Bidhumas adalah Bidang Hubungan Masyarakat pada Kepolisian Daerah (Polda) yang bertugas mengelola informasi, publikasi, dokumentasi, pelayanan informasi publik, hubungan masyarakat, dan multimedia kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(104, 'apa itu bidhumas', 'Bidhumas adalah Bidang Hubungan Masyarakat pada Kepolisian Daerah (Polda) yang bertugas mengelola informasi, publikasi, dokumentasi, pelayanan informasi publik, hubungan masyarakat, dan multimedia kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(105, 'fungsi bidhumas', 'Bidhumas adalah Bidang Hubungan Masyarakat pada Kepolisian Daerah (Polda) yang bertugas mengelola informasi, publikasi, dokumentasi, pelayanan informasi publik, hubungan masyarakat, dan multimedia kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(106, 'bidang humas polda', 'Bidhumas adalah Bidang Hubungan Masyarakat pada Kepolisian Daerah (Polda) yang bertugas mengelola informasi, publikasi, dokumentasi, pelayanan informasi publik, hubungan masyarakat, dan multimedia kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(107, 'humas polda', 'Bidhumas adalah Bidang Hubungan Masyarakat pada Kepolisian Daerah (Polda) yang bertugas mengelola informasi, publikasi, dokumentasi, pelayanan informasi publik, hubungan masyarakat, dan multimedia kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(108, 'siapa kepala humas', 'Kabidhumas adalah Kepala Bidang Hubungan Masyarakat yang memimpin pelaksanaan tugas kehumasan di lingkungan Polda.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(109, 'kabidhumas', 'Kabidhumas adalah Kepala Bidang Hubungan Masyarakat yang memimpin pelaksanaan tugas kehumasan di lingkungan Polda.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(110, 'apa itu kabidhumas', 'Kabidhumas adalah Kepala Bidang Hubungan Masyarakat yang memimpin pelaksanaan tugas kehumasan di lingkungan Polda.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(111, 'struktur bidhumas', 'Struktur Bidhumas terdiri dari Subbagrenmin, Subbid Penmas, Subbid PID, dan Subbid Multimedia (Mulmed).', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(112, 'susunan bidhumas', 'Struktur Bidhumas terdiri dari Subbagrenmin, Subbid Penmas, Subbid PID, dan Subbid Multimedia (Mulmed).', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(113, 'ada berapa subbagian humas', 'Struktur Bidhumas terdiri dari Subbagrenmin, Subbid Penmas, Subbid PID, dan Subbid Multimedia (Mulmed).', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(114, 'subbagian humas', 'Struktur Bidhumas terdiri dari Subbagrenmin, Subbid Penmas, Subbid PID, dan Subbid Multimedia (Mulmed).', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(115, 'apa itu penmas', 'Subbid Penmas adalah Subbidang Penerangan Masyarakat yang bertugas memberikan informasi, penerangan, dan menjalin hubungan kemitraan dengan masyarakat maupun media.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(116, 'subbid penmas', 'Subbid Penmas adalah Subbidang Penerangan Masyarakat yang bertugas memberikan informasi, penerangan, dan menjalin hubungan kemitraan dengan masyarakat maupun media.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(117, 'fungsi penmas', 'Subbid Penmas adalah Subbidang Penerangan Masyarakat yang bertugas memberikan informasi, penerangan, dan menjalin hubungan kemitraan dengan masyarakat maupun media.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(118, 'penerangan masyarakat', 'Subbid Penmas adalah Subbidang Penerangan Masyarakat yang bertugas memberikan informasi, penerangan, dan menjalin hubungan kemitraan dengan masyarakat maupun media.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(119, 'urpenum', 'Urpenum adalah Urusan Penerangan Umum pada Subbid Penmas yang bertugas menyampaikan informasi umum kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(120, 'apa itu urpenum', 'Urpenum adalah Urusan Penerangan Umum pada Subbid Penmas yang bertugas menyampaikan informasi umum kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(121, 'penerangan umum', 'Urpenum adalah Urusan Penerangan Umum pada Subbid Penmas yang bertugas menyampaikan informasi umum kepolisian kepada masyarakat.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(122, 'urpensat', 'Urpensat adalah Urusan Penerangan Satuan yang bertugas memberikan informasi terkait kegiatan dan tugas satuan di lingkungan kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(123, 'apa itu urpensat', 'Urpensat adalah Urusan Penerangan Satuan yang bertugas memberikan informasi terkait kegiatan dan tugas satuan di lingkungan kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(124, 'penerangan satuan', 'Urpensat adalah Urusan Penerangan Satuan yang bertugas memberikan informasi terkait kegiatan dan tugas satuan di lingkungan kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(125, 'urmitra', 'Urmitra adalah Urusan Kemitraan yang bertugas membangun hubungan kerja sama dan komunikasi antara kepolisian dengan masyarakat maupun media.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(126, 'apa itu urmitra', 'Urmitra adalah Urusan Kemitraan yang bertugas membangun hubungan kerja sama dan komunikasi antara kepolisian dengan masyarakat maupun media.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(127, 'kemitraan humas', 'Urmitra adalah Urusan Kemitraan yang bertugas membangun hubungan kerja sama dan komunikasi antara kepolisian dengan masyarakat maupun media.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(128, 'apa itu pid', 'Subbid PID adalah Subbidang Pengelolaan Informasi dan Dokumentasi yang bertugas mengelola informasi publik, dokumentasi kegiatan, peliputan, dan evaluasi informasi.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(129, 'subbid pid', 'Subbid PID adalah Subbidang Pengelolaan Informasi dan Dokumentasi yang bertugas mengelola informasi publik, dokumentasi kegiatan, peliputan, dan evaluasi informasi.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(130, 'fungsi pid', 'Subbid PID adalah Subbidang Pengelolaan Informasi dan Dokumentasi yang bertugas mengelola informasi publik, dokumentasi kegiatan, peliputan, dan evaluasi informasi.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(131, 'pengelolaan informasi dan dokumentasi', 'Subbid PID adalah Subbidang Pengelolaan Informasi dan Dokumentasi yang bertugas mengelola informasi publik, dokumentasi kegiatan, peliputan, dan evaluasi informasi.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(132, 'urpullahinfodok', 'Urpullahinfodok adalah Urusan Pengumpulan dan Pengolahan Informasi dan Dokumentasi yang bertugas mengumpulkan serta mengolah informasi dan dokumentasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(133, 'apa itu urpullahinfodok', 'Urpullahinfodok adalah Urusan Pengumpulan dan Pengolahan Informasi dan Dokumentasi yang bertugas mengumpulkan serta mengolah informasi dan dokumentasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(134, 'urlipprodok', 'Urlipprodok adalah Urusan Peliputan, Produksi, dan Dokumentasi yang bertugas melakukan peliputan kegiatan serta produksi dan dokumentasi informasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(135, 'apa itu urlipprodok', 'Urlipprodok adalah Urusan Peliputan, Produksi, dan Dokumentasi yang bertugas melakukan peliputan kegiatan serta produksi dan dokumentasi informasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(136, 'uranev', 'Uranev adalah Urusan Analisis dan Evaluasi yang bertugas melakukan analisis dan evaluasi terhadap informasi serta kegiatan dokumentasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(137, 'apa itu uranev', 'Uranev adalah Urusan Analisis dan Evaluasi yang bertugas melakukan analisis dan evaluasi terhadap informasi serta kegiatan dokumentasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(138, 'analisis dan evaluasi humas', 'Uranev adalah Urusan Analisis dan Evaluasi yang bertugas melakukan analisis dan evaluasi terhadap informasi serta kegiatan dokumentasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(139, 'apa itu mulmed', 'Subbid Multimedia (Mulmed) bertugas membuat konten kreatif digital, melakukan pemantauan media, analisa informasi digital, dan penyebaran informasi melalui media digital.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(140, 'subbid multimedia', 'Subbid Multimedia (Mulmed) bertugas membuat konten kreatif digital, melakukan pemantauan media, analisa informasi digital, dan penyebaran informasi melalui media digital.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(141, 'fungsi multimedia', 'Subbid Multimedia (Mulmed) bertugas membuat konten kreatif digital, melakukan pemantauan media, analisa informasi digital, dan penyebaran informasi melalui media digital.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(142, 'mulmed humas', 'Subbid Multimedia (Mulmed) bertugas membuat konten kreatif digital, melakukan pemantauan media, analisa informasi digital, dan penyebaran informasi melalui media digital.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(143, 'urprodukkreatif', 'Urprodukkreatif adalah Urusan Produksi Kreatif yang bertugas membuat desain, video, grafis, dan konten kreatif digital untuk publikasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(144, 'apa itu urprodukkreatif', 'Urprodukkreatif adalah Urusan Produksi Kreatif yang bertugas membuat desain, video, grafis, dan konten kreatif digital untuk publikasi kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(145, 'urpemanalis', 'Urpemanalis adalah Urusan Pemantauan dan Analisa yang bertugas memantau media serta menganalisa informasi dan opini publik terkait kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(146, 'apa itu urpemanalis', 'Urpemanalis adalah Urusan Pemantauan dan Analisa yang bertugas memantau media serta menganalisa informasi dan opini publik terkait kepolisian.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(147, 'urdisindig', 'Urdisindig adalah Urusan Diseminasi Informasi Digital yang bertugas menyebarluaskan informasi kepolisian melalui platform digital dan media sosial.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(148, 'apa itu urdisindig', 'Urdisindig adalah Urusan Diseminasi Informasi Digital yang bertugas menyebarluaskan informasi kepolisian melalui platform digital dan media sosial.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(149, 'diseminasi info digital', 'Urdisindig adalah Urusan Diseminasi Informasi Digital yang bertugas menyebarluaskan informasi kepolisian melalui platform digital dan media sosial.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(150, 'apa itu subbagrenmin', 'Subbagrenmin adalah Subbagian Perencanaan dan Administrasi yang bertugas mengelola perencanaan, administrasi, tata usaha, dan keuangan di lingkungan Bidhumas.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(151, 'fungsi renmin', 'Subbagrenmin adalah Subbagian Perencanaan dan Administrasi yang bertugas mengelola perencanaan, administrasi, tata usaha, dan keuangan di lingkungan Bidhumas.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf'),
(152, 'renmin humas', 'Subbagrenmin adalah Subbagian Perencanaan dan Administrasi yang bertugas mengelola perencanaan, administrasi, tata usaha, dan keuangan di lingkungan Bidhumas.', '2026-05-28 07:46:22', 'https://pusiknas.polri.go.id/web_pusiknas/uploads/produk_hukum/file_berkas/PERPOL%20NO%2014%20TH%202018%20TTG%20REVISI%20PERKAP%20NO%2022%20TH%202010%20TTG%20SOTK%20POLDA_gab.pdf');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `chatbot_memory`

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `chatbot_memory`
--
ALTER TABLE `chatbot_memory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
