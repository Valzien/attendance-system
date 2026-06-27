const API_BASE =
  import.meta.env.VITE_API_BASE ||
  'http://127.0.0.1:8000';

// =====================================================
// AUTHENTICATION
// =====================================================

// 1. Login User
export async function loginUser(username, password) {

  try {

    const response = await fetch(
      `${API_BASE}/login`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          username,
          password
        }),
      }
    );

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data);

    if (!response.ok) {

      return {

        success: false,

        message:
          typeof data?.detail === "string"
            ? data.detail
            : "Login gagal.",

      };

    }

    return {

      success: true,

      role: data.role || 'siswa',

      name: data.name || username,

      nip: data.nip,

      nis: data.nis,

      nisn: data.nisn,

      kelas: data.kelas,

      message: 'Login berhasil',

    };

  } catch (error) {

    console.error(error);

    return {

      success: false,

      message: 'Server tidak terhubung.',

    };

  }

}

// =====================================================
// ADMIN FUNCTIONS
// =====================================================

// 2. Get Admin Summary / Dashboard
export async function getAdminSummary() {

  try {

    const response = await fetch(
      `${API_BASE}/admin/summary`
    );

    if (!response.ok) return null;

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching admin summary:',
      error
    );

    return null;

  }

}

// =====================================================
// DATA KELAS
// =====================================================

