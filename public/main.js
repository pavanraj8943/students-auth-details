
// main.js
const API_BASE = '/api/students';

const form = document.getElementById('student-form');
const studentsList = document.getElementById('students-list');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const avatarImg = document.getElementById('user-avatar');
const userNameEl = document.getElementById('user-name');
const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e0f2f1"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="28" fill="%230f766e" font-family="Arial"></text></svg>`;

// Inputs
const idInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const rollInput = document.getElementById('rollNumber');
const s1Input = document.getElementById('subject1');
const s2Input = document.getElementById('subject2');
const s3Input = document.getElementById('subject3');

// Accordion
const marksAccordion = document.getElementById('marks-accordion');
const marksContent = document.getElementById('marks-content');
const logoutBtn = document.getElementById('logout-btn');
getFirstLetter
// Check login
const token = localStorage.getItem("token");
if (!token) {
  alert('Please login first');
  window.location.href = '/login.html';
}

hydrateUserProfile();

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userImage');
    localStorage.removeItem('userName');
    window.location.href = '/login.html';
  });
}

// Fetch students
async function fetchStudents() {
  const res = await fetch(API_BASE, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    const data = await res.json();
    alert(data.message);
    return;
  }

  const students = await res.json();
  renderStudents(students);
}

function getFirstLetter(nameInput) {
  if (!nameInput || typeof nameInput !== "string") return "";
  return nameInput.charAt(0);
}

// Render table
function renderStudents(students) {
  if (!Array.isArray(students) || students.length === 0) {
    studentsList.innerHTML =
      '<tr><td colspan="8" style="text-align:center;">No students found.</td></tr>';
    return;
  }

  studentsList.innerHTML = students.map(s => studentRow(s)).join('');
  document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', onEdit));
  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', onDelete));
}

// Single row HTML
function studentRow(s) {
  const total = (s.marks?.subject1 || 0) +
                (s.marks?.subject2 || 0) +
                (s.marks?.subject3 || 0);

  return `
    <tr data-id="${s._id}">
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.rollNumber)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${s.marks?.subject1 ?? 0}</td>
      <td>${s.marks?.subject2 ?? 0}</td>
      <td>${s.marks?.subject3 ?? 0}</td>
      <td><strong>${total}</strong></td>
      <td class="actions">
        <button class="edit-btn" data-id="${s._id}">Edit</button>
        <button class="delete-btn" data-id="${s._id}">Delete</button>
      </td>
    </tr>
  `;
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// Save / Update student
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = idInput.value;

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    rollNumber: rollInput.value.trim(),
    marks: {
      subject1: Number(s1Input.value) || 0,
      subject2: Number(s2Input.value) || 0,
      subject3: Number(s3Input.value) || 0
    }
  };

  if (!payload.name || !payload.email || !payload.rollNumber) {
    return alert('Name, email and roll number are required.');
  }

  try {
    let res;

    if (id) {
      res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.message || 'Operation failed');
    }

    resetForm();
    fetchStudents();

  } catch (err) {
    alert(err.message);
    console.error(err);
  }
});

// Cancel button
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  idInput.value = '';
  form.reset();
  formTitle.textContent = 'Add Student';
  saveBtn.textContent = 'Save';
  cancelBtn.style.display = 'none';
}

// Edit student
async function onEdit(e) {
  const id = e.currentTarget.dataset.id;
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch student');
    const student = await res.json();

    idInput.value = student._id;
    nameInput.value = student.name;
    emailInput.value = student.email;
    rollInput.value = student.rollNumber;
    s1Input.value = student.marks?.subject1 ?? 0;
    s2Input.value = student.marks?.subject2 ?? 0;
    s3Input.value = student.marks?.subject3 ?? 0;

    formTitle.textContent = 'Edit Student';
    saveBtn.textContent = 'Update';
    cancelBtn.style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    alert('Could not load student for editing');
    console.error(err);
  }
}

// Delete student
async function onDelete(e) {
  const id = e.currentTarget.dataset.id;
  if (!confirm('Delete this student?')) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Delete failed');
    fetchStudents();
  } catch (err) {
    alert('Delete failed');
    console.error(err);
  }
}

// Accordion
marksAccordion.addEventListener('click', () => {
  marksAccordion.classList.toggle('collapsed');
  marksContent.classList.toggle('collapsed');
});

// Initial load
fetchStudents();

function hydrateUserProfile() {
  const name = localStorage.getItem('userName') || 'User';
  const image = localStorage.getItem('userImage') || DEFAULT_AVATAR;

  if (userNameEl) {
    userNameEl.textContent = name;
  }

  if (avatarImg) {
    avatarImg.src = image || DEFAULT_AVATAR;
    avatarImg.alt = `${name} profile image`;
  }
}
