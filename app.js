// ============================================================
// Supabase Initialization
// ============================================================
const SUPABASE_URL = "https://mmfdqefxmmmgtiqapuon.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RAvTKS5CgOyfS-pttHh7SA_Bs5Kqoky";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// OOP Models — Inheritance, Polymorphism, Encapsulation
// ============================================================

/**
 * Base class User
 */
class User {
  constructor(email, password) {
    this._email = email;
    this._password = password;
  }

  getRole() {
    return 'User';
  }

  get email() {
    return this._email;
  }

  verifyPassword(password) {
    return this._password === password;
  }
}

/**
 * Admin class — inherits from User
 */
class Admin extends User {
  constructor(email, password) {
    super(email, password);
  }

  getRole() {
    return 'Admin';
  }
}

/**
 * Mahasiswa class
 */
class Mahasiswa {
  constructor(nama, nim, programStudi, ipk, id = undefined) {
    this.id = id;
    this.nama = nama;
    this._nim = nim;
    this.programStudi = programStudi;
    this._ipk = this.validateIpk(ipk);
  }

  get nim() {
    return this._nim;
  }

  set nim(value) {
    if (!value || value.trim() === '') {
      throw new Error('NIM tidak boleh kosong');
    }
    this._nim = value.trim();
  }

  get ipk() {
    return this._ipk;
  }

  set ipk(value) {
    this._ipk = this.validateIpk(value);
  }

  validateIpk(value) {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0.0 || parsed > 4.0) {
      throw new Error('IPK harus antara 0.0 dan 4.0');
    }
    return parsed;
  }

  toObject() {
    return {
      nama: this.nama,
      nim: this._nim,
      program_studi: this.programStudi,
      ipk: this._ipk,
    };
  }

  static fromApiData(data) {
    return new Mahasiswa(
      data.nama,
      data.nim,
      data.program_studi,
      parseFloat(data.ipk),
      data.id
    );
  }
}

// ============================================================
// Data Processing Algorithms
// ============================================================

/**
 * Linear Search by Name — O(n)
 */
function linearSearchByName(students, query) {
  const results = [];
  const lowerQuery = query.toLowerCase().trim();

  for (let i = 0; i < students.length; i++) {
    if (students[i].nama.toLowerCase().includes(lowerQuery)) {
      results.push(students[i]);
    }
  }

  return results;
}

/**
 * Binary Search by NIM — O(log n)
 */
function binarySearchByNim(students, nim) {
  const sorted = [...students].sort((a, b) => a.nim.localeCompare(b.nim));

  let low = 0;
  let high = sorted.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midNim = sorted[mid].nim;

    if (midNim === nim) {
      return sorted[mid];
    } else if (midNim < nim) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return null;
}

/**
 * Bubble Sort by IPK — O(n²)
 */
function bubbleSortByIpk(students, order) {
  const arr = [...students];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      const shouldSwap = order === 'desc'
        ? arr[j].ipk < arr[j + 1].ipk
        : arr[j].ipk > arr[j + 1].ipk;

      if (shouldSwap) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    if (!swapped) break;
  }

  return arr;
}

/**
 * Selection Sort by IPK — O(n²)
 */
function selectionSortByIpk(students, order) {
  const arr = [...students];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minMaxIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (order === 'desc') {
        if (arr[j].ipk > arr[minMaxIdx].ipk) minMaxIdx = j;
      } else {
        if (arr[j].ipk < arr[minMaxIdx].ipk) minMaxIdx = j;
      }
    }
    if (minMaxIdx !== i) {
      [arr[i], arr[minMaxIdx]] = [arr[minMaxIdx], arr[i]];
    }
  }

  return arr;
}

/**
 * Merge Sort by IPK — O(n log n)
 */
function mergeSortByIpk(students, order) {
  if (students.length <= 1) return students;

  const mid = Math.floor(students.length / 2);
  const left = mergeSortByIpk(students.slice(0, mid), order);
  const right = mergeSortByIpk(students.slice(mid), order);

  return merge(left, right, order);
}

function merge(left, right, order) {
  let result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    let condition = order === 'desc' ? left[i].ipk >= right[j].ipk : left[i].ipk <= right[j].ipk;
    if (condition) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  return result.concat(left.slice(i)).concat(right.slice(j));
}

/**
 * Sequential Search by Program Studi — O(n)
 */
function sequentialSearchByProdi(students, query) {
  const results = [];
  const lowerQuery = query.toLowerCase().trim();

  for (let i = 0; i < students.length; i++) {
    if (students[i].programStudi.toLowerCase().includes(lowerQuery)) {
      results.push(students[i]);
    }
  }

  return results;
}

// ============================================================
// Application State & UI Manager
// ============================================================

const PRODI_OPTIONS = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Elektro',
  'Teknik Sipil',
  'Manajemen',
  'Akuntansi',
  'Hukum',
  'Psikologi',
  'Kedokteran',
  'Farmasi',
];

let state = {
  user: null,
  students: [],
  loading: true,
  searchQuery: '',
  searchAlgo: 'linear', // 'linear' | 'binary' | 'sequential'
  sortAlgo: 'bubble', // 'bubble' | 'selection' | 'merge'
  sortOrder: 'none', // 'none' | 'asc' | 'desc'
  showModal: false,
  editingStudent: null,
  deleteConfirm: null,
  emailStudent: null,
  submitting: false,
  algorithmInfo: ''
};

// Elements DOM
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loadingScreen = document.getElementById('loading-screen');

// Login Form Elements
const authTitle = document.getElementById('auth-title');
const authSubmitBtnText = document.getElementById('auth-submit-btn-text');
const authToggleText = document.getElementById('auth-toggle-text');
const btnToggleAuthMode = document.getElementById('btn-toggle-auth-mode');
const authForm = document.getElementById('auth-form');
const confirmPasswordGroup = document.getElementById('confirm-password-group');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const confirmPasswordInput = document.getElementById('confirm-password-input');
const showPasswordBtn = document.getElementById('show-password-btn');
const showPasswordIcon = document.getElementById('show-password-icon');
const authErrorAlert = document.getElementById('auth-error-alert');
const authErrorMessage = document.getElementById('auth-error-message');
const demoAccountBanner = document.getElementById('demo-account-banner');

// Dashboard Elements
const btnLogout = document.getElementById('btn-logout');
const totalStudentsVal = document.getElementById('total-students-val');
const avgIpkVal = document.getElementById('avg-ipk-val');
const highestIpkVal = document.getElementById('highest-ipk-val');
const lowestIpkVal = document.getElementById('lowest-ipk-val');
const btnAddStudent = document.getElementById('btn-add-student');
const searchAlgoSelect = document.getElementById('search-algo-select');
const searchInput = document.getElementById('search-input');
const btnSearchAction = document.getElementById('btn-search-action');
const btnSortBubble = document.getElementById('btn-sort-bubble');
const btnSortSelection = document.getElementById('btn-sort-selection');
const btnSortMerge = document.getElementById('btn-sort-merge');
const btnResetFilters = document.getElementById('btn-reset-filters');
const btnExportJson = document.getElementById('btn-export-json');
const btnImportJson = document.getElementById('btn-import-json');
const inputImportJson = document.getElementById('input-import-json');
const algorithmInfoContainer = document.getElementById('algorithm-info-container');
const algorithmInfoText = document.getElementById('algorithm-info-text');
const studentTableBody = document.getElementById('student-table-body');
const studentTableLoading = document.getElementById('student-table-loading');
const studentTableEmpty = document.getElementById('student-table-empty');
const studentTableEmptyTitle = document.getElementById('student-table-empty-title');
const studentTableEmptyDesc = document.getElementById('student-table-empty-desc');

