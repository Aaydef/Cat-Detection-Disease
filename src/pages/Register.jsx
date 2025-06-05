import React, { useState } from 'react';
// import axios from 'axios'; // Anda menggunakan fetch, jadi axios tidak diperlukan di sini
import { useNavigate } from 'react-router-dom'; // Penting jika Anda ingin navigasi setelah register

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Inisialisasi useNavigate


  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      // === Ganti di sini ===
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registrasi berhasil! Silakan login.');
        setUsername('');
        setEmail('');
        setPassword('');
        // Arahkan user ke halaman login setelah registrasi berhasil
        navigate('/login');
      } else {
        setMessage(data.error || 'Terjadi kesalahan saat registrasi.');
      }
    } catch (error) {
      console.error("Error during registration:", error); // Log error untuk debugging
      setMessage('Gagal terhubung ke server. Pastikan backend berjalan.');
    }
  };

  return (
    <div className="containerReg">
      <div className="cardReg">
        <h2 className="title">Daftar Akun</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Nama kamu"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="Email kamu"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="********"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="button">Daftar</button>
        </form>
        {message && <p className="message-status">{message}</p>} {/* Tambahkan kelas untuk styling pesan */}
        <p className="footer">
          Sudah punya akun? <a href="/login" className="link">Masuk di sini</a>
        </p>
      </div>
    </div>
  );
}