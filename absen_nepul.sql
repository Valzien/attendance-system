-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 27 Jun 2026 pada 10.41
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `absen_nepul`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `data_form_izin`
--

CREATE TABLE `data_form_izin` (
  `id` int(11) NOT NULL,
  `nis` int(15) NOT NULL,
  `nama_siswa` varchar(50) NOT NULL,
  `kelas` varchar(15) NOT NULL,
  `tanggal` date NOT NULL,
  `lampiran` varchar(100) NOT NULL,
  `alasan` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `guru_read` tinyint(1) DEFAULT 0,
  `keterangan_admin` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `data_form_izin`
--

INSERT INTO `data_form_izin` (`id`, `nis`, `nama_siswa`, `kelas`, `tanggal`, `lampiran`, `alasan`, `status`, `guru_read`, `keterangan_admin`) VALUES
(1, 23456901, 'Rendi', '10.2', '2026-05-17', '#orange.jpg', 'sakit', 'disetujui', 1, NULL),
(2, 1234567890, 'Ahmad Rizky', '10-1', '2026-05-15', 'anu', 'adalah pokoknya', 'ditolak', 1, NULL),
(3, 1234567890, 'Ahmad Rizky', '10.1', '2026-05-17', 'WhatsApp Image 2026-05-17 at 1.40.09 PM (1).jpeg', 'acara keluarga', 'disetujui', 1, NULL),
(4, 1234567890, 'Ahmad Rizky', '10.1', '2026-05-17', 'Blueberry Diet Delicious Vitamin, Blueberry, Sweets, Food PNG Transparent Image and Clipart for Free', 'sakit', 'disetujui', 1, NULL),
(5, 23456901, 'Rendi', '10.2', '2026-05-17', '20260514_094639.jpg', 'acara keluarga', 'disetujui', 1, NULL),
(6, 2147483647, 'Rendi', '10.2', '2026-05-18', 'apple.jpg', 'Makan', 'ditolak', 1, NULL),
(7, 23456901, 'Rendi', '10-2', '2026-05-18', 'uploads/23456901_2026-05-18_1779090097.jpg', 'sakit', 'disetujui', 1, NULL),
(8, 1234567890, 'Ahmad Rizky', '10-1', '2026-05-18', 'uploads/1234567890_2026-05-18_1779091037.jpg', 'Berak', 'disetujui', 1, NULL),
(9, 123456, 'GHema', '12 IPS 2', '2026-05-20', 'uploads/123456_2026-05-20_1779257168.jpg', 'Males', 'ditolak', 1, 'Alasan tidak diterima'),
(11, 123456, 'Dela', '10-1', '2026-05-25', 'uploads/123456_2026-05-25_1779712722.jpg', 'Diare', 'disetujui', 1, ''),
(12, 23456901, 'Rendi', '10-2', '2026-05-25', 'uploads/23456901_2026-05-25_1779712862.jpg', 'Acara Keluarga', 'ditolak', 1, 'Bukti tidak valid'),
(13, 2147483647, 'Amay', '10-2', '2026-05-26', 'uploads/231011402778_2026-05-26_1779768064.jpg', 'Sakit', 'disetujui', 1, ''),
(14, 23456901, 'Rendi', '10-2', '2026-06-05', 'uploads/23456901_2026-06-05_1780640191.jpg', 'sakit', 'pending', 1, '');

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwal_pelajaran`
--

CREATE TABLE `jadwal_pelajaran` (
  `id_mapel` varchar(15) NOT NULL,
  `mapel` varchar(50) NOT NULL,
  `jam` time NOT NULL,
  `hari` varchar(12) NOT NULL,
  `guru` varchar(50) NOT NULL,
  `kelas` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `jadwal_pelajaran`
--

INSERT INTO `jadwal_pelajaran` (`id_mapel`, `mapel`, `jam`, `hari`, `guru`, `kelas`) VALUES
('BIG01', 'Bahasa Inggris', '09:15:00', 'Rabu', 'Bela', '10-3'),
('BIN01', 'Bahasa Indonesia', '08:30:00', 'Selasa', 'Dermawan', '10-1'),
('FSK01', 'Fisika', '07:45:00', 'Selasa', 'Dela', '10-1'),
('GEO01', 'Geologi', '07:45:00', 'Selasa', 'Gio', '10-3'),
('MTK01', 'Matematika', '07:45:00', 'Senin', 'Budi', '10-1'),
('PKN01', 'Pendidikan Kewarganegaraan', '09:15:00', 'Rabu', 'Rita', '10-2'),
('SJR01', 'Sejarah', '08:30:00', 'Senin', 'Roky', '10-2');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kelas`
--

CREATE TABLE `kelas` (
  `id` int(11) NOT NULL,
  `nama_kelas` varchar(20) DEFAULT NULL,
  `wali_kelas` varchar(100) DEFAULT NULL,
  `jam_pulang` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kelas`
--

INSERT INTO `kelas` (`id`, `nama_kelas`, `wali_kelas`, `jam_pulang`) VALUES
(1, '10-1', 'Budi', '14:00:00'),
(2, '10-2', 'Sari', '14:00:00'),
(3, '10-3', 'Andi', '14:00:00'),
(4, '10-4', 'Lidya', '14:00:00'),
(5, '10-5', 'Bowo', '14:00:00'),
(6, '10-6', 'Sri', '14:00:00'),
(7, '10-7', 'Surya', '14:00:00'),
(8, '11 IPA 1', 'Nessi', '14:40:00'),
(9, '11 IPA 2', 'Nagita', '14:40:00'),
(10, '11 IPA 3', 'Bela', '14:40:00'),
(11, '11 IPS 1', 'Fatur', '14:40:00'),
(12, '11 IPS 2', 'Rival', '14:40:00'),
(13, '11 IPS 3', 'Arya', '14:40:00'),
(14, '11 IPS 4', 'Andre', '14:40:00'),
(15, '12 IPA 1', 'Dermawan', '14:40:00'),
(16, '12 IPA 2', 'Yassar', '14:40:00'),
(17, '12 IPA 3', 'Roky', '14:40:00'),
(18, '12 IPS 1', 'Zahra', '14:40:00'),
(19, '12 IPS 2', 'Jaya', '14:40:00'),
(20, '12 IPS 3', 'Faizah', '14:40:00'),
(21, '12 IPS 4', 'Riyadi', '14:40:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id_notif` int(11) NOT NULL,
  `nis` varchar(12) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id_notif`, `nis`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, '1234567890', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-15 06:43:53'),
(2, '1234567890', 'Pengajuan Izin', 'Pengajuan izin kamu ditolak.', 1, '2026-05-15 06:44:04'),
(3, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 08:35:21'),
(4, '1234567890', 'Pengajuan Izin', 'Pengajuan izin kamu ditolak.', 1, '2026-05-17 09:00:41'),
(5, '1234567890', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 09:08:32'),
(6, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 09:11:17'),
(7, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu ditolak.', 1, '2026-05-17 09:28:35'),
(8, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 09:32:12'),
(9, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 09:58:53'),
(10, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:05:12'),
(11, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:05:22'),
(12, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:10:20'),
(13, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:10:55'),
(14, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:10:59'),
(15, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:15:38'),
(16, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:15:43'),
(17, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:26:17'),
(18, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:26:23'),
(19, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu ditolak.', 1, '2026-05-17 10:26:29'),
(20, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-17 10:26:34'),
(21, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-18 02:15:10'),
(22, '2147483647', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 0, '2026-05-18 07:13:11'),
(23, '2147483647', 'Pengajuan Izin', 'Pengajuan izin kamu ditolak.', 0, '2026-05-18 07:13:16'),
(24, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-18 07:42:17'),
(25, '1234567890', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-18 08:08:12'),
(26, '123456', 'Pengajuan Izin', 'Pengajuan izin kamu ditolak. Alasan: Alasan tidak diterima', 1, '2026-05-22 09:19:30'),
(27, '2147483647', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 0, '2026-05-25 12:28:20'),
(28, '123456', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 1, '2026-05-25 12:39:24'),
(29, '23456901', 'Pengajuan Izin', 'Pengajuan izin kamu ditolak. Alasan: Bukti tidak valid', 1, '2026-05-25 12:41:41'),
(30, '2147483647', 'Pengajuan Izin', 'Pengajuan izin kamu telah disetujui.', 0, '2026-06-03 08:16:40'),
(32, '231011478', 'Pengajuan Disetujui', 'Pengajuan izin kamu telah disetujui admin', 1, '2026-06-08 03:55:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_attendance_data`
--

CREATE TABLE `student_attendance_data` (
  `id_absen` int(15) NOT NULL,
  `nis` varchar(12) DEFAULT NULL,
  `nama_siswa` varchar(50) NOT NULL,
  `id_kelas` varchar(15) NOT NULL,
  `tanggal` date NOT NULL,
  `jam_masuk` time DEFAULT NULL,
  `jam_keluar` time DEFAULT NULL,
  `status_kehadiran` enum('hadir','terlambat','alfa','izin') NOT NULL,
  `keterangan` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `foto_absen` text DEFAULT NULL,
  `foto_keluar` text DEFAULT NULL,
  `latitude_masuk` decimal(10,8) DEFAULT NULL,
  `longitude_masuk` decimal(11,8) DEFAULT NULL,
  `latitude_keluar` decimal(10,8) DEFAULT NULL,
  `longitude_keluar` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `student_attendance_data`
--

INSERT INTO `student_attendance_data` (`id_absen`, `nis`, `nama_siswa`, `id_kelas`, `tanggal`, `jam_masuk`, `jam_keluar`, `status_kehadiran`, `keterangan`, `created_at`, `foto_absen`, `foto_keluar`, `latitude_masuk`, `longitude_masuk`, `latitude_keluar`, `longitude_keluar`) VALUES
(24, '231011478', 'Amay', '2', '2026-05-25', '16:10:32', NULL, 'alfa', 'Melewati batas waktu absen', '2026-05-25 09:10:32', 'attendance_photos\\10-2\\231011402778\\2026-05-25_16-10-32.jpg', NULL, -6.34592080, 106.69252028, -6.34592080, 106.69252028),
(25, '231011478', 'Amay', '2', '2026-05-25', '07:00:00', '07:00:00', 'izin', 'Sakit', '2026-05-25 12:28:20', NULL, NULL, NULL, NULL, NULL, NULL),
(28, '123456', 'Dela', '1', '2026-06-24', '10:45:50', NULL, 'terlambat', 'Datang terlambat', '2026-06-24 03:45:50', 'attendance_photos/10-1/123456/2026-06-24_10-45-50.jpg', NULL, -6.34628700, 106.69127400, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_data`
--

CREATE TABLE `student_data` (
  `nis` varchar(12) NOT NULL,
  `nisn` varchar(12) NOT NULL,
  `nama_siswa` varchar(50) NOT NULL,
  `id_kelas` int(11) DEFAULT NULL,
  `wali_kelas` varchar(30) NOT NULL,
  `alamat` varchar(100) NOT NULL,
  `password` varchar(20) NOT NULL,
  `no_wa_siswa` varchar(15) DEFAULT NULL,
  `no_wa_ortu` varchar(15) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tanggal_lahir` date DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `student_data`
--

INSERT INTO `student_data` (`nis`, `nisn`, `nama_siswa`, `id_kelas`, `wali_kelas`, `alamat`, `password`, `no_wa_siswa`, `no_wa_ortu`, `created_at`, `tanggal_lahir`, `username`) VALUES
('123456', '1234567890', 'Dela', 1, 'Budi Santoso', 'Cibubur', '123456', '081234567890', '089627851131', '0000-00-00 00:00:00', '2004-06-14', '1234567890'),
('1234567890', '202500001234', 'Ahmad Rizky', 1, 'Budi Santoso', 'Ciater', '1234567890', '085765412332', '085123605452', '2026-04-17 07:34:37', '2005-04-29', '202500001234'),
('231011478', '23101148', 'Amay', 2, 'Roky', 'Tangerang Selatan', '100505', '081298765432', '081298765433', '0000-00-00 00:00:00', '2005-05-10', '23101148'),
('234567898', '23456765676', 'Junho', 4, 'Ghema', 'Jakarta', '240606', '89999999878', '89999999878', '2026-06-24 02:06:24', '2006-06-24', '23456765676'),
('23456901', '200002026', 'Rendi', 2, 'Roky', 'Depok', '280205', '08123456789', '08234567891', '2026-05-15 10:53:29', '2006-01-01', '200002026'),
('987654321', '202667903', 'Alya', 3, 'Jaya', 'Pamulang', '123456', '98767876767', '98767876767', '2026-05-26 03:16:20', '2006-05-27', '202667903');

-- --------------------------------------------------------

--
-- Struktur dari tabel `teacher_data`
--

CREATE TABLE `teacher_data` (
  `NIP` int(15) NOT NULL,
  `Nama` varchar(100) NOT NULL,
  `Tanggal_lahir` date NOT NULL,
  `Alamat` varchar(100) NOT NULL,
  `Guru_Pengampu` varchar(30) NOT NULL,
  `Nomor_Telepon` varchar(15) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'guru',
  `username` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `teacher_data`
--

INSERT INTO `teacher_data` (`NIP`, `Nama`, `Tanggal_lahir`, `Alamat`, `Guru_Pengampu`, `Nomor_Telepon`, `password`, `role`, `username`) VALUES
(23101140, 'Bela', '1999-05-14', 'Bogor', 'Bahasa Inggris', '2147483647', '140599', 'guru', '23101140'),
(23101141, 'Roky', '1990-05-13', 'Pacitan', 'Sejarah', '2147483647', '130590', 'admin', '23101141'),
(23101142, 'Budi', '1995-02-02', 'Pamulang', 'Matematika', '2147483647', '19950202', 'guru', '23101142'),
(23101145, 'Ghema', '2006-05-27', 'Cibubur', 'Pendidikan Kewarganegaraan', '87877878787', '270506', 'admin', '23101145'),
(23101146, 'Darmawan', '1992-02-28', 'Tangerang', 'Bahasa Indonesia', '081234567890', '280292', 'guru', '23101146');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `data_form_izin`
--
ALTER TABLE `data_form_izin`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `jadwal_pelajaran`
--
ALTER TABLE `jadwal_pelajaran`
  ADD PRIMARY KEY (`id_mapel`);

--
-- Indeks untuk tabel `kelas`
--
ALTER TABLE `kelas`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_notif`);

--
-- Indeks untuk tabel `student_attendance_data`
--
ALTER TABLE `student_attendance_data`
  ADD PRIMARY KEY (`id_absen`);

--
-- Indeks untuk tabel `student_data`
--
ALTER TABLE `student_data`
  ADD PRIMARY KEY (`nis`);

--
-- Indeks untuk tabel `teacher_data`
--
ALTER TABLE `teacher_data`
  ADD PRIMARY KEY (`NIP`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `data_form_izin`
--
ALTER TABLE `data_form_izin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `kelas`
--
ALTER TABLE `kelas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id_notif` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT untuk tabel `student_attendance_data`
--
ALTER TABLE `student_attendance_data`
  MODIFY `id_absen` int(15) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