// Modal Elements
const studentModal = document.getElementById('student-modal');
const modalTitle = document.getElementById('modal-title');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancelModal = document.getElementById('btn-cancel-modal');
const btnSubmitModal = document.getElementById('btn-submit-modal');
const btnSubmitModalText = document.getElementById('btn-submit-modal-text');
const btnSubmitModalSpinner = document.getElementById('btn-submit-modal-spinner');

// Form Modal Inputs & Errors
const inputNama = document.getElementById('input-nama');
const inputNim = document.getElementById('input-nim');
const inputProdi = document.getElementById('input-prodi');
const inputIpk = document.getElementById('input-ipk');
const errorNama = document.getElementById('error-nama');
const errorNim = document.getElementById('error-nim');
const errorProdi = document.getElementById('error-prodi');
const errorIpk = document.getElementById('error-ipk');

// Delete Confirmation Elements
const deleteModal = document.getElementById('delete-modal');
const deleteConfirmText = document.getElementById('delete-confirm-text');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');

// Email Modal Elements
const emailModal = document.getElementById('email-modal');
const btnOpenComplaint = document.getElementById('btn-open-complaint');
const inputEmailTo = document.getElementById('input-email-to');
const inputEmailNama = document.getElementById('input-email-nama');
const inputEmailNim = document.getElementById('input-email-nim');
const inputEmailFrom = document.getElementById('input-email-from');
const inputEmailSubject = document.getElementById('input-email-subject');
const inputEmailMessage = document.getElementById('input-email-message');

const errorEmailTo = document.getElementById('error-email-to');
const errorEmailNama = document.getElementById('error-email-nama');
const errorEmailNim = document.getElementById('error-email-nim');
const errorEmailFrom = document.getElementById('error-email-from');
const errorEmailSubject = document.getElementById('error-email-subject');
const errorEmailMessage = document.getElementById('error-email-message');

const btnCloseEmailModal = document.getElementById('btn-close-email-modal');
const btnCancelEmailModal = document.getElementById('btn-cancel-email-modal');
const btnSubmitEmailModal = document.getElementById('btn-submit-email-modal');
const btnSubmitEmailModalText = document.getElementById('btn-submit-email-modal-text');
const btnSubmitEmailModalSpinner = document.getElementById('btn-submit-email-modal-spinner');

// Toast Notification
const toastNotification = document.getElementById('toast-notification');
const toastIconSuccess = document.getElementById('toast-icon-success');
const toastIconError = document.getElementById('toast-icon-error');
const toastMessage = document.getElementById('toast-message');

// Global Auth State Change Listener
supabaseClient.auth.onAuthStateChange((event, session) => {
  state.user = session ? session.user : null;
  state.loading = false;
  updateAuthStateUI();
});

// Toast Notification Helper
function showToast(type, message) {
  toastMessage.textContent = message;
  if (type === 'success') {
    toastNotification.style.background = 'rgba(16, 185, 129, 0.2)';
    toastNotification.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    toastIconSuccess.classList.remove('hidden');
    toastIconError.classList.add('hidden');
    toastMessage.className = 'text-emerald-300';
  } else {
    toastNotification.style.background = 'rgba(244, 63, 94, 0.2)';
    toastNotification.style.borderColor = 'rgba(244, 63, 94, 0.3)';
    toastIconSuccess.classList.add('hidden');
    toastIconError.classList.remove('hidden');
    toastMessage.className = 'text-rose-300';
  }

  toastNotification.classList.remove('opacity-0', '-translate-y-60');
  toastNotification.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toastNotification.classList.add('opacity-0', '-translate-y-60');
    toastNotification.classList.remove('opacity-100', 'translate-y-0');
  }, 4000);
}

// Update UI based on Auth State
let hasShownAnnouncement = false;
function updateAuthStateUI() {
  loadingScreen.classList.add('hidden');
  if (state.user) {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    
    // Set Beranda Profile based on user email
    const berandaNama = document.getElementById('beranda-nama');
    const berandaNim = document.getElementById('beranda-nim');
    if (berandaNama && berandaNim && state.user.email) {
      const emailName = state.user.email.split('@')[0];
      berandaNama.textContent = 'Mahasiswa ' + emailName.charAt(0).toUpperCase() + emailName.slice(1);
      // Generate a mock NIM based on string length to look realistic
      berandaNim.textContent = 'NIM: 2026' + (emailName.length * 123456).toString().padStart(6, '0');
    }

    if (!hasShownAnnouncement) {
      setTimeout(() => {
        const modal = document.getElementById('announcement-modal');
        const modalContent = document.getElementById('announcement-modal-content');
        if (modal && modalContent) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          // small delay to allow flex to apply before opacity transition
          setTimeout(() => {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
          }, 10);
        }
      }, 500); // show half a second after dashboard loads
      hasShownAnnouncement = true;
    }

    fetchStudents();
  } else {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    resetLoginForm();
  }
  lucide.createIcons();
}

// Reset Login Form States
let isRegisterMode = false;
function resetLoginForm() {
  isRegisterMode = false;
  authTitle.textContent = 'Masuk ke Akun';
  authSubmitBtnText.textContent = 'Masuk';
  authToggleText.textContent = 'Belum punya akun?';
  btnToggleAuthMode.textContent = 'Daftar';
  confirmPasswordGroup.classList.add('hidden');
  demoAccountBanner.classList.remove('hidden');
  authErrorAlert.classList.add('hidden');
  emailInput.value = '';
  passwordInput.value = '';
  confirmPasswordInput.value = '';
}

// Toggle Auth Mode (Login / Register)
btnToggleAuthMode.addEventListener('click', () => {
  isRegisterMode = !isRegisterMode;
  authErrorAlert.classList.add('hidden');
  if (isRegisterMode) {
    authTitle.textContent = 'Buat Akun Baru';
    authSubmitBtnText.textContent = 'Daftar';
    authToggleText.textContent = 'Sudah punya akun?';
    btnToggleAuthMode.textContent = 'Masuk';
    confirmPasswordGroup.classList.remove('hidden');
    demoAccountBanner.classList.add('hidden');
  } else {
    authTitle.textContent = 'Masuk ke Akun';
    authSubmitBtnText.textContent = 'Masuk';
    authToggleText.textContent = 'Belum punya akun?';
    btnToggleAuthMode.textContent = 'Daftar';
    confirmPasswordGroup.classList.add('hidden');
    demoAccountBanner.classList.remove('hidden');
  }
  lucide.createIcons();
});

// Toggle Password Visibility
let isPasswordVisible = false;
showPasswordBtn.addEventListener('click', () => {
  isPasswordVisible = !isPasswordVisible;
  if (isPasswordVisible) {
    passwordInput.type = 'text';
    showPasswordIcon.setAttribute('data-lucide', 'eye-off');
  } else {
    passwordInput.type = 'password';
    showPasswordIcon.setAttribute('data-lucide', 'eye');
  }
  lucide.createIcons();
});

