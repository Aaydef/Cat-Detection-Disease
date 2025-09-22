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
