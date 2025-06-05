import React, { useState } from 'react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/register', {
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
      } else {
        setMessage(data.error || 'Terjadi kesalahan saat registrasi.');
      }
    } catch (error) {
      setMessage('Gagal terhubung ke server.');
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
        {message && <p>{message}</p>}
        <p className="footer">
          Sudah punya akun? <a href="/login" className="link">Masuk di sini</a>
        </p>
      </div>
    </div>
  );
}