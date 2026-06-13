// ============================================================
// Supabase Initialization
// ============================================================
const SUPABASE_URL = "https://mmfdqefxmmmgtiqapuon.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RAvTKS5CgOyfS-pttHh7SA_Bs5Kqoky";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  searchBy: 'nama', // 'nama' | 'nim'
  sortOrder: 'none', // 'none' | 'asc' | 'desc'
  showModal: false,
  editingStudent: null,
  deleteConfirm: null,
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
const searchBySelect = document.getElementById('search-by-select');
const searchInput = document.getElementById('search-input');
const btnSortDesc = document.getElementById('btn-sort-desc');
const btnSortAsc = document.getElementById('btn-sort-asc');
const btnResetFilters = document.getElementById('btn-reset-filters');
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

// Toast Notification
const toastNotification = document.getElementById('toast-notification');
const toastIconSuccess = document.getElementById('toast-icon-success');
const toastIconError = document.getElementById('toast-icon-error');
const toastMessage = document.getElementById('toast-message');

// Global Auth State Change Listener
supabase.auth.onAuthStateChange((event, session) => {
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
function updateAuthStateUI() {
  loadingScreen.classList.add('hidden');
  if (state.user) {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
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
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      alert('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      resetLoginForm();
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
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
  await supabase.auth.signOut();
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
    if (state.searchBy === 'nama') {
      result = linearSearchByName(state.students, state.searchQuery);
    } else {
      const found = binarySearchByNim(state.students, state.searchQuery.trim());
      result = found ? [found] : [];
    }
  }

  // Apply sort
  if (state.sortOrder !== 'none') {
    result = bubbleSortByIpk(result, state.sortOrder);
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
    tr.querySelector('.btn-edit').addEventListener('click', () => openModal(mhs));
    tr.querySelector('.btn-delete').addEventListener('click', () => openDeleteModal(mhs));

    studentTableBody.appendChild(tr);
  });

  lucide.createIcons();
}

// Search and Sort Event Listeners
searchBySelect.addEventListener('change', (e) => {
  state.searchBy = e.target.value;
  searchInput.placeholder = state.searchBy === 'nama' ? 'Cari berdasarkan nama...' : 'Cari berdasarkan NIM...';
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
});

function handleSearch() {
  const query = searchInput.value.trim();
  state.searchQuery = query;

  if (!query) {
    state.algorithmInfo = '';
    renderDashboard();
    return;
  }

  if (state.searchBy === 'nama') {
    const results = linearSearchByName(state.students, query);
    state.algorithmInfo = `Linear Search by Nama — ${results.length} hasil ditemukan`;
  } else {
    const result = binarySearchByNim(state.students, query);
    state.algorithmInfo = result
      ? `Binary Search by NIM — Ditemukan: ${result.nama}`
      : `Binary Search by NIM — NIM "${query}" tidak ditemukan`;
  }

  renderDashboard();
}

btnSortDesc.addEventListener('click', () => {
  toggleSort('desc');
});

btnSortAsc.addEventListener('click', () => {
  toggleSort('asc');
});

function toggleSort(order) {
  if (state.sortOrder === order) {
    state.sortOrder = 'none';
    state.algorithmInfo = '';
    btnSortDesc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10';
    btnSortAsc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10';
  } else {
    state.sortOrder = order;
    state.algorithmInfo = `Bubble Sort by IPK — ${order === 'desc' ? 'Tertinggi ke Terendah' : 'Terendah ke Tertinggi'}`;

    if (order === 'desc') {
      btnSortDesc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-amber-500/20 border border-amber-500/40 text-amber-300';
      btnSortAsc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10';
    } else {
      btnSortDesc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10';
      btnSortAsc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-amber-500/20 border border-amber-500/40 text-amber-300';
    }
  }
  renderDashboard();
}

btnResetFilters.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  state.sortOrder = 'none';
  state.algorithmInfo = '';
  btnSortDesc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10';
  btnSortAsc.className = 'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10';
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
