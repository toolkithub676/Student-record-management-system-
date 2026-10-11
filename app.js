// Firebase Web SDK: configured for this project's Firebase web app.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDtGmbq0iKzo0AcGo2OfuCqg3sSH18RoY",
  authDomain: "student-record-managemen-81e20.firebaseapp.com",
  projectId: "student-record-managemen-81e20",
  storageBucket: "student-record-managemen-81e20.firebasestorage.app",
  messagingSenderId: "607974212903",
  appId: "1:607974212903:web:cc7bfb7ee51fb5101d1502",
  measurementId: "G-RY2610FE5J"
};

const $ = (id) => document.getElementById(id);
const connection = $("connection");
const appArea = $("appArea");
const authForm = $("authForm");
const studentForm = $("studentForm");
const rows = $("studentRows");
const loading = $("loading");
let db, auth, allStudents = [], currentUser = null;

function setMessage(message, isError = false) {
  $("formMessage").textContent = message;
  $("formMessage").style.color = isError ? "#b42318" : "#22744b";
}
function friendlyError(error) {
  const messages = {
    "auth/email-already-in-use": "This email already has an account. Sign in instead.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/weak-password": "Use a password with at least 6 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/operation-not-allowed": "Enable Email/Password in Firebase Authentication settings.",
    "permission-denied": "Firestore denied access. Check your Firestore security rules.",
    "failed-precondition": "Firestore setup/index may be missing."
  };
  return messages[error.code] || error.message || "Something went wrong.";
}

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  connection.textContent = "Firebase configured";

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    const signedIn = Boolean(user);
    appArea.classList.toggle("locked", !signedIn);
    $("authMessage").textContent = signedIn ? `Signed in as ${user.email}` : "Sign in to manage student records, or create your admin account.";
    $("emailLabel").classList.toggle("hidden", signedIn);
    $("passwordLabel").classList.toggle("hidden", signedIn);
    $("signInBtn").classList.toggle("hidden", signedIn);
    $("signUpBtn").classList.toggle("hidden", signedIn);
    $("signOutBtn").classList.toggle("hidden", !signedIn);
    if (signedIn) {
      await loadStudents();
    } else {
      allStudents = [];
      renderStudents();
      loading.textContent = "Sign in to load records.";
    }
  });
} catch (error) {
  connection.textContent = "Configuration error";
  loading.textContent = friendlyError(error);
}

$("signOutBtn").addEventListener("click", async () => {
  try { await signOut(auth); } catch (e) { alert(friendlyError(e)); }
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, $("email").value.trim(), $("password").value);
  } catch (e) { alert(friendlyError(e)); }
});

$("signUpBtn").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  if (!email || password.length < 6) return alert("Enter an email and a password of at least 6 characters.");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (e) { alert(friendlyError(e)); }
});

function formData() {
  return {
    fullName: $("fullName").value.trim(),
    rollNo: $("rollNo").value.trim(),
    email: $("studentEmail").value.trim(),
    phone: $("phone").value.trim(),
    course: $("course").value.trim(),
    academicYear: $("academicYear").value.trim(),
    marks: $("marks").value.trim(),
    dob: $("dob").value,
    address: $("address").value.trim(),
    updatedAt: serverTimestamp()
  };
}

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return setMessage("Please sign in first.", true);
  const data = formData();
  if (!data.fullName || !data.rollNo || !data.course) return setMessage("Name, roll number and course are required.", true);
  $("saveBtn").disabled = true;
  try {
    const id = $("studentId").value;
    if (id) {
      await updateDoc(doc(db, "students", id), data);
      setMessage("Student record updated successfully.");
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, "students"), data);
      setMessage("Student record saved successfully.");
    }
    resetForm(false);
    await loadStudents();
  } catch (e) {
    setMessage(friendlyError(e), true);
  } finally {
    $("saveBtn").disabled = false;
  }
});

function resetForm(clearMessage = true) {
  studentForm.reset();
  $("studentId").value = "";
  $("formTitle").textContent = "Add a student";
  $("saveBtn").textContent = "Save student";
  $("editBadge").classList.add("hidden");
  $("cancelEditBtn").classList.add("hidden");
  if (clearMessage) setMessage("");
}
$("cancelEditBtn").addEventListener("click", () => resetForm());

function editStudent(id) {
  const s = allStudents.find(item => item.id === id);
  if (!s) return;
  $("studentId").value = s.id;
  $("fullName").value = s.fullName || "";
  $("rollNo").value = s.rollNo || "";
  $("studentEmail").value = s.email || "";
  $("phone").value = s.phone || "";
  $("course").value = s.course || "";
  $("academicYear").value = s.academicYear || "";
  $("marks").value = s.marks || "";
  $("dob").value = s.dob || "";
  $("address").value = s.address || "";
  $("formTitle").textContent = "Update student";
  $("saveBtn").textContent = "Update record";
  $("editBadge").classList.remove("hidden");
  $("cancelEditBtn").classList.remove("hidden");
  setMessage("");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeStudent(id) {
  const s = allStudents.find(item => item.id === id);
  if (!s || !confirm(`Delete the record for ${s.fullName}? This cannot be undone.`)) return;
  try {
    await deleteDoc(doc(db, "students", id));
    await loadStudents();
    if ($("studentId").value === id) resetForm();
  } catch (e) { alert(friendlyError(e)); }
}

async function loadStudents() {
  loading.textContent = "Loading records…";
  try {
    const snapshot = await getDocs(query(collection(db, "students"), orderBy("fullName")));
    allStudents = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderStudents();
  } catch (e) {
    allStudents = [];
    renderStudents();
    loading.textContent = friendlyError(e);
  }
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function renderStudents() {
  const term = $("search").value.trim().toLowerCase();
  const filtered = allStudents.filter(s =>
    [s.fullName, s.rollNo, s.course, s.email, s.phone].some(v => String(v || "").toLowerCase().includes(term))
  );
  $("recordCount").textContent = String(allStudents.length);
  rows.innerHTML = filtered.map(s => `<tr>
    <td><strong>${safe(s.fullName)}</strong><small>${safe(s.academicYear || "Academic year not set")}</small></td>
    <td>${safe(s.rollNo)}</td>
    <td>${safe(s.course)}</td>
    <td>${safe(s.email)}${s.phone ? `<small>${safe(s.phone)}</small>` : ""}</td>
    <td>${safe(s.marks || "—")}</td>
    <td><div class="actions"><button class="small-btn" data-edit="${safe(s.id)}">Edit</button><button class="small-btn danger" data-delete="${safe(s.id)}">Delete</button></div></td>
  </tr>`).join("");
  loading.classList.toggle("hidden", filtered.length > 0);
  if (!filtered.length) loading.textContent = allStudents.length ? "No matching students found." : "No student records yet. Add your first student above.";
  rows.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => editStudent(b.dataset.edit)));
  rows.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => removeStudent(b.dataset.delete)));
}
$("search").addEventListener("input", renderStudents);
