# Cat Skin Disease Detection System

Projek akhir ini merupakan sistem deteksi penyakit kulit kucing berbasis **YOLOv8** yang dapat membantu pemilik kucing mengenali gejala penyakit kulit melalui gambar.  
Sistem ini dibangun dengan arsitektur **Flask (backend)** dan **React (frontend)**, serta mendukung fitur login, riwayat deteksi, hingga mode preview tanpa login.

---

## ✨ Fitur
- 🔍 **Deteksi penyakit kulit kucing** menggunakan model YOLOv8 terlatih.
- 🖥️ **Frontend React** dengan tampilan interaktif.
- ⚙️ **Backend Flask** untuk inference model, penyimpanan hasil, dan API.
- 📂 **Riwayat deteksi** disimpan pada ` SQL database`.
- 👤 **Login & Register** untuk akses fitur tambahan (History & Disease Info).
- 👀 **Preview Mode** — pengguna tanpa login tetap dapat mencoba fitur deteksi.

---

## 🛠️ Tech Stack
- **Python (Flask)** — Backend & API
- **React + Tailwind** — Frontend
- **YOLOv8 (PyTorch)** — Computer Vision Model
- **Roboflow** — Dataset management & preprocessing
- **Kaggle** — Model training environment
---

## 🖼️ Image Annotation
Hasil anotasi gambar menggunakan Roboflow untuk dataset deteksi penyakit kulit kucing.
Proses anotasi dilakukan secara manual untuk memastikan ketepatan bounding box dan label pada setiap gambar.

<img width="1558" height="764" alt="image" src="https://github.com/user-attachments/assets/4862e541-b5c3-4120-8c56-223bbf5b1502" />

## Training Model
Proses training dilakukan secara langsung di Kaggle Notebook, dengan memanfaatkan GPU untuk mempercepat proses komputasi.
<img width="1425" height="840" alt="image" src="https://github.com/user-attachments/assets/6fd64f74-f96d-4a61-bf1f-0d11a1f71eeb" />

