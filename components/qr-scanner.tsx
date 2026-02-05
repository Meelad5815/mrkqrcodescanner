"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface ScanResult {
  text: string
  timestamp: Date
}

export default function QrScanner() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<any>(null)
  const mountedRef = useRef(true)

  const startScanner = useCallback(async () => {
    setScanResult(null)
    setError(null)
    setIsScanning(true)

    // Dynamically import html5-qrcode to avoid SSR issues
    const { Html5QrcodeScanner } = await import("html5-qrcode")

    // Small delay to ensure the DOM element exists
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (!mountedRef.current) return

    const readerEl = document.getElementById("reader")
    if (!readerEl) return

    // Clear any previous scanner content
    readerEl.innerHTML = ""

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: { width: 250, height: 250 },
        fps: 5,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      false
    )

    scannerRef.current = scanner

    scanner.render(
      (decodedText: string) => {
        if (!mountedRef.current) return
        setScanResult({ text: decodedText, timestamp: new Date() })
        setIsScanning(false)
        try {
          scanner.clear()
        } catch {
          // Scanner may already be cleared
        }
        scannerRef.current = null
      },
      (errorMessage: string) => {
        // QR code not found in frame - this is expected, not an error
        if (errorMessage?.includes("No MultiFormat Readers")) return
        if (errorMessage?.includes("NotFoundException")) return
      }
    )
  }, [])

  useEffect(() => {
    mountedRef.current = true
    startScanner()

    return () => {
      mountedRef.current = false
      if (scannerRef.current) {
        try {
          scannerRef.current.clear()
        } catch {
          // Ignore cleanup errors
        }
        scannerRef.current = null
      }
    }
  }, [startScanner])

  const handleScanAgain = () => {
    startScanner()
  }

  const isUrl = scanResult?.text
    ? /^https?:\/\//i.test(scanResult.text)
    : false

  const handleCopy = async () => {
    if (!scanResult) return
    try {
      await navigator.clipboard.writeText(scanResult.text)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {error && (
        <div className="w-full rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {scanResult ? (
        <div className="w-full rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 className="text-lg font-semibold text-[hsl(var(--card-foreground))]">
              Scan Successful
            </h2>
          </div>

          <div className="w-full rounded-lg bg-[hsl(var(--secondary))] p-4 break-all text-center">
            {isUrl ? (
              <a
                href={scanResult.text}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--primary))] hover:underline font-medium"
              >
                {scanResult.text}
              </a>
            ) : (
              <p className="text-[hsl(var(--card-foreground))]">
                {scanResult.text}
              </p>
            )}
          </div>

          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Scanned at {scanResult.timestamp.toLocaleTimeString()}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--secondary-foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
            >
              Copy
            </button>
            {isUrl && (
              <a
                href={scanResult.text}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-medium text-center text-[hsl(var(--secondary-foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
              >
                Open Link
              </a>
            )}
            <button
              onClick={handleScanAgain}
              className="flex-1 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:opacity-90"
            >
              Scan Again
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div
            id="reader"
            className="w-full rounded-xl overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
          />
          {isScanning && (
            <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-3">
              Point your camera at a QR code to scan it
            </p>
          )}
        </div>
      )}
    </div>
  )
}
