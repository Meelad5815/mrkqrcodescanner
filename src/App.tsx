import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './App.css';

function App() {
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    }, false);

    scanner.render(success, error);

    function success(result: string) {
      scanner.clear();
      setScanResult(result);
    }

    function error(err: any) {
      console.warn(err);
    }

    // Cleanup on unmount
    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="app">
      <h1>QR Code Scanner</h1>
      {scanResult ? (
        <div className="result">
          <p>Scanned QR Code:</p>
          <a href={scanResult} target="_blank" rel="noopener noreferrer">
            {scanResult}
          </a>
        </div>
      ) : (
        <div id="reader" className="scanner"></div>
      )}
    </div>
  );
}

export default App;