// Handle Auth Form Submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authErrorAlert.classList.add('hidden');

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!email || !password) {
    showAuthError('Email dan kata sandi wajib diisi');
    return;
  }

  if (password.length < 6) {
    showAuthError('Kata sandi minimal 6 karakter');
    return;
  }

  if (isRegisterMode) {
    if (password !== confirmPassword) {
      showAuthError('Kata sandi tidak cocok');
      return;
    }
  }

  // Show loading on submit button
  const submitBtn = authForm.querySelector('button[type="submit"]');
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>`;

  try {
    if (isRegisterMode) {
      const { error: signUpError } = await supabaseClient.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      alert('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      resetLoginForm();
    } else {
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
    }
  } catch (err) {
    let msg = err.message || 'Terjadi kesalahan';
    if (msg.includes('Invalid login credentials')) {
      msg = 'Email atau kata sandi salah';
    } else if (msg.includes('already registered')) {
      msg = 'Email sudah terdaftar';
    }
    showAuthError(msg);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnContent;
    lucide.createIcons();
  }
});

function showAuthError(message) {
  authErrorMessage.textContent = message;
  authErrorAlert.classList.remove('hidden');
}

// Handle Logout
btnLogout.addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
});

// ============================================================
// Dashboard Operations & Data Handling
// ============================================================

// Fetch Students
async function fetchStudents() {
  studentTableLoading.classList.remove('hidden');
  studentTableEmpty.classList.add('hidden');
  studentTableBody.innerHTML = '';

  try {
    const res = await fetch('/api/mahasiswa');
    if (!res.ok) throw new Error('Gagal memuat data');
    const data = await res.json();
    state.students = data.map(d => Mahasiswa.fromApiData(d));
    renderDashboard();
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('error', 'Gagal memuat data mahasiswa');
  } finally {
    studentTableLoading.classList.add('hidden');
  }
}

// Render Dashboard Data & Stats
function renderDashboard() {
  updateStats();
  renderTable();
}

// Update Stats Cards
function updateStats() {
  const total = state.students.length;
  totalStudentsVal.textContent = total;

  if (total > 0) {
    const sum = state.students.reduce((acc, s) => acc + s.ipk, 0);
    avgIpkVal.textContent = (sum / total).toFixed(2);
    highestIpkVal.textContent = Math.max(...state.students.map(s => s.ipk)).toFixed(2);
    lowestIpkVal.textContent = Math.min(...state.students.map(s => s.ipk)).toFixed(2);
  } else {
    avgIpkVal.textContent = '0.00';
    highestIpkVal.textContent = '0.00';
    lowestIpkVal.textContent = '0.00';
  }
}

// Get filtered and sorted list of students
function getProcessedStudents() {
  let result = [...state.students];

  // Apply search
  if (state.searchQuery.trim()) {
    if (state.searchAlgo === 'linear') {
      result = linearSearchByName(state.students, state.searchQuery);
    } else if (state.searchAlgo === 'binary') {
      const found = binarySearchByNim(state.students, state.searchQuery.trim());
      result = found ? [found] : [];
    } else if (state.searchAlgo === 'sequential') {
      result = sequentialSearchByProdi(state.students, state.searchQuery);
    }
  }

  // Apply sort
  if (state.sortOrder !== 'none') {
    if (state.sortAlgo === 'bubble') {
      result = bubbleSortByIpk(result, state.sortOrder);
    } else if (state.sortAlgo === 'selection') {
      result = selectionSortByIpk(result, state.sortOrder);
    } else if (state.sortAlgo === 'merge') {
      result = mergeSortByIpk(result, state.sortOrder);
    }
  }

  return result;
}

// Render Students Table
function renderTable() {
  const processed = getProcessedStudents();
  studentTableBody.innerHTML = '';

  // Render Algorithm Info Container
  if (state.algorithmInfo) {
    algorithmInfoText.textContent = state.algorithmInfo;
    algorithmInfoContainer.classList.remove('hidden');
  } else {
    algorithmInfoContainer.classList.add('hidden');
  }

  // Render Reset Filter visibility
  if (state.searchQuery.trim() || state.sortOrder !== 'none') {
    btnResetFilters.classList.remove('hidden');
  } else {
    btnResetFilters.classList.add('hidden');
  }

  // Check empty state
  if (processed.length === 0) {
    studentTableEmpty.classList.remove('hidden');
    if (state.searchQuery.trim()) {
      studentTableEmptyTitle.textContent = 'Tidak ada hasil ditemukan';
      studentTableEmptyDesc.textContent = 'Coba kata kunci lain';
    } else {
      studentTableEmptyTitle.textContent = 'Belum ada data mahasiswa';
      studentTableEmptyDesc.textContent = 'Klik "Tambah Mahasiswa" untuk menambahkan data';
    }
    return;
  }

  studentTableEmpty.classList.add('hidden');

  processed.forEach((mhs, index) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-white/5 hover:bg-white/5 transition-colors';

    let ipkClass = 'bg-rose-500/20 text-rose-300';
    if (mhs.ipk >= 3.5) ipkClass = 'bg-emerald-500/20 text-emerald-300';
    else if (mhs.ipk >= 3.0) ipkClass = 'bg-blue-500/20 text-blue-300';
    else if (mhs.ipk >= 2.5) ipkClass = 'bg-amber-500/20 text-amber-300';

    tr.innerHTML = `
      <td class="px-6 py-4 text-white/50 text-sm">${index + 1}</td>
      <td class="px-6 py-4 text-white font-mono text-sm">${mhs.nim}</td>
      <td class="px-6 py-4 text-white text-sm font-medium">${mhs.nama}</td>
      <td class="px-6 py-4 text-white/70 text-sm">${mhs.programStudi}</td>
      <td class="px-6 py-4">
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${ipkClass}">
          ${mhs.ipk.toFixed(2)}
        </span>
      </td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button class="btn-email p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-white/50 hover:text-amber-300 transition-all" title="Kirim Email">
            <i data-lucide="mail" class="w-4 h-4"></i>
          </button>
          <button class="btn-edit p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-white/50 hover:text-blue-300 transition-all" title="Edit">
            <i data-lucide="pencil" class="w-4 h-4"></i>
          </button>
          <button class="btn-delete p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-white/50 hover:text-rose-300 transition-all" title="Hapus">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;

    // Add action listeners
    tr.querySelector('.btn-email').addEventListener('click', () => openEmailModal(mhs));
    tr.querySelector('.btn-edit').addEventListener('click', () => openModal(mhs));
    tr.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(mhs));

    studentTableBody.appendChild(tr);
  });

  lucide.createIcons();
}

// Search and Sort Event Listeners
searchAlgoSelect.addEventListener('change', (e) => {
  state.searchAlgo = e.target.value;
});

btnSearchAction.addEventListener('click', () => {
  handleSearch(false);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSearch(false);
  }
});

searchInput.addEventListener('input', () => {
  if (!searchInput.value.trim()) {
    handleSearch(true);
  }
});

if (btnExportJson) {
  btnExportJson.addEventListener('click', () => {
    if (state.students.length === 0) {
      showToast('error', 'Tidak ada data untuk diekspor');
      return;
    }
    
    // Convert current student objects to plain JSON array
    const dataToExport = state.students.map(mhs => mhs.toObject());
    
    // Create a blob and trigger download
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_mahasiswa_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('success', 'Data JSON berhasil diekspor');
  });
}

