import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage("Login berhasil!");

        const userData = {
          user_id: data.user_id,
          email,
          username: data.username || email,
        };

        login(userData, data.token); // Simpan ke context

        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else {
        setIsSuccess(false);
        setMessage(data.error || "Login gagal");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("Terjadi kesalahan, coba lagi nanti.");
    }
  };

  return (
    <div className="login-container flex-center">
      <div className="login-card">
        <h2 className="login-title">Login Akun</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="Email kamu"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="********"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        {message && (
          <p style={{ color: isSuccess ? "green" : "red", marginTop: 10 }}>
            {message}
          </p>
        )}
        <p className="login-footer">
          Belum punya akun?{" "}
          <a href="/register" className="register-link">
            Daftar sekarang
          </a>
        </p>
      </div>
    </div>
  );
}
