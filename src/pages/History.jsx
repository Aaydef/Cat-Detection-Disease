import React, { useEffect, useState } from 'react';
import NavBar from '../component/NavBar';
import axios from 'axios';
import '../App.css';
import CreditLogo from '../component/CreditLogo';
import { useAuth } from '../context/AuthContext'; // Penting: Pastikan ini diimpor

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true); // Tambahkan state loading
  const [error, setError] = useState(null); // Tambahkan state error
  const { token } = useAuth(); // Ambil token dari AuthContext

  // === Tambahkan ini di sini ===
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // ============================

  useEffect(() => {
    // Panggil fetchHistory di dalam useEffect agar memiliki akses ke token
    const fetchHistory = async () => {
      if (!token) {
        setLoading(false);
        setError("Anda belum login. Silakan login untuk melihat riwayat.");
        return;
      }

      setLoading(true); // Mulai loading
      setError(null); // Reset error

      try {
        // Menggunakan API_URL untuk panggilan GET history
        const res = await axios.get(`${API_URL}/history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.error || "Gagal memuat riwayat. Pastikan backend berjalan.");
      } finally {
        setLoading(false); // Selesai loading
      }
    };

    fetchHistory();
  }, [token, API_URL]); // Tambahkan token dan API_URL sebagai dependency

  const handleDelete = async (filenameWithPath) => {
    // filenameWithPath dari backend misalnya "annotated/annotated_filename.jpg"
    // Kita butuh hanya nama file nya saja untuk endpoint delete
    const filename = filenameWithPath.split("/").pop();
    // Token sudah diambil dari useAuth di awal komponen, tidak perlu localStorage.getItem lagi

    if (!token) {
      alert("Anda harus login untuk menghapus riwayat.");
      return;
    }

    if (window.confirm("Yakin ingin menghapus riwayat ini?")) {
      try {
        // Menggunakan API_URL untuk panggilan DELETE history
        await axios.delete(`${API_URL}/history/${filename}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Update state setelah delete
        setHistory(prev => prev.filter(item => item.filename !== filenameWithPath));
        alert("Riwayat berhasil dihapus!");
      } catch (err) {
        console.error("Gagal menghapus:", err.response ? err.response.data : err.message);
        alert("Terjadi kesalahan saat menghapus data.");
      }
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container">
          <h2 className="history-title">Memuat Riwayat Deteksi...</h2>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="container">
          <h2 className="history-title" style={{ color: 'red' }}>Terjadi Kesalahan!</h2>
          <p className="history-empty">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container">
        <div className="history-container">
          <div style={{ textAlign: 'center' }}>
            <h2 className="history-title">Riwayat Deteksi Penyakit Kucing</h2>
          </div>
          {history.length === 0 ? (
            <p className="history-empty">Belum ada data deteksi. Silakan lakukan deteksi terlebih dahulu.</p>
          ) : (
            <div className="history-grid">
              {history.map((item, index) => (
                <div key={index} className="history-card">
                  <img
                    // Menggunakan API_URL untuk URL gambar
                    src={`${API_URL}/uploads/${item.filename}`}
                    alt="Deteksi"
                    className="history-image"
                  />
                  <p className="history-label">
                    <strong>Hasil Deteksi:</strong>{" "}
                    {item.disease_details && item.disease_details.length > 0
                      ? item.disease_details.map((d) => d.name).join(', ')
                      : item.detected_classes && item.detected_classes.length > 0
                        ? item.detected_classes.join(', ')
                        : "Tidak ada deteksi."}
                  </p>

                  <ul className="history-detections">
                    {item.disease_details && item.disease_details.length > 0 && (
                      item.disease_details.map((disease, i) => (
                        <li key={i}>
                          <div>
                            <span className="penjelasan">Penjelasan:</span>
                            <ul>
                              {disease.penjelasan.split(',').map((point, idx) => (
                                <li key={idx}>{point.trim()}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="solusi">Solusi:</span>
                            <ul>
                              {disease.solusi.split(',').map((s, idx) => (
                                <li key={idx}>{s.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                  <p className="history-date"><strong>Access:</strong> {item.upload_time}</p>

                  {/* Tombol Delete */}
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(item.filename)}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="footer-credit">
          <CreditLogo />
        </footer>
      </div>
    </>
  );
};

export default History;