if (btnImportJson && inputImportJson) {
  btnImportJson.addEventListener('click', () => {
    inputImportJson.click();
  });

  inputImportJson.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Format JSON tidak valid. Harus berupa array data mahasiswa.');
      }

      // Show loading
      studentTableLoading.classList.remove('hidden');
      studentTableEmpty.classList.add('hidden');
      studentTableBody.innerHTML = '';
      
      let successCount = 0;
      let errorCount = 0;

      // Import each student sequentially to backend
      for (const item of parsedData) {
        try {
          // Re-create as object to validate
          const mhs = new Mahasiswa(
            item.nama || '',
            item.nim || item.nim_mahasiswa || '',
            item.programStudi || item.program_studi || '',
            parseFloat(item.ipk || 0)
          );

          const res = await fetch('/api/mahasiswa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mhs.toObject())
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          errorCount++;
        }
      }

      showToast('success', `Import selesai: ${successCount} berhasil, ${errorCount} gagal`);
      
      // Refresh list
      fetchStudents();
      
    } catch (err) {
      showToast('error', `Gagal mengimpor file: ${err.message}`);
    } finally {
      inputImportJson.value = ''; // Reset file input
      studentTableLoading.classList.add('hidden');
    }
  });
}

function handleSearch(isTyping = false) {
  const query = searchInput.value.trim();
  state.searchQuery = query;

  if (!query) {
    state.algorithmInfo = '';
    renderDashboard();
    return;
  }

  if (state.searchAlgo === 'linear') {
    const results = linearSearchByName(state.students, query);
    state.algorithmInfo = `Linear Search by Nama — ${results.length} hasil ditemukan`;
  } else if (state.searchAlgo === 'binary') {
    const result = binarySearchByNim(state.students, query);
    state.algorithmInfo = result
      ? `Binary Search by NIM — Ditemukan: ${result.nama}`
      : `Binary Search by NIM — NIM "${query}" tidak ditemukan`;
  } else if (state.searchAlgo === 'sequential') {
    const results = sequentialSearchByProdi(state.students, query);
    state.algorithmInfo = `Sequential Search by Prodi — ${results.length} hasil ditemukan`;
  }

  renderDashboard();
}

function handleSortClick(algo) {
  if (state.sortAlgo !== algo) {
    state.sortAlgo = algo;
    state.sortOrder = 'desc'; // default desc
  } else {
    // toggle asc/desc or off
    if (state.sortOrder === 'none') state.sortOrder = 'desc';
    else if (state.sortOrder === 'desc') state.sortOrder = 'asc';
    else state.sortOrder = 'none';
  }
  
  updateSortButtonsUI();
  renderDashboard();
}

btnSortBubble.addEventListener('click', () => handleSortClick('bubble'));
btnSortSelection.addEventListener('click', () => handleSortClick('selection'));
btnSortMerge.addEventListener('click', () => handleSortClick('merge'));

function updateSortButtonsUI() {
  const btns = {
    bubble: btnSortBubble,
    selection: btnSortSelection,
    merge: btnSortMerge
  };

  for (let key in btns) {
    btns[key].className = 'w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 transition-colors';
  }

  if (state.sortOrder !== 'none') {
    const activeBtn = btns[state.sortAlgo];
    if (state.sortAlgo === 'bubble') activeBtn.className = 'w-10 h-10 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 flex items-center justify-center text-amber-300 transition-colors';
    if (state.sortAlgo === 'selection') activeBtn.className = 'w-10 h-10 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 flex items-center justify-center text-rose-300 transition-colors';
    if (state.sortAlgo === 'merge') activeBtn.className = 'w-10 h-10 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 flex items-center justify-center text-purple-300 transition-colors';
    
    const algoName = state.sortAlgo === 'bubble' ? 'Bubble Sort' : state.sortAlgo === 'selection' ? 'Selection Sort' : 'Merge Sort';
    state.algorithmInfo = `${algoName} by IPK — ${state.sortOrder === 'desc' ? 'Tertinggi ke Terendah' : 'Terendah ke Tertinggi'}`;
  } else {
    if (!state.searchQuery.trim()) {
      state.algorithmInfo = '';
    }
  }
}

btnResetFilters.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  state.sortOrder = 'none';
  state.algorithmInfo = '';
  updateSortButtonsUI();
  renderDashboard();
});

// ============================================================
// Add / Edit Modal Logic
// ============================================================

btnAddStudent.addEventListener('click', () => openModal(null));

function openModal(student = null) {
  state.editingStudent = student;
  clearModalErrors();

  if (student) {
    modalTitle.textContent = 'Edit Data Mahasiswa';
    inputNama.value = student.nama;
    inputNim.value = student.nim;
    inputProdi.value = student.programStudi;
    inputIpk.value = student.ipk.toString();
  } else {
    modalTitle.textContent = 'Tambah Mahasiswa Baru';
    inputNama.value = '';
    inputNim.value = '';
    inputProdi.value = '';
    inputIpk.value = '';
  }

  studentModal.classList.remove('hidden');
  studentModal.classList.add('flex');
}

// Toggle Chatbot
const btnChatbot = document.getElementById('btn-chatbot');
const chatbotWindow = document.getElementById('chatbot-window');
const btnCloseChatbot = document.getElementById('btn-close-chatbot');

safeAddListener(btnChatbot, 'click', () => {
  chatbotWindow.classList.toggle('hidden');
  chatbotWindow.classList.toggle('flex');
});

safeAddListener(btnCloseChatbot, 'click', () => {
  chatbotWindow.classList.add('hidden');
  chatbotWindow.classList.remove('flex');
});

// ============================================================
// Agenda Kampus
// ============================================================
const agendaData = [
  {
    nama: "Seminar IT Masa Depan",
    tanggal: "15 Agustus 2026",
    waktu: "09:00 - 12:00 WIT",
    tempat: "Auditorium Utama Nuu Waar",
    deskripsi: "Seminar membahas perkembangan AI dan Machine Learning di industri teknologi terkini bersama para pakar."
  },
  {
    nama: "Workshop Web Development",
    tanggal: "22 Agustus 2026",
    waktu: "13:00 - 16:00 WIT",
    tempat: "Lab Komputer 1",
    deskripsi: "Pelatihan intensif membangun website responsif dan modern menggunakan HTML, CSS, dan framework JavaScript."
  },
  {
    nama: "Kuliah Umum Kepemimpinan",
    tanggal: "05 September 2026",
    waktu: "10:00 - 12:00 WIT",
    tempat: "Aula Serbaguna",
    deskripsi: "Membangun karakter kepemimpinan mahasiswa di era digital untuk mempersiapkan pemimpin masa depan."
  },
  {
    nama: "Career Expo 2026",
    tanggal: "20 September 2026",
    waktu: "08:00 - 17:00 WIT",
    tempat: "Gedung Olahraga (GOR)",
    deskripsi: "Bursa kerja yang mempertemukan mahasiswa dan alumni dengan berbagai perusahaan teknologi ternama."
  },
  {
    nama: "Lomba Inovasi Teknologi",
    tanggal: "10 Oktober 2026",
    waktu: "09:00 - 15:00 WIT",
    tempat: "Gedung Rektorat Lt. 3",
    deskripsi: "Kompetisi antar mahasiswa untuk memamerkan proyek inovasi teknologi tepat guna."
  }
];

