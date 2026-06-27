import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

// Login Page
import Login from './pages/Login';
import Copyright from './pages/Copyright';
import PresensiPage from './pages/PresensiPage';

// Siswa Pages
import HomeSiswa from './pages/siswa/Home';
import ProfileSiswa from './pages/siswa/Profile';
import PermissionFormSiswa from './pages/siswa/PermissionForm';
import ScheduleSiswa from './pages/siswa/Schedule';
import HistorySiswa from './pages/siswa/History';
import AbsenSiswa from './pages/siswa/Absen';
import NotificationsSiswa from './pages/siswa/Notifications';

// Guru Pages
import HomeGuru from './pages/guru/Home';
import ProfileGuru from './pages/guru/Profile';
import Notifications from './pages/guru/Notifications';
import HistoryAbsensiGuru from './pages/guru/HistoryAbsensi';
import DataPengajuanGuru from './pages/guru/DataPengajuan';
import DataSiswaGuru from './pages/guru/DataSiswa';
import JadwalPelajaranGuru from './pages/guru/JadwalPelajaran';

// Admin Pages
import HomeAdmin from './pages/admin/Home';
import ProfileAdmin from './pages/admin/Profile';
import NotificationsAdmin from './pages/admin/Notifications';
import RekapAbsensiAdmin from './pages/admin/RekapAbsensi';
import JadwalPelajaranAdmin from './pages/admin/JadwalPelajaran';
import JadwalPelajaranEditAdmin from './pages/admin/JadwalPelajaranEdit';
import DataGuruAdmin from './pages/admin/DataGuru';
import ManageAdmin from "./pages/admin/ManageAdmin";
import DataGuruEdit from "./pages/admin/DataGuruEdit";
import DataSiswaAdmin from './pages/admin/DataSiswa';
import DataSiswaEdit from './pages/admin/DataSiswaEdit';
import DataPengajuanAdmin from './pages/admin/DataPengajuan';
import ResetPasswordAdmin from './pages/admin/ResetPassword';
import HistoryAbsensi from './pages/admin/HistoryAbsensi';

function App() {

  return (

    <Router>

      <Routes>

        {/* DEFAULT */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PRESENSI */}
        <Route
          path="/presensi"
          element={<PresensiPage />}
        />

        <Route
          path="/copyright"
          element={<Copyright />}
        />

        {/* SISWA */}
        <Route path="/home" element={<HomeSiswa />} />
        <Route path="/profile" element={<ProfileSiswa />} />
        <Route path="/permission" element={<PermissionFormSiswa />} />
        <Route path="/schedule" element={<ScheduleSiswa />} />
        <Route path="/history" element={<HistorySiswa />} />
        <Route path="/absen/:type" element={<AbsenSiswa />} />
        <Route path="/notifications" element={<NotificationsSiswa />} />

        {/* GURU */}
        <Route path="/guru/home" element={<HomeGuru />} />
        <Route path="/guru/profile" element={<ProfileGuru />} />
        <Route path="/guru/notifications" element={<Notifications />} />
        <Route path="/guru/history" element={<HistoryAbsensiGuru />} />
        <Route path="/guru/pengajuan" element={<DataPengajuanGuru />} />
        <Route path="/guru/data-siswa" element={<DataSiswaGuru />} />
        <Route path="/guru/jadwal" element={<JadwalPelajaranGuru />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/home" replace />}
        />

        <Route path="/admin/home" element={<HomeAdmin />} />
        <Route path="/admin/profile" element={<ProfileAdmin />} />
        <Route path="/admin/notifications" element={<NotificationsAdmin />} />
        <Route path="/admin/rekap" element={<RekapAbsensiAdmin />} />
        <Route path="/admin/jadwal" element={<JadwalPelajaranAdmin />} />
        <Route path="/admin/jadwal/edit/:id" element={<JadwalPelajaranEditAdmin />} />
        <Route path="/admin/data-guru" element={<DataGuruAdmin />} />
        <Route path="/admin/manage-admin" element={<ManageAdmin />} />
        <Route path="/admin/data-guru/edit/:nip" element={<DataGuruEdit />} />
        <Route path="/admin/data-siswa" element={<DataSiswaAdmin />} />
        <Route path="/admin/data-siswa/edit/:id" element={<DataSiswaEdit />} />
        <Route path="/admin/pengajuan" element={<DataPengajuanAdmin />} />
        <Route path="/admin/reset-password" element={<ResetPasswordAdmin />} />
        <Route path="/admin/history-absensi" element={<HistoryAbsensi />} />

      </Routes>

    </Router>
  );
}

export default App;