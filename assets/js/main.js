import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// !!! DÁN CONFIG FIREBASE CỦA BẠN VÀO ĐÂY !!!
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "kho-tai-bb288.firebaseapp.com",
  projectId: "kho-tai-bb288",
  storageBucket: "kho-tai-bb288.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const catContainer = document.getElementById("category-container");
const fileContainer = document.getElementById("file-container");
const catSection = document.getElementById("category-section");
const fileSection = document.getElementById("file-section");

// Khai báo sẵn các icon để random cho thư mục đỡ nhàm chán
const icons = [
  "fa-code",
  "fa-terminal",
  "fa-microchip",
  "fa-gamepad",
  "fa-robot",
];

async function loadCategories() {
  const snap = await getDocs(collection(db, "categories"));
  catContainer.innerHTML = "";
  if (snap.empty)
    return (catContainer.innerHTML =
      '<div class="col-12 text-center text-muted">Hệ thống chưa có dữ liệu.</div>');

  let iconIndex = 0;
  snap.forEach((doc) => {
    const data = doc.data();
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-4 col-sm-6";

    // Tạo thẻ 3D
    col.innerHTML = `
            <div class="glass-card-3d h-100">
                <div class="icon-wrapper">
                    <i class="fa-solid ${icons[iconIndex % icons.length]}"></i>
                </div>
                <h5 class="fw-bold text-white mb-2 card-title-3d">${data.name}</h5>
                <span class="badge bg-dark border border-secondary text-cyan mt-2">Initialize()</span>
            </div>
        `;
    col.onclick = () => loadFiles(doc.id, data.name);
    catContainer.appendChild(col);
    iconIndex++;
  });
}

async function loadFiles(catId, catName) {
  catSection.classList.add("d-none");
  fileSection.classList.remove("d-none");
  document.getElementById("current-category-name").innerHTML =
    `<i class="fa-solid fa-folder-open text-cyan me-2"></i> ${catName} <span class="fs-6 text-muted ms-2">/ directory</span>`;
  fileContainer.innerHTML =
    '<div class="col-12 text-center py-5"><div class="spinner-border text-cyan"></div></div>';

  const q = query(collection(db, "files"), where("categoryId", "==", catId));
  const snap = await getDocs(q);
  fileContainer.innerHTML = "";

  if (snap.empty) {
    fileContainer.innerHTML =
      '<div class="col-12 text-center text-muted py-4"><i class="fa-solid fa-ghost fs-1 mb-3 opacity-50"></i><br>Thư mục này hiện đang trống.</div>';
    return;
  }

  snap.forEach((doc) => {
    const data = doc.data();
    const col = document.createElement("div");
    col.className = "col-12";
    col.innerHTML = `
            <div class="file-card-cyber">
                <div class="d-flex align-items-center">
                    <div class="fs-2 text-secondary me-3"><i class="fa-regular fa-file-code"></i></div>
                    <div>
                        <h5 class="mb-1 file-name-code">${data.name}</h5>
                        <small class="text-secondary fw-semibold">Size: Unknown | Type: Source</small>
                    </div>
                </div>
                <a href="${data.driveUrl}" target="_blank" class="btn btn-download-3d">
                    <i class="fa-solid fa-cloud-arrow-down me-2"></i>DOWNLOAD
                </a>
            </div>
        `;
    fileContainer.appendChild(col);
  });
}

document.getElementById("btn-back").onclick = () => {
  fileSection.classList.add("d-none");
  catSection.classList.remove("d-none");
};

loadCategories();