function renderAgendas() {
  const agendaGrid = document.getElementById('agenda-grid');
  if (!agendaGrid) return;

  agendaGrid.innerHTML = '';

  agendaData.forEach(agenda => {
    const card = document.createElement('div');
    card.className = "glass-card p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300 border border-white/10 hover:border-amber-500/50 shadow-lg relative overflow-hidden group";
    card.innerHTML = `
      <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <i data-lucide="calendar" class="w-6 h-6"></i>
        </div>
        <span class="px-3 py-1 bg-white/5 text-white/70 text-xs font-semibold rounded-full border border-white/10">
          Terbaru
        </span>
      </div>
      <h3 class="text-lg font-bold text-white mb-2">${agenda.nama}</h3>
      <p class="text-white/60 text-sm mb-5 leading-relaxed line-clamp-2">
        ${agenda.deskripsi}
      </p>
      
      <div class="space-y-2.5">
        <div class="flex items-center gap-3 text-sm text-white/70">
          <i data-lucide="clock" class="w-4 h-4 text-amber-500"></i>
          <span>${agenda.tanggal} • ${agenda.waktu}</span>
        </div>
        <div class="flex items-center gap-3 text-sm text-white/70">
          <i data-lucide="map-pin" class="w-4 h-4 text-amber-500"></i>
          <span>${agenda.tempat}</span>
        </div>
      </div>
      
      <button class="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-amber-500 text-white font-medium text-sm transition-colors duration-300">
        Detail Agenda
      </button>
    `;
    agendaGrid.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Ensure it renders when the page loads
document.addEventListener('DOMContentLoaded', renderAgendas);
// Fallback in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  renderAgendas();
}

function closeModal() {
  studentModal.classList.add('hidden');
  studentModal.classList.remove('flex');
}

btnCloseModal.addEventListener('click', closeModal);
btnCancelModal.addEventListener('click', closeModal);

function clearModalErrors() {
  errorNama.textContent = '';
  errorNim.textContent = '';
  errorProdi.textContent = '';
  errorIpk.textContent = '';
}

function validateForm() {
  let isValid = true;
  clearModalErrors();

  if (!inputNama.value.trim()) {
    errorNama.textContent = 'Nama wajib diisi';
    isValid = false;
  }
  if (!inputNim.value.trim()) {
    errorNim.textContent = 'NIM wajib diisi';
    isValid = false;
  }
  if (!inputProdi.value.trim()) {
    errorProdi.textContent = 'Program studi wajib diisi';
    isValid = false;
  }

  const ipkVal = inputIpk.value.trim();
  if (!ipkVal) {
    errorIpk.textContent = 'IPK wajib diisi';
    isValid = false;
  } else {
    const ipkParsed = parseFloat(ipkVal);
    if (isNaN(ipkParsed)) {
      errorIpk.textContent = 'IPK harus berupa angka';
      isValid = false;
    } else if (ipkParsed < 0.0 || ipkParsed > 4.0) {
      errorIpk.textContent = 'IPK harus antara 0.0 dan 4.0';
      isValid = false;
    }
  }

  return isValid;
}

btnSubmitModal.addEventListener('click', async () => {
  if (!validateForm()) return;

  // Use Mahasiswa class encapsulation validation
  let mhs;
  try {
    mhs = new Mahasiswa(
      inputNama.value.trim(),
      inputNim.value.trim(),
      inputProdi.value.trim(),
      parseFloat(inputIpk.value.trim())
    );
  } catch (err) {
    errorIpk.textContent = err.message;
    return;
  }

  setModalLoading(true);

  try {
    let res;
    if (state.editingStudent) {
      // Edit
      res = await fetch('/api/mahasiswa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.editingStudent.id,
          ...mhs.toObject()
        })
      });
    } else {
      // Add
      res = await fetch('/api/mahasiswa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mhs.toObject())
      });
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data');

    showToast('success', state.editingStudent ? 'Data mahasiswa berhasil diperbarui' : 'Data mahasiswa berhasil ditambahkan');
    closeModal();
    fetchStudents();
  } catch (err) {
    if (err.message.includes('NIM sudah terdaftar')) {
      errorNim.textContent = 'NIM sudah terdaftar';
    } else {
      showToast('error', err.message);
    }
  } finally {
    setModalLoading(false);
  }
});

function setModalLoading(isLoading) {
  btnSubmitModal.disabled = isLoading;
  btnCancelModal.disabled = isLoading;
  if (isLoading) {
    btnSubmitModalText.classList.add('hidden');
    btnSubmitModalSpinner.classList.remove('hidden');
  } else {
    btnSubmitModalText.classList.remove('hidden');
    btnSubmitModalSpinner.classList.add('hidden');
  }
}

// Populate datalist option program studi
const prodiDatalist = document.getElementById('prodi-list');
PRODI_OPTIONS.forEach(prodi => {
  const option = document.createElement('option');
  option.value = prodi;
  prodiDatalist.appendChild(option);
});

// ============================================================
// Delete Confirmation Modal Logic
// ============================================================

function openDeleteModal(student) {
  state.deleteConfirm = student;
  deleteConfirmText.innerHTML = `Data <span class="text-white font-medium">${student.nama}</span> (NIM: ${student.nim}) akan dihapus secara permanen.`;
  deleteModal.classList.remove('hidden');
  deleteModal.classList.add('flex');
}

function closeDeleteModal() {
  deleteModal.classList.add('hidden');
  deleteModal.classList.remove('flex');
  state.deleteConfirm = null;
}

btnCancelDelete.addEventListener('click', closeDeleteModal);

btnConfirmDelete.addEventListener('click', async () => {
  if (!state.deleteConfirm) return;

  try {
    const res = await fetch('/api/mahasiswa', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: state.deleteConfirm.id })
    });

    if (!res.ok) throw new Error('Gagal menghapus data');

    showToast('success', `Data ${state.deleteConfirm.nama} berhasil dihapus`);
    closeDeleteModal();
    fetchStudents();
  } catch (err) {
    showToast('error', err.message || 'Gagal menghapus data');
  }
});

// ============================================================
// Email / Complaint Modal Logic
// ============================================================

// Open empty complaint modal from action bar
// Safe Event Listener Binder
function safeAddListener(el, event, handler) {
  if (el) {
    el.addEventListener(event, handler);
  } else {
    console.warn(`Element not found: ${el}`);
  }
}

safeAddListener(btnOpenComplaint, 'click', () => {
  openEmailModal(null);
});

function openEmailModal(student = null) {
  state.emailStudent = student;
  clearEmailFormErrors();

  if (inputEmailTo) inputEmailTo.value = '';
  if (inputEmailFrom) inputEmailFrom.value = '';
  if (inputEmailSubject) inputEmailSubject.value = '';
  if (inputEmailMessage) inputEmailMessage.value = '';

  if (student) {
    // Pre-fill from student row click
    if (inputEmailNama) inputEmailNama.value = student.nama;
    if (inputEmailNim) inputEmailNim.value = student.nim;
    if (inputEmailSubject) inputEmailSubject.value = `[PENGADUAN] Keluhan akademik NIM ${student.nim}`;
  } else {
    if (inputEmailNama) inputEmailNama.value = '';
    if (inputEmailNim) inputEmailNim.value = '';
  }

  if (emailModal) {
    emailModal.classList.remove('hidden');
    emailModal.classList.add('flex');
  }
}

