// FullPageCapture.jsx
import React, { useState } from 'react';

const FullPageCapture = ({ targetElementId }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);

  const captureVisibleTab = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: window.screen.width },
          height: { ideal: window.screen.height }
        },
        audio: false,
        selfBrowserSurface: "include", // This allows current tab to be shown
        surfaceSwitching: "include",
        systemAudio: "exclude"
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve) => {
        video.addEventListener('loadedmetadata', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          
          stream.getTracks().forEach(track => track.stop());
          resolve(canvas.toDataURL('image/png'));
        });
      });
    } catch (error) {
      console.error('Screen capture failed:', error);
      return null;
    }
  };

  // Chrome extension's exact positioning logic
  const getPositions = () => {
    const body = document.body;
    const originalBodyOverflowYStyle = body ? body.style.overflowY : '';
    const originalX = window.scrollX;
    const originalY = window.scrollY;
    const originalOverflowStyle = document.documentElement.style.overflow;

    if (body) {
      body.style.overflowY = 'visible';
    }

    const widths = [
      document.documentElement.clientWidth,
      body ? body.scrollWidth : 0,
      document.documentElement.scrollWidth,
      body ? body.offsetWidth : 0,
      document.documentElement.offsetWidth
    ];
    const heights = [
      document.documentElement.clientHeight,
      body ? body.scrollHeight : 0,
      document.documentElement.scrollHeight,
      body ? body.offsetHeight : 0,
      document.documentElement.offsetHeight
    ];

    const max = (nums) => Math.max.apply(Math, nums.filter(x => x));
    
    let fullWidth = max(widths);
    const fullHeight = max(heights);
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scrollPad = 200;
    const yDelta = windowHeight - (windowHeight > scrollPad ? scrollPad : 0);
    const xDelta = windowWidth;

    if (fullWidth <= xDelta + 1) {
      fullWidth = xDelta;
    }

    document.documentElement.style.overflow = 'hidden';

    const arrangements = [];
    let yPos = fullHeight - windowHeight;

    while (yPos > -yDelta) {
      let xPos = 0;
      while (xPos < fullWidth) {
        arrangements.push([xPos, yPos]);
        xPos += xDelta;
      }
      yPos -= yDelta;
    }

    return {
      arrangements,
      fullWidth,
      fullHeight,
      windowWidth,
      windowHeight,
      cleanup: () => {
        document.documentElement.style.overflow = originalOverflowStyle;
        if (body) {
          body.style.overflowY = originalBodyOverflowYStyle;
        }
        window.scrollTo(originalX, originalY);
      }
    };
  };

  const captureFullPage = async () => {
    setIsCapturing(true);
    setProgress(0);

    try {
      const { arrangements, fullWidth, fullHeight, cleanup } = getPositions();
      
      // Create final canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = fullWidth;
      finalCanvas.height = fullHeight;
      const finalCtx = finalCanvas.getContext('2d');
      
      // Fill with white background
      finalCtx.fillStyle = '#ffffff';
      finalCtx.fillRect(0, 0, fullWidth, fullHeight);

      let processedCount = 0;

      for (const [x, y] of arrangements) {
        window.scrollTo(x, y);
        setProgress(processedCount / arrangements.length);
        
        // Wait for scroll to settle (Chrome extension delay)
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Capture using screen capture API (closest to Chrome extension)
        const dataUrl = await captureVisibleTab();
        
        if (dataUrl) {
          const img = new Image();
          await new Promise(resolve => {
            img.onload = () => {
              // Calculate the portion of the image that corresponds to our scroll position
              const sourceX = Math.max(0, window.scrollX - x);
              const sourceY = Math.max(0, window.scrollY - y);
              const sourceWidth = Math.min(img.width - sourceX, window.innerWidth);
              const sourceHeight = Math.min(img.height - sourceY, window.innerHeight);
              
              finalCtx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                window.scrollX, window.scrollY, sourceWidth, sourceHeight
              );
              resolve();
            };
            img.src = dataUrl;
          });
        }
        
        processedCount++;
      }

      cleanup();
      setProgress(1);

      // Download the final image
      const link = document.createElement('a');
      const now = new Date();
      const timestamp = now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0') + '_' +
                       String(now.getHours()).padStart(2, '0') + 
                       String(now.getMinutes()).padStart(2, '0');
      
      link.download = `sbi-loan-form-${timestamp}.png`;
      link.href = finalCanvas.toDataURL('image/png');
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Capture failed:', error);
      alert('Screen capture failed. Please ensure you grant screen sharing permission.');
    } finally {
      setIsCapturing(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ 
      marginTop: '30px', 
      padding: '25px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '12px', 
      border: '1px solid #e0e6ed',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '940px',
      margin: '30px auto 0 auto'
    }}>
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={captureFullPage}
          disabled={isCapturing}
          style={{
            background: isCapturing 
              ? 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)' 
              : 'linear-gradient(135deg, #4a3c9a 0%, #6f42c1 100%)',
            color: 'white',
            border: 'none',
            padding: '14px 28px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: isCapturing ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isCapturing 
              ? 'none' 
              : '0 4px 15px rgba(74, 60, 154, 0.3)',
            minWidth: '300px'
          }}
        >
          {isCapturing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Capturing... {Math.round(progress * 100)}%
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>📸</span>
              Capture with Screen Share (Chrome-like)
            </span>
          )}
        </button>
        
        {isCapturing && (
          <div style={{ marginTop: '25px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '15px'
            }}>
              <div style={{ 
                height: '100%',
                backgroundColor: '#4a3c9a',
                width: `${progress * 100}%`,
                transition: 'width 0.3s ease',
                borderRadius: '20px'
              }}></div>
            </div>
            <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
              📸 Screen capture in progress... Grant permission when prompted.
            </p>
          </div>
        )}
        
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#1565c0'
        }}>
          💡 <strong>Note:</strong> This method uses screen capture API (like Chrome extensions) for pixel-perfect quality. You'll be prompted to share your screen - select "Chrome Tab" for best results.
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FullPageCapture;
