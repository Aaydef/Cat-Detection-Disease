import { useState, useEffect, useRef } from 'react';
import { MdFlipCameraAndroid } from 'react-icons/md';

const CameraCaptureBox = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImageURL, setCapturedImageURL] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = depan, 'environment' = belakang

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err);
          });
        };
      }
    } catch (err) {
      alert('Camera access denied or not available');
      console.error(err);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImageURL(imageDataUrl);
    if (onCapture) onCapture(imageDataUrl);
  };

  return (
    <div className="upload-box camera-upload-box">
      <div className="left-side camera-left-side">
        <label className="upload-label camera-label">
          Show Your Cat's Skin or Image of Cat Here
        </label>

        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ transform: 'scaleX(1)' }} // no mirror
          />
          <button
            className="btn-flip camera-flip-btn"
            onClick={() =>
              setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))
            }
            title="Flip Camera"
          >
            <MdFlipCameraAndroid size={24} />
          </button>
        </div>

        <button className="btn-detect camera-capture-btn" onClick={handleCapture}>
          CAPTURE
        </button>
      </div>

      {capturedImageURL && (
        <div className="image-preview camera-image-preview">
          <img
            src={capturedImageURL}
            alt="Captured"
            className="preview-image camera-preview-image"
          />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraCaptureBox;