function closeEmailModal() {
  if (emailModal) {
    emailModal.classList.add('hidden');
    emailModal.classList.remove('flex');
  }
  state.emailStudent = null;
}

safeAddListener(btnCloseEmailModal, 'click', closeEmailModal);
safeAddListener(btnCancelEmailModal, 'click', closeEmailModal);

function clearEmailFormErrors() {
  if (errorEmailTo) errorEmailTo.textContent = '';
  if (errorEmailNama) errorEmailNama.textContent = '';
  if (errorEmailNim) errorEmailNim.textContent = '';
  if (errorEmailFrom) errorEmailFrom.textContent = '';
  if (errorEmailSubject) errorEmailSubject.textContent = '';
  if (errorEmailMessage) errorEmailMessage.textContent = '';
}

function validateEmailForm() {
  let isValid = true;
  clearEmailFormErrors();

  // Validate Destination Email
  if (inputEmailTo) {
    const toVal = inputEmailTo.value.trim();
    if (!toVal) {
      if (errorEmailTo) errorEmailTo.textContent = 'Email tujuan wajib diisi';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toVal)) {
      if (errorEmailTo) errorEmailTo.textContent = 'Format email tidak valid';
      isValid = false;
    }
  }

  // Validate Name
  if (inputEmailNama) {
    if (!inputEmailNama.value.trim()) {
      if (errorEmailNama) errorEmailNama.textContent = 'Nama pengadu wajib diisi';
      isValid = false;
    }
  }

  // Validate NIM
  if (inputEmailNim) {
    if (!inputEmailNim.value.trim()) {
      if (errorEmailNim) errorEmailNim.textContent = 'NIM pengadu wajib diisi';
      isValid = false;
    }
  }

  // Validate Contact Email
  if (inputEmailFrom) {
    const fromVal = inputEmailFrom.value.trim();
    if (!fromVal) {
      if (errorEmailFrom) errorEmailFrom.textContent = 'Email hubungi wajib diisi';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromVal)) {
      if (errorEmailFrom) errorEmailFrom.textContent = 'Format email tidak valid';
      isValid = false;
    }
  }

  // Validate Subject
  if (inputEmailSubject) {
    if (!inputEmailSubject.value.trim()) {
      if (errorEmailSubject) errorEmailSubject.textContent = 'Subjek keluhan wajib diisi';
      isValid = false;
    }
  }

  // Validate Message
  if (inputEmailMessage) {
    if (!inputEmailMessage.value.trim()) {
      if (errorEmailMessage) errorEmailMessage.textContent = 'Pesan keluhan wajib diisi';
      isValid = false;
    }
  }

  return isValid;
}

safeAddListener(btnSubmitEmailModal, 'click', async () => {
  if (!validateEmailForm()) return;

  setEmailModalLoading(true);

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: inputEmailTo ? inputEmailTo.value.trim() : '',
        subject: inputEmailSubject ? inputEmailSubject.value.trim() : '',
        nama: inputEmailNama ? inputEmailNama.value.trim() : '',
        nim: inputEmailNim ? inputEmailNim.value.trim() : '',
        emailPengirim: inputEmailFrom ? inputEmailFrom.value.trim() : '',
        pesan: inputEmailMessage ? inputEmailMessage.value.trim() : ''
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengirim pengaduan');

    showToast('success', data.message || 'Keluhan berhasil terkirim!');
    closeEmailModal();
  } catch (err) {
    showToast('error', err.message || 'Terjadi kesalahan saat mengirim pengaduan');
  } finally {
    setEmailModalLoading(false);
  }
});

function setEmailModalLoading(isLoading) {
  if (btnSubmitEmailModal) btnSubmitEmailModal.disabled = isLoading;
  if (btnCancelEmailModal) btnCancelEmailModal.disabled = isLoading;
  if (isLoading) {
    if (btnSubmitEmailModalText) btnSubmitEmailModalText.classList.add('hidden');
    if (btnSubmitEmailModalSpinner) btnSubmitEmailModalSpinner.classList.remove('hidden');
  } else {
    if (btnSubmitEmailModalText) btnSubmitEmailModalText.classList.remove('hidden');
    if (btnSubmitEmailModalSpinner) btnSubmitEmailModalSpinner.classList.add('hidden');
  }
}

// ============================================================
// Tab Navigation (Mahasiswa vs Agenda)
// ============================================================
const navBtnBeranda = document.getElementById('nav-btn-beranda');
const navBtnMahasiswa = document.getElementById('nav-btn-mahasiswa');
const navBtnAgenda = document.getElementById('nav-btn-agenda');
const berandaView = document.getElementById('beranda-view');
const mahasiswaView = document.getElementById('mahasiswa-view');
const agendaView = document.getElementById('agenda-view');

function resetTabs() {
  const activeClass = 'px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white transition-all cursor-pointer';
  const inactiveClass = 'px-4 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white transition-all cursor-pointer';
  if(navBtnBeranda) navBtnBeranda.className = inactiveClass;
  if(navBtnMahasiswa) navBtnMahasiswa.className = inactiveClass;
  if(navBtnAgenda) navBtnAgenda.className = inactiveClass;
  if(berandaView) berandaView.classList.add('hidden');
  if(mahasiswaView) mahasiswaView.classList.add('hidden');
  if(agendaView) agendaView.classList.add('hidden');
  return activeClass;
}

if(navBtnBeranda) {
  safeAddListener(navBtnBeranda, 'click', () => {
    const activeClass = resetTabs();
    navBtnBeranda.className = activeClass;
    if(berandaView) berandaView.classList.remove('hidden');
  });
}

if(navBtnMahasiswa) {
  safeAddListener(navBtnMahasiswa, 'click', () => {
    const activeClass = resetTabs();
    navBtnMahasiswa.className = activeClass;
    if(mahasiswaView) mahasiswaView.classList.remove('hidden');
  });
}

if(navBtnAgenda) {
  safeAddListener(navBtnAgenda, 'click', () => {
    const activeClass = resetTabs();
    navBtnAgenda.className = activeClass;
    if(agendaView) agendaView.classList.remove('hidden');
    renderAgenda();
  });
}


// ============================================================
// Agenda Kampus (Local Storage)
// ============================================================
const agendaGrid = document.getElementById('agenda-grid');
const agendaEmptyState = document.getElementById('agenda-empty-state');
const agendaModal = document.getElementById('agenda-modal');
const btnOpenAgendaModal = document.getElementById('btn-open-agenda-modal');
const btnCloseAgendaModal = document.getElementById('btn-close-agenda-modal');
const btnCancelAgendaModal = document.getElementById('btn-cancel-agenda-modal');
const btnSubmitAgendaModal = document.getElementById('btn-submit-agenda-modal');

const inputAgendaTitle = document.getElementById('input-agenda-title');
const inputAgendaDate = document.getElementById('input-agenda-date');
const inputAgendaLoc = document.getElementById('input-agenda-loc');
const inputAgendaType = document.getElementById('input-agenda-type');

