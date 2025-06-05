import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NavBar from '../component/NavBar';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom'; 
import CreditLogo from '../component/CreditLogo';
import CameraCaptureBox from '../component/CameraCaptureBox';

const Home = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const { token, user } = useAuth(); // Ambil juga user dari context
  const [isSaved, setIsSaved] = useState(false);
  // const location = useLocation();
  const inputFileRef = useRef(null);

  // Modal kamera
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraImageDataURL, setCameraImageDataURL] = useState(null);

  // useEffect(() => {
  //   setSelectedImage(null);
  //   setPreviewURL(null);
  //   setShowModal(false);
  //   setLoading(false);
  //   setLoadingSave(false);
  //   if (inputFileRef.current) {
  //     inputFileRef.current.value = null;
  //   }
  // }, [location.pathname]);-

  // useEffect (logout)
  useEffect(() => {
    if (!token) {
      setIsSaved(false); // Reset isSaved jika user logout
      setDetectionResult(null); 
      setCameraImageDataURL(null); 
      setSelectedImage(null); 
      setPreviewURL(null); 
      setShowModal(false); 
      if (inputFileRef.current) {
        inputFileRef.current.value = null; // Reset input file saat logout
      }
    }
  }, [token]);


  // Fungsi tangkap gambar dari kamera
  const handleCameraCapture = (dataUrl) => {
    setCameraImageDataURL(dataUrl);
    setDetectionResult(null); // Reset hasil deteksi sebelumnya
    setShowModal(false);
    setIsSaved(false); 
    setSelectedImage(null); 
    setPreviewURL(null); 
    setShowCameraModal(false);
    if (inputFileRef.current) {
      inputFileRef.current.value = null; // Reset input file
    }
  };

  // Detect dari gambar kamera
  const handleDetectCameraImage = () => {
    if (!cameraImageDataURL) {
      alert('Please capture an image first!');
      return;
    }
    if (!token) {
      alert("Please login first!");
      return;
    }
    setIsSaved(false); 
    setDetectionResult(null); 
    setLoading(true);
    setLoadingSave(false);

    fetch(cameraImageDataURL)
      .then(res => res.blob())
      .then(blob => {
        const formData = new FormData();
        formData.append('image', blob, 'camera_capture.jpg');

        return axios.post('http://localhost:5000/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      })
      .then(res => {
        setDetectionResult(res.data);
        setShowModal(true);
      })
      .catch(err => {
        alert(`Detection failed: ${err.response?.data?.error || 'Unknown error'}`);
      })
      .finally(() => setLoading(false));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewURL(URL.createObjectURL(file));
      setDetectionResult(null); // Reset hasil deteksi sebelumnya
      setShowModal(false);
      setIsSaved(false); // Reset isSaved saat ada gambar baru dipilih
      setCameraImageDataURL(null); 
    }
  };

  const handleDetect = () => {
    if (!selectedImage) {
      alert('Please select an image first!');
      return;
    }
    if (!token) {
      alert("Please login first!");
      return;
    }

    setIsSaved(false); // Reset isSaved saat ada deteksi baru
    setDetectionResult(null); 
    setLoading(true);
    setLoadingSave(false);

    const formData = new FormData();
    formData.append('image', selectedImage);

    axios.post('http://localhost:5000/upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(res => {
      setDetectionResult(res.data);
      setShowModal(true);
    })
    .catch(err => {
      alert(`Detection failed: ${err.response?.data?.error || 'Unknown error'}`);
    })
    .finally(() => setLoading(false));
  };

  const handleSaveToHistory = () => {
    if (!detectionResult) {
      alert("No detection result to save");
      return;
    }
    if (!token) {
      alert("Please login first!");
      return;
    }

    setLoadingSave(true);
    setIsSaved(false);

    axios.post('http://localhost:5000/save_history_db', {
      filename: detectionResult.filename,
      detected_classes: detectionResult.detected_classes,
      disease_details: detectionResult.disease_details,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      setIsSaved(true);
      alert("✅ Detection result saved to history!");
      setShowModal(false);
      setSelectedImage(null);
      setPreviewURL(null);
      setCameraImageDataURL(null);
      setDetectionResult(null); 
      if (inputFileRef.current) {
        inputFileRef.current.value = null; // Reset input file setelah disimpan
      }
    })
    .catch(() => {
      alert("❌ Failed to save to history.");
    })
    .finally(() => {
      setLoadingSave(false);
    });
  };

  return (
    <>
      <NavBar />
      <div className="container">
        <div className="home-row">
          {/* Upload Image Section */}
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
                ref={inputFileRef}
              />
              <button 
                className="btn-detect" 
                onClick={handleDetect} 
                disabled={loading || !token} // Disable jika tidak ada token
              >
                {loading ? 'Detecting...' : 'Go Detect'}
              </button>
            </div>

            {previewURL && (
              <div className="image-preview">
                <img src={previewURL} alt="Preview" className="preview-image" />
              </div>
            )}
          </div>

          {/* Button Open Camera Modal */}
          <div className="open-camera-container">
            <div className="upload-camera-box">
              <p className="text-camera">Use this button to detect with your camera!</p>

              <button
                className="btn-open-camera"
                onClick={() => setShowCameraModal(true)}
              >
                📸Open Camera
              </button>

              <button
                className="btn-detect-cam"
                onClick={() => {
                  if (!cameraImageDataURL) {
                    alert("Please input image first");
                  } else {
                    handleDetectCameraImage();
                  }
                }}
                disabled={loading || !token}
              >
                {loading ? 'Detecting...' : 'Go Detect (Cam.ver)'}
              </button>
            </div>

            {cameraImageDataURL && (
              <div className="image-preview-cam">
                <img
                  src={cameraImageDataURL}
                  alt="Camera Capture Preview"
                  className="preview-image-cam"
                />
              </div>
            )}
          </div>


          <div className="image-cat-wrapper">
                <div className="image-cat">
                  <img src="src/assets/cengk2.png" alt="cat" />
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
          </div>

      {/* Detection Result Modal */}
      {showModal && detectionResult?.disease_details && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Detection Result</h2>

            {detectionResult.disease_details.map((disease, index) => (
              <div key={index} className="disease-detail">
                <h4 className="disease-name"><b>{disease.name}</b></h4>
                <p><b>Penjelasan:</b> {disease.penjelasan}</p>
                <p><b>Solusi:</b> {disease.solusi}</p>
              </div>
            ))}

            {detectionResult.filename && (
              <div className="annotated-image">
                <h3>Annotated Image:</h3>
                <img
                  src={`http://localhost:5000/uploads/${detectionResult.filename}`}
                  alt="Detected Result"
                  className="result-image"
                />
              </div>
            )}

            <div className="modal-buttons">
              <button 
                className="modal-btn save-btn" 
                onClick={handleSaveToHistory}
                disabled={loadingSave || isSaved || !token} // Tambahkan !token
              >
                {loadingSave ? 'Saving...' : (isSaved ? 'Saved' : 'Save to History')}
              </button>

              <button 
                className="modal-btn close-btn" 
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-camera-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowCameraModal(false)}
            >
              &times;
            </button>
            <h3 className="modal-camera-title">Capture Image</h3>
            <CameraCaptureBox onCapture={handleCameraCapture} />
          </div>
        </div>
      )}


      <footer className="footer-credit">
        <CreditLogo />
      </footer>
    </>
  );
};

export default Home;
