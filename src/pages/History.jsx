import React, { useEffect, useState } from 'react';
import NavBar from '../component/NavBar';
import axios from 'axios';
import '../App.css';
import CreditLogo from '../component/CreditLogo';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    const token = localStorage.getItem('token');  // ambil token yang sudah disimpan saat login
    axios.get('http://localhost:5000/history', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setHistory(res.data))
    .catch(err => console.error(err));
  };

  const handleDelete = (filenameWithPath) => {
    // filenameWithPath dari backend misalnya "annotated/annotated_filename.jpg"
    const filename = filenameWithPath.split("/").pop();
    const token = localStorage.getItem('token');

    if (window.confirm("Yakin ingin menghapus riwayat ini?")) {
      axios.delete(`http://localhost:5000/history/${filename}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(() => {
        // Update state setelah delete
        setHistory(prev => prev.filter(item => item.filename !== filenameWithPath));
      })
      .catch(err => {
        console.error("Gagal menghapus:", err);
        alert("Terjadi kesalahan saat menghapus data.");
      });
    }
  };

  return (
    <>
      <NavBar />
      <div className="container">
        <div className="history-container">
          <div style={{ textAlign: 'center' }}>
          <h2 className="history-title">Riwayat Deteksi Penyakit Kucing</h2>
          </div>
          {history.length === 0 ? (
            <p className="history-empty">Belum ada data deteksi.</p>
          ) : (
            <div className="history-grid">
              {history.map((item, index) => (
                <div key={index} className="history-card">
                  <img
                    // Sesuaikan URL supaya load gambar dari folder annotated
                    src={`http://localhost:5000/uploads/${item.filename}`}
                    alt="Deteksi"
                    className="history-image"
                  />
                  <p className="history-label">
                    <strong>Hasil Deteksi:</strong> {item.disease_details && item.disease_details.length > 0
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