const btnFilterAgendaAll = document.getElementById('btn-filter-agenda-all');
const btnFilterAgendaSeminar = document.getElementById('btn-filter-agenda-seminar');
const btnFilterAgendaKegiatan = document.getElementById('btn-filter-agenda-kegiatan');

let currentAgendaFilter = 'All';

function getAgendas() {
  const data = localStorage.getItem('nuuwaar_agendas');
  if (data) {
    return JSON.parse(data);
  } else {
    // Default 5 Agendas
    const defaultAgendas = [
      { id: '1', nama: "Seminar IT Masa Depan", tanggal: "15 Agustus 2026", waktu: "09:00 - 12:00 WIT", tempat: "Auditorium Utama Nuu Waar", deskripsi: "Seminar membahas perkembangan AI dan Machine Learning di industri teknologi terkini bersama para pakar.", type: "Seminar" },
      { id: '2', nama: "Workshop Web Development", tanggal: "22 Agustus 2026", waktu: "13:00 - 16:00 WIT", tempat: "Lab Komputer 1", deskripsi: "Pelatihan intensif membangun website responsif dan modern menggunakan HTML, CSS, dan framework JavaScript.", type: "Kegiatan" },
      { id: '3', nama: "Kuliah Umum Kepemimpinan", tanggal: "05 September 2026", waktu: "10:00 - 12:00 WIT", tempat: "Aula Serbaguna", deskripsi: "Membangun karakter kepemimpinan mahasiswa di era digital untuk mempersiapkan pemimpin masa depan.", type: "Seminar" },
      { id: '4', nama: "Career Expo 2026", tanggal: "20 September 2026", waktu: "08:00 - 17:00 WIT", tempat: "Gedung Olahraga (GOR)", deskripsi: "Bursa kerja yang mempertemukan mahasiswa dan alumni dengan berbagai perusahaan teknologi ternama.", type: "Kegiatan" },
      { id: '5', nama: "Lomba Inovasi Teknologi", tanggal: "10 Oktober 2026", waktu: "09:00 - 15:00 WIT", tempat: "Gedung Rektorat Lt. 3", deskripsi: "Kompetisi antar mahasiswa untuk memamerkan proyek inovasi teknologi tepat guna.", type: "Kegiatan" }
    ];
    localStorage.setItem('nuuwaar_agendas', JSON.stringify(defaultAgendas));
    return defaultAgendas;
  }
}

function saveAgendas(agendas) {
  localStorage.setItem('nuuwaar_agendas', JSON.stringify(agendas));
}

safeAddListener(btnOpenAgendaModal, 'click', () => {
  inputAgendaTitle.value = '';
  inputAgendaDate.value = '';
  inputAgendaLoc.value = '';
  inputAgendaType.value = 'Seminar';
  agendaModal.classList.remove('hidden');
  agendaModal.classList.add('flex');
});

function closeAgendaModal() {
  agendaModal.classList.add('hidden');
  agendaModal.classList.remove('flex');
}

safeAddListener(btnCloseAgendaModal, 'click', closeAgendaModal);
safeAddListener(btnCancelAgendaModal, 'click', closeAgendaModal);

safeAddListener(btnSubmitAgendaModal, 'click', () => {
  const title = inputAgendaTitle.value.trim();
  const date = inputAgendaDate.value;
  const loc = inputAgendaLoc.value.trim();
  const type = inputAgendaType.value;
  
  if (!title || !date || !loc) {
    showToast('error', 'Semua field agenda wajib diisi');
    return;
  }
  
  const agendas = getAgendas();
  agendas.push({ id: Date.now().toString(), nama: title, tanggal: date, waktu: "08:00 - Selesai", tempat: loc, deskripsi: "Agenda baru ditambahkan", type });
  saveAgendas(agendas);
  
  showToast('success', 'Agenda berhasil ditambahkan');
  closeAgendaModal();
  renderAgenda();
});

function renderAgenda() {
  const allAgendas = getAgendas();
  const filtered = currentAgendaFilter === 'All' 
    ? allAgendas 
    : allAgendas.filter(a => a.type === currentAgendaFilter);
    
  agendaGrid.innerHTML = '';
  
  if (filtered.length === 0) {
    agendaEmptyState.classList.remove('hidden');
  } else {
    agendaEmptyState.classList.add('hidden');
    
    filtered.forEach(agenda => {
      const isSeminar = agenda.type === 'Seminar';
      const iconName = isSeminar ? 'mic' : 'calendar-days';
      
      const card = document.createElement('div');
      card.className = "glass-card p-6 rounded-2xl hover:scale-[1.02] transition-transform duration-300 border border-white/10 hover:border-amber-500/50 shadow-lg relative overflow-hidden group";
      card.innerHTML = `
        <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
        <div class="flex items-start justify-between mb-4 relative z-10">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <i data-lucide="${iconName}" class="w-5 h-5"></i>
            </div>
            <span class="px-3 py-1 bg-white/5 text-white/70 text-[10px] font-bold tracking-wider uppercase rounded-full border border-white/10">
              ${agenda.type}
            </span>
          </div>
          <button class="text-white/40 hover:text-rose-400 transition-colors bg-white/5 p-1.5 rounded-lg border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30" onclick="deleteAgenda('${agenda.id}')" title="Hapus Agenda">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
        <h3 class="text-lg font-bold text-white mb-2 relative z-10">${agenda.nama}</h3>
        <p class="text-white/60 text-sm mb-5 leading-relaxed line-clamp-2 relative z-10">
          ${agenda.deskripsi}
        </p>
        
        <div class="space-y-2.5 relative z-10">
          <div class="flex items-center gap-3 text-sm text-white/70">
            <i data-lucide="clock" class="w-4 h-4 text-amber-500"></i>
            <span>${agenda.tanggal} • ${agenda.waktu}</span>
          </div>
          <div class="flex items-center gap-3 text-sm text-white/70">
            <i data-lucide="map-pin" class="w-4 h-4 text-amber-500"></i>
            <span>${agenda.tempat}</span>
          </div>
        </div>
      `;
      agendaGrid.appendChild(card);
    });
    
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

window.deleteAgenda = (id) => {
  let agendas = getAgendas();
  agendas = agendas.filter(a => a.id !== id);
  saveAgendas(agendas);
  showToast('success', 'Agenda dihapus');
  renderAgenda();
};

function setAgendaFilter(filter, activeBtn) {
  currentAgendaFilter = filter;
  [btnFilterAgendaAll, btnFilterAgendaSeminar, btnFilterAgendaKegiatan].forEach(btn => {
    btn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer';
  });
  activeBtn.className = 'px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white transition-all cursor-pointer';
  renderAgenda();
}

safeAddListener(btnFilterAgendaAll, 'click', () => setAgendaFilter('All', btnFilterAgendaAll));
safeAddListener(btnFilterAgendaSeminar, 'click', () => setAgendaFilter('Seminar', btnFilterAgendaSeminar));
safeAddListener(btnFilterAgendaKegiatan, 'click', () => setAgendaFilter('Kegiatan', btnFilterAgendaKegiatan));

// ============================================================
// TechBot AI Chatbot (Mock/Simulated)
// ============================================================
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotPanel = document.getElementById('chatbot-panel');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotMessages = document.getElementById('chatbot-messages');

safeAddListener(chatbotToggle, 'click', () => {
  chatbotPanel.classList.remove('hidden');
  chatbotToggle.classList.add('hidden');
});

safeAddListener(chatbotClose, 'click', () => {
  chatbotPanel.classList.add('hidden');
  chatbotToggle.classList.remove('hidden');
});

function addChatMessage(message, isBot = false) {
  const div = document.createElement('div');
  div.className = isBot ? 'flex items-start gap-2.5' : 'flex items-end justify-end gap-2.5 mt-4 mb-4';
  
  if (isBot) {
    div.innerHTML = `
      <div class="w-7 h-7 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">TB</div>
      <div class="p-3 bg-white/5 rounded-2xl rounded-tl-none border border-white/10 max-w-[80%] text-xs text-white/80 leading-relaxed">
        ${message}
      </div>
    `;
  } else {
    div.innerHTML = `
      <div class="p-3 bg-cyan-500 rounded-2xl rounded-tr-none max-w-[80%] text-xs text-white shadow-md leading-relaxed">
        ${message}
      </div>
    `;
  }
  
  chatbotMessages.appendChild(div);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

async function handleChatbotSend() {
  const msg = chatbotInput.value.trim();
  
  if (!msg) return;
  
  // User message
  addChatMessage(msg, false);
  chatbotInput.value = '';
  
  // Simulate bot typing
  const typingDiv = document.createElement('div');
  typingDiv.className = 'flex items-start gap-2.5 mt-4 mb-4 bot-typing';
  typingDiv.innerHTML = `
    <div class="w-7 h-7 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xs shrink-0">TB</div>
    <div class="p-3 bg-white/5 rounded-2xl rounded-tl-none border border-white/10 text-xs text-white/50 flex gap-1">
      <span class="animate-bounce">.</span><span class="animate-bounce" style="animation-delay: 0.1s">.</span><span class="animate-bounce" style="animation-delay: 0.2s">.</span>
    </div>
  `;
  // Call Backend Proxy API
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: msg })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.reply) {
      throw new Error(data.error || "Server AI gagal merespon.");
    }
    
    const reply = data.reply;
    
    // Parse basic markdown
    const formattedReply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
    
    typingDiv.remove();
    addChatMessage(formattedReply, true);
  } catch (err) {
    typingDiv.remove();
    addChatMessage(`Maaf, semua server layanan AI kampus saat ini sedang sibuk. Silakan coba beberapa saat lagi.`, true);
  }
}

