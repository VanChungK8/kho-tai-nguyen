import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  onSnapshot,
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

// 1. Quản lý Thư mục
const catList = document.getElementById("cat-list");
const catSelect = document.getElementById("cat-select");

document.getElementById("btn-add-cat").onclick = async () => {
  const name = document.getElementById("cat-name").value.trim();
  if (!name) return alert("Nhập tên thư mục!");
  await addDoc(collection(db, "categories"), { name });
  document.getElementById("cat-name").value = "";
};

onSnapshot(collection(db, "categories"), (snap) => {
  catList.innerHTML = "";
  catSelect.innerHTML = '<option value="">-- Chọn thư mục --</option>';
  snap.forEach((docSnap) => {
    const id = docSnap.id;
    const data = docSnap.data();
    catSelect.innerHTML += `<option value="${id}">${data.name}</option>`;

    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center bg-transparent";
    li.innerHTML = `<span class="fw-bold"><i class="fa-regular fa-folder text-warning me-2"></i>${data.name}</span>
                        <button class="btn btn-sm btn-outline-danger border-0" data-id="${id}"><i class="fa-solid fa-trash"></i></button>`;
    li.querySelector("button").onclick = () => {
      if (confirm("Xóa?")) deleteDoc(doc(db, "categories", id));
    };
    catList.appendChild(li);
  });
});

// 2. Thêm Link Drive (Node files độc lập)
document.getElementById("btn-add-file").onclick = async () => {
  const catId = catSelect.value;
  const name = document.getElementById("file-name").value.trim();
  const driveUrl = document.getElementById("drive-url").value.trim();

  if (!catId || !name || !driveUrl) return alert("Điền đầy đủ thông tin!");

  await addDoc(collection(db, "files"), {
    categoryId: catId,
    name: name,
    driveUrl: driveUrl,
  });
  document.getElementById("file-name").value = "";
  document.getElementById("drive-url").value = "";
  alert("Đã thêm bài học thành công!");
};

// 3. Hiển thị danh sách Link
onSnapshot(collection(db, "files"), (snap) => {
  const fileList = document.getElementById("file-list");
  fileList.innerHTML = "";
  snap.forEach((docSnap) => {
    const id = docSnap.id;
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="ps-4 fw-bold text-dark">${data.name}</td>
            <td><a href="${data.driveUrl}" target="_blank" class="drive-link">${data.driveUrl}</a></td>
            <td class="text-end pe-4"><button class="btn btn-sm btn-light text-danger" data-id="${id}"><i class="fa-solid fa-xmark"></i></button></td>
        `;
    tr.querySelector("button").onclick = () => {
      if (confirm("Xóa?")) deleteDoc(doc(db, "files", id));
    };
    fileList.appendChild(tr);
  });
});
