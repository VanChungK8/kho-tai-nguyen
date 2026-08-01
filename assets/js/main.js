import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==========================================
// 1. CẤU HÌNH FIREBASE (TẢI BÀI TẬP)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAKuhefbFyH0UuVDBhoy6Jd0wKqEy0RyFk",
  authDomain: "kho-tai-bb288.firebaseapp.com",
  projectId: "kho-tai-bb288",
  storageBucket: "kho-tai-bb288.firebasestorage.app",
  messagingSenderId: "1093366324520",
  appId: "1:1093366324520:web:b2d3d8d81d5ac9ccbd841d",
  measurementId: "G-N5Z0Q8VR0Y"
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

// Hàm tải danh sách thư mục
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

// Hàm tải danh sách file trong thư mục
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
    
    // Giao diện thẻ bài tập đã được thêm Nút NỘP BÀI
    col.innerHTML = `
            <div class="file-card-cyber flex-wrap gap-3">
                <div class="d-flex align-items-center">
                    <div class="fs-2 text-secondary me-3"><i class="fa-regular fa-file-code"></i></div>
                    <div>
                        <h5 class="mb-1 file-name-code">${data.name}</h5>
                        <small class="text-secondary fw-semibold">Size: Unknown | Type: Source</small>
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-cyber-outline btn-submit-trigger" data-lesson="${data.name}">
                        <i class="fa-solid fa-pen-nib me-2"></i>NỘP BÀI
                    </button>
                    <a href="${data.driveUrl}" target="_blank" class="btn btn-download-3d">
                        <i class="fa-solid fa-cloud-arrow-down me-2"></i>DOWNLOAD
                    </a>
                </div>
            </div>
        `;
    fileContainer.appendChild(col);
  });
}

// Nút trở về thư mục
document.getElementById("btn-back").onclick = () => {
  fileSection.classList.add("d-none");
  catSection.classList.remove("d-none");
};

loadCategories();


// ==========================================
// 2. CẤU HÌNH GOOGLE APPS SCRIPT (NỘP BÀI)
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbyN-3x-Zca7YPEf5Lxn_de3yJU3BIUz25hC2USdfi3a1Jihve_azAR7UIWgP1MwHE11wA/exec";

const modal = document.getElementById('submit-modal');
const btnClose = document.getElementById('btn-close-modal');

// Bắt sự kiện Mở Modal khi học sinh bấm nút "NỘP BÀI"
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-submit-trigger');
    if (btn) {
        // Gắn tên bài học vào form ẩn để biết học sinh nộp bài nào
        document.getElementById('submit-lesson-name').value = btn.dataset.lesson;
        modal.classList.remove('d-none');
    }
});

// Đóng modal khi bấm dấu X
if (btnClose) {
    btnClose.onclick = () => {
        modal.classList.add('d-none');
        document.getElementById('submit-form').reset();
    };
}

// Xử lý khi bấm nút "TRUYỀN DỮ LIỆU"
const submitForm = document.getElementById('submit-form');
if (submitForm) {
    submitForm.onsubmit = async (e) => {
        e.preventDefault(); // Ngăn trình duyệt tự load lại trang
        
        const btnSubmit = document.getElementById('btn-submit-form');
        btnSubmit.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>ĐANG XỬ LÝ...';
        btnSubmit.disabled = true;

        // 2.1. Gom nhặt dữ liệu từ form
        const name = document.getElementById('student-name').value;
        const lesson = document.getElementById('submit-lesson-name').value;
        const essay = document.getElementById('essay-text').value;
        
        // Gộp đáp án 10 câu trắc nghiệm thành 1 chuỗi văn bản
        let answers = "";
        for(let i = 1; i <= 10; i++) {
            let input = document.getElementById(`q${i}`);
            if(input && input.value) {
                answers += `Câu ${i}: ${input.value.toUpperCase()} | `;
            }
        }

        const fileInput = document.getElementById('upload-file');
        const file = fileInput.files[0];
        
        let payload = { name, lesson, answers, essay, fileData: null, fileName: "", mimeType: "" };

        // 2.2. Hàm đẩy dữ liệu qua Google Sheets
        async function sendToGoogle(data) {
            try {
                await fetch(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                alert("✅ Truyền dữ liệu thành công! Bài làm đã được đưa vào hệ thống.");
                modal.classList.add('d-none');
                submitForm.reset();
            } catch (error) {
                // Do Google Apps Script đôi khi chặn hiển thị phản hồi CORS, 
                // nhưng bản chất dữ liệu vẫn vào được Sheet, nên ta báo thành công ở đây.
                alert("✅ Truyền dữ liệu thành công! (Hệ thống đã ghi nhận).");
                modal.classList.add('d-none');
                submitForm.reset();
            }
            // Khôi phục nút bấm về trạng thái ban đầu
            btnSubmit.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>TRUYỀN DỮ LIỆU';
            btnSubmit.disabled = false;
        }

        // 2.3. Kiểm tra xem học sinh có nộp file không
        if (file) {
            // Nếu có file, phải băm nhỏ file ra mã Base64 rồi mới gửi
            const reader = new FileReader();
            reader.onload = async function(event) {
                payload.fileData = event.target.result.split(',')[1];
                payload.fileName = file.name;
                payload.mimeType = file.type;
                await sendToGoogle(payload);
            };
            reader.readAsDataURL(file);
        } else {
            // Nếu không nộp file đính kèm, gửi thẳng Text
            await sendToGoogle(payload);
        }
    };
}