safeAddListener(chatbotSend, 'click', handleChatbotSend);
safeAddListener(chatbotInput, 'keydown', (e) => {
  if (e.key === 'Enter') handleChatbotSend();
});

// ============================================================
// Forgot Password Logic
// ============================================================
const btnForgotPassword = document.getElementById('btn-forgot-password');
safeAddListener(btnForgotPassword, 'click', async () => {
  const email = emailInput.value.trim();
  if (!email) {
    showAuthError('Masukkan email Anda terlebih dahulu di kolom atas untuk mereset kata sandi');
    return;
  }
  
  const originalText = btnForgotPassword.textContent;
  btnForgotPassword.textContent = 'Memproses...';
  
  try {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    
    if (error) throw error;
    alert(`Tautan pemulihan kata sandi telah dikirim ke ${email}. Silakan cek kotak masuk Anda.`);
  } catch (err) {
    showAuthError(err.message || 'Gagal mengirim email pemulihan');
  } finally {
    btnForgotPassword.textContent = originalText;
  }
});

// ============================================================
// Announcement Modal Logic
// ============================================================
const btnCloseAnnouncement = document.getElementById('btn-close-announcement');
const announcementModal = document.getElementById('announcement-modal');
const announcementModalContent = document.getElementById('announcement-modal-content');

if (btnCloseAnnouncement) {
  safeAddListener(btnCloseAnnouncement, 'click', () => {
    if (announcementModalContent && announcementModal) {
      announcementModalContent.classList.remove('scale-100', 'opacity-100');
      announcementModalContent.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        announcementModal.classList.remove('flex');
        announcementModal.classList.add('hidden');
      }, 300);
    }
  });
}

function closeModal() {
  studentModal.classList.add('hidden');
  studentModal.classList.remove('flex');
}

// ============================================================
// KHS / Transkrip Modal Logic
// ============================================================
const btnOpenKhs = document.getElementById('btn-open-khs');
const btnCloseKhs = document.getElementById('btn-close-khs');
const khsModal = document.getElementById('khs-modal');
const khsModalContent = document.getElementById('khs-modal-content');

if (btnOpenKhs) {
  safeAddListener(btnOpenKhs, 'click', () => {
    if (khsModal && khsModalContent) {
      khsModal.classList.remove('hidden');
      khsModal.classList.add('flex');
      setTimeout(() => {
        khsModalContent.classList.remove('scale-95', 'opacity-0');
        khsModalContent.classList.add('scale-100', 'opacity-100');
      }, 10);
    }
  });
}

if (btnCloseKhs) {
  safeAddListener(btnCloseKhs, 'click', () => {
    if (khsModal && khsModalContent) {
      khsModalContent.classList.remove('scale-100', 'opacity-100');
      khsModalContent.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        khsModal.classList.remove('flex');
        khsModal.classList.add('hidden');
      }, 300);
    }
  });
}

// ============================================================
// Full Year Calendar Logic
// ============================================================
function renderFullYearCalendar(year = 2026) {
  const container = document.getElementById('full-calendar-grid');
  if (!container) return;
  
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const days = ["S", "S", "R", "K", "J", "S", "M"];
  
  const utsStart = new Date(year, 9, 10);
  const utsEnd = new Date(year, 9, 24);
  const uasStart = new Date(year, 11, 15);
  const uasEnd = new Date(year, 11, 30);
  const today = new Date(); 
  
  let html = '';
  
  for (let month = 0; month < 12; month++) {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let daysHtml = '';
    
    days.forEach(day => {
      daysHtml += `<div class="text-[10px] font-bold text-white/40 text-center pb-1">${day}</div>`;
    });
    
    for (let i = 0; i < offset; i++) {
      daysHtml += `<div class="p-1"></div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const current = new Date(year, month, day);
      let classes = "w-6 h-6 flex items-center justify-center text-[10px] rounded-md mx-auto ";
      
      const isUts = current >= utsStart && current <= utsEnd;
      const isUas = current >= uasStart && current <= uasEnd;
      const isToday = current.getDate() === today.getDate() && current.getMonth() === today.getMonth() && current.getFullYear() === today.getFullYear();
      
      if (isUts) {
        classes += "bg-rose-500/80 text-white font-bold border border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)]";
      } else if (isUas) {
        classes += "bg-blue-500/80 text-white font-bold border border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.4)]";
      } else if (isToday) {
        classes += "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500";
      } else {
        classes += "text-white/70 hover:bg-white/10 cursor-pointer";
      }
      
      daysHtml += `<div class="p-0.5"><div class="${classes}">${day}</div></div>`;
    }
    
    html += `
      <div class="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
        <h5 class="text-sm font-bold text-white mb-3 text-center border-b border-white/10 pb-2">${monthNames[month]}</h5>
        <div class="grid grid-cols-7 gap-y-1">
          ${daysHtml}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

renderFullYearCalendar();