// 3. Get Semua Kelas
export async function getKelas() {

  try {

    const response = await fetch(
      `${API_BASE}/classes`
    );

    if (!response.ok) {

      console.error(
        'Error fetching classes:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching kelas:',
      error
    );

    return [];

  }

}

// =====================================================
// DATA SISWA
// =====================================================

// 4. Get Semua Siswa
export async function getAllStudents() {

  try {

    const response = await fetch(
      `${API_BASE}/students`
    );

    if (!response.ok) {

      console.error(
        'Error fetching students:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching students:',
      error
    );

    return [];

  }

}

// 5. Get Data Siswa Berdasarkan NIS
export async function getStudentByNis(nis) {

  try {

    const response = await fetch(
      `${API_BASE}/students/${nis}`
    );

    if (!response.ok) {

      console.error(
        'Error fetching student:',
        response.statusText
      );

      return null;

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching student:',
      error
    );

    return null;

  }

}

// =====================================================
// DATA GURU
// =====================================================

// 6. Get Semua Guru
export async function getAllTeachers() {

  try {

    const response = await fetch(
      `${API_BASE}/teachers`
    );

    if (!response.ok) {

      console.error(
        'Error fetching teachers:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching teachers:',
      error
    );

    return [];

  }

}

// =====================================================
// JADWAL PELAJARAN
// =====================================================

// 7. Get Semua Jadwal Pelajaran
export async function getAllSchedules() {

  try {

    const response = await fetch(
      `${API_BASE}/schedules`
    );

    if (!response.ok) {

      console.error(
        'Error fetching schedules:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching schedules:',
      error
    );

    return [];

  }

}

// 8. Get Jadwal Pelajaran Berdasarkan Kelas
export async function getSchedulesByClass(
  className
) {

  try {

    const response = await fetch(
      `${API_BASE}/schedules/class/${className}`
    );

    if (!response.ok) {

      console.error(
        'Error fetching class schedules:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching class schedules:',
      error
    );

    return [];

  }

}

// =====================================================
// ABSENSI
// =====================================================

// 9. Get Absensi Siswa
export async function getStudentAttendance(
  nis
) {

  try {

    const response = await fetch(
      `${API_BASE}/attendance/${nis}`
    );

    if (!response.ok) {

      console.error(
        'Error fetching attendance:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching attendance:',
      error
    );

    return [];

  }

}

// 10. Get Absensi Hari Ini
export async function getTodayAttendance() {

  try {

    const response = await fetch(
      `${API_BASE}/attendance/today`
    );

    if (!response.ok) {

      console.error(
        'Error fetching today attendance:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching today attendance:',
      error
    );

    return [];

  }

}

// 11. Absen Masuk
export async function absenMasuk(
  nis,
  latitude,
  longitude,
  accuracy,
  image_base64
) {

  try {

    const response = await fetch(
      `${API_BASE}/absen/masuk`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          nis,
          latitude,
          longitude,
          accuracy,
          image_base64
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return {
        success: false,
        message:
          data?.error ||
          'Absen masuk gagal.',
      };

    }

    return {
      success: true,
      message:
        data?.message ||
        'Absen masuk berhasil',
      data: data,
    };

  } catch (error) {

    return {
      success: false,
      message: 'Server tidak terhubung.',
    };

  }

}

// 12. Absen Keluar
export async function absenKeluar(
  nis,
  latitude,
  longitude,
  accuracy,
  image_base64
) {

  try {

    const response = await fetch(
      `${API_BASE}/absen/keluar`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          nis,
          latitude,
          longitude,
          accuracy,
          image_base64
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return {
        success: false,
        message:
          data?.error ||
          'Absen keluar gagal.',
      };

    }

    return {
      success: true,
      message:
        data?.message ||
        'Absen keluar berhasil',
      data: data,
    };

  } catch (error) {

    return {
      success: false,
      message: 'Server tidak terhubung.',
    };

  }

}

// =====================================================
// FORM IZIN
// =====================================================

// 13. Get Form Izin Siswa
export async function getPermissionForms(
  nis
) {

  try {

    const response = await fetch(
      `${API_BASE}/permission-forms/${nis}`
    );

    if (!response.ok) {

      console.error(
        'Error fetching permission forms:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching permission forms:',
      error
    );

    return [];

  }

}

// =====================================================
// REKAP ABSENSI
// =====================================================

// 15. Get Rekap Absensi Berdasarkan Kelas
export async function getAttendanceReport(
  classId,
  startDate = null,
  endDate = null
) {

  try {

    let url =
      `${API_BASE}/attendance-report/class/${classId}`;

    const params = new URLSearchParams();

    if (startDate) {

      params.append(
        'start_date',
        startDate
      );

    }

    if (endDate) {

      params.append(
        'end_date',
        endDate
      );

    }

    if (params.toString()) {

      url += `?${params.toString()}`;

    }

    const response = await fetch(url);

    if (!response.ok) {

      console.error(
        'Error fetching attendance report:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching attendance report:',
      error
    );

    return [];

  }

}

// 16. Get Data Rekap dari student_attendance_data
export async function getStudentAttendanceData(
  nama_kelas,
  bulan
) {

  try {

    const response = await fetch(
      `${API_BASE}/student-attendance-data?nama_kelas=${encodeURIComponent(
        nama_kelas
      )}&bulan=${bulan}`
    );

    if (!response.ok) {

      console.error(
        'Error fetching student attendance data:',
        response.statusText
      );

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(
      'Error fetching student attendance data:',
      error
    );

    return [];

  }

}

// =====================================================
// UPDATE ABSENSI
// =====================================================

// 17. Update Jam Keluar Absensi
export async function updateAttendance(
  id_absen,
  jam_keluar
) {

  try {

    const response = await fetch(
      `${API_BASE}/attendance/${id_absen}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          jam_keluar
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return {

        success: false,

        message:
          data?.detail ||
          'Update absensi gagal.',

      };

    }

    return {

      success: true,

      message:
        data?.message ||
        'Absensi berhasil diperbarui',

    };

  } catch (error) {

    return {

      success: false,

      message: 'Server tidak terhubung.',

    };

  }

}

// =====================================================
// UPDATE STATUS ABSENSI
// =====================================================

export async function updateAttendanceStatus(
  id_absen,
  status_kehadiran,
  keterangan = ''
) {

  try {

    const response = await fetch(
      `${API_BASE}/attendance-status/${id_absen}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          status_kehadiran,
          keterangan
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {

      return {

        success: false,

        message:
          data?.detail ||
          'Update gagal',

      };

    }

    return {

      success: true,

      message:
        data?.message ||
        'Berhasil',

    };

  } catch (error) {

    return {

      success: false,

      message: 'Server tidak terhubung',

    };

  }

}

// =====================================================
// FACE RECOGNITION
// =====================================================

// 18. Verifikasi Wajah Sebelum Absen
export async function verifyFace(
  nis,
  image_base64
) {

  try {

    const response = await fetch(
      `${API_BASE}/face/verify`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          nis,
          image_base64
        }),
      }
    );

    const data = await response.json();

    return {

      success: response.ok,

      match: data.match,

      message: data.message,

      confidence: data.confidence

    };

  } catch {

    return {

      success: false,

      message: 'Server tidak terhubung'

    };

  }

}

// =====================================================
// SEARCH USER
// =====================================================

export async function searchUser(keyword) {

  try {

    const response = await fetch(
      `${API_BASE}/admin/search-user?q=${keyword}`
    );

    const data = await response.json();

    return data;

  } catch (error) {

    console.error(error);

    return {

      found: false

    };

  }

}

// =====================================================
// RESET PASSWORD USER
// =====================================================

export async function resetUserPassword(
  role,
  user_id,
  new_password
) {

  try {

    const response = await fetch(
      `${API_BASE}/admin/reset-password`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          role,
          user_id: String(user_id),
          new_password
        }),
      }
    );

    const data = await response.json();

    return data;

  } catch (error) {

    console.error(error);

    return {

      success: false,

      message: 'Server tidak terhubung'

    };

  }

}

// =====================================================
// GET ATTENDANCE HISTORY
// =====================================================

export const getAttendanceHistory = async (
  kelas = "",
  tanggal = "",
  search = ""
) => {

  try {

    const params = new URLSearchParams();

    if (kelas) {
      params.append("kelas", kelas);
    }

    if (tanggal) {
      params.append("tanggal", tanggal);
    }

    if (search) {
      params.append("search", search);
    }

    const response = await fetch(
      `http://127.0.0.1:8000/attendance-history?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        "Gagal mengambil history absensi"
      );
    }

    return await response.json();

  } catch (error) {

    console.error(
      "Error fetching attendance history:",
      error
    );

    return [];
  }
};

// ======================================
// IMPORT SISWA
// ======================================

export const importStudents = async (file) => {

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    "http://127.0.0.1:8000/students/import",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {

    throw new Error(
      "Gagal import data siswa"
    );
  }

  return await response.json();
};

// =====================================================
// HISTORY SISWA SENDIRI
// =====================================================

export async function getStudentHistory(
  nis
) {

  try {

    const response = await fetch(
      `${API_BASE}/student-history/${nis}`
    );

    if (!response.ok) {

      throw new Error(
        'Gagal mengambil history siswa'
      );

    }

    return await response.json();

  } catch (error) {

    console.error(error);

    return [];

  }

}

// =====================================================
// SUBMIT IZIN SISWA
// =====================================================

export async function submitPermissionForm(
  formData
) {

  try {

    const response = await fetch(
      `${API_BASE}/izin/submit`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(formData)
      }
    );

      const data = await response.json();

      return {
        success: data?.success === true,
        message:
          data?.message ||
          (data?.detail) ||
          (response.ok ? 'Izin berhasil dikirim' : 'Gagal mengirim izin')
      };

  } catch (error) {

    console.error(error);

    return {
      success: false,
      message: 'Server tidak terhubung'
    };

  }

}

// =====================================================
// GET NOTIFICATIONS
// =====================================================

export async function getNotifications(
  nis
) {

  try {

    const response = await fetch(
      `${API_BASE}/notifications/${nis}`
    );

    if (!response.ok) {

      return [];

    }

    return await response.json();

  } catch (error) {

    console.error(error);

    return [];

  }

}

// =====================================================
// UNREAD NOTIFICATION COUNT
// =====================================================

export async function getUnreadNotificationCount(
  nis
) {

  try {

    const response = await fetch(
      `${API_BASE}/notifications/unread-count/${nis}`
    );

    if (!response.ok) {

      return {
        total: 0
      };

    }

    return await response.json();

  } catch (error) {

    console.error(error);

    return {
      total: 0
    };

  }

}

// =====================================================
// GURU NOTIFICATION COUNT
// =====================================================

export async function getGuruNotificationCount() {

  try {

    const response = await fetch(
      `${API_BASE}/guru/notifications/count`
    );

    if (!response.ok) {

      return {
        total: 0
      };

    }

    return await response.json();

  } catch (error) {

    console.error(error);

    return {
      total: 0
    };

  }

}

// =====================================================
// ADMIN NOTIFICATION COUNT
// =====================================================

export async function getAdminNotificationCount() {

  try {

    const response = await fetch(
      `${API_BASE}/admin/notifications/count`
    );

    if (!response.ok) {

      return {
        total: 0
      };

    }

    return await response.json();

  } catch (error) {

    console.error(error);

    return {
      total: 0
    };

  }

}

// =====================================================
// WEEKLY ATTENDANCE
// =====================================================

export const getWeeklyAttendance = async () => {

  try {

    const response = await fetch(
      "http://127.0.0.1:8000/attendance/weekly"
    );

    return await response.json();

  } catch (error) {

    console.error(error);

    return [];

  }

};

// =====================================================
// CHANGE PASSWORD
// =====================================================

export async function changePassword(
  username,
  old_password,
  new_password,
  role
) {

  try {

    const response = await fetch(
      `${API_BASE}/change-password`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          username,
          old_password,
          new_password,
          role
        }),
      }
    );

    const data = await response.json();

    return data;

  } catch (error) {

    console.error(error);

    return {
      success: false,
      message: 'Server tidak terhubung'
    };

  }

}