import { useState } from 'react';
import NavBar from '../component/NavBar';
import '../App.css';
import CreditLogo from '../component/CreditLogo';
import cengk2Image from '../assets/cengk2.png';

const PublicHome = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // ============================

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setDetectionResult(null);
      setResultImage(null);
    }
  };

  const handleDetect = () => {
    if (!selectedImage) {
      alert('Please select an image first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    setLoading(true);

    // === Update di sini ===
    fetch(`${API_URL}/public-upload`, { // API_URL di sini
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        setDetectionResult(data);
        if (data.filename) {
          // === Update juga di sini ===
          setResultImage(`${API_URL}/uploads/${data.filename}`); // API_URL di sini
        }
        setShowModal(true);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Detection error:', err);
        alert('Detection failed.');
        setLoading(false);
      });
  };

  return (
    <>
      <NavBar />
      <div className="container">
        <h1 className="welcome">Welcome to Cat Skin Detect Disease!</h1>
        <h3 className="text-sign">Sign in to experience our other features!</h3>
        <div className="home-row">
          <div className="upload-box">
            <div className="left-side">
              <label htmlFor="imageUpload" className="upload-label">
                Upload Image Here
              </label>
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                onChange={handleImageChange}
                className="file-input"
              />
              <button className="btn-detect" onClick={handleDetect} disabled={loading}>
                {loading ? 'Detecting...' : 'Go Detect'}
              </button>
            </div>

            {previewURL && (
              <div className="image-preview">
                <img src={previewURL} alt="Preview" className="preview-image" />
              </div>
            )}
          </div>

          <div className="image-cat-wrapper">
            <div className="image-cat">
              <img src={cengk2Image} alt="cat" />
            </div>
          <div className="speech-bubble">
            <p>Try this in your cat's skin!</p>
            <p>Types of cat's disease that can be detected:</p>
            <ul>
              <li>Scabies</li>
              <li>Ringworm</li>
              <li>Hairloss</li>
            </ul>
          </div>
          </div>

        </div>

        <div className="sign-in-features">
            <h3 className="text-sign">Here's our other features!</h3>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">📸</span>
                <p className="feature-text">Detect with camera</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💾</span>
                <p className="feature-text">Save to history</p>
              </div>
            </div>
        </div>

        <footer className="footer-credit">
            <CreditLogo />
          </footer>
      </div>

      {/* MODAL VIEW */}
      {showModal && detectionResult && detectionResult.disease_details && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Detection Result</h2>

            {detectionResult.disease_details.map((disease, index) => (
              <div key={index}>
                <h4><b>{disease.name}</b></h4>
                <p><b>Penjelasan:</b> {disease.penjelasan}</p>
                <p><b>Solusi:</b> {disease.solusi}</p>
              </div>
            ))}

            {result.image_url && (
              <div className="annotated-image">
                <h3>Annotated Image:</h3>
                <img
                  src={result.image_url}
                  alt="Detected Result"
                  style={{ maxWidth: '100%', marginBottom: '1rem' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px' }}>
                Cancel
              </button>
              <button
                style={{ padding: '10px 20px', backgroundColor: '#aaa', color: '#fff', cursor: 'not-allowed' }}
                disabled
                title="Login to save detection result"
              >
                Save (Login Required)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicHome;