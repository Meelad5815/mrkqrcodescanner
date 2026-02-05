"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface ScanResult {
  text: string
  timestamp: Date
}

export default function QrScanner() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)
  const initRef = useRef(false)

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        // state 2 = scanning, state 3 = paused
        if (state === 2 || state === 3) {
          await scannerRef.current.stop()
        }
      } catch {
        // ignore
      }
      try {
        scannerRef.current.clear()
      } catch {
        // ignore
      }
      scannerRef.current = null
    }
  }, [])

  const startScanner = useCallback(async () => {
    if (!mountedRef.current) return

    await stopScanner()

    setScanResult(null)
    setError(null)
    setIsScanning(true)
    setCopied(false)

    try {
      const { Html5Qrcode } = await import("html5-qrcode")

      if (!mountedRef.current) return

      const readerId = "qr-reader"
      const el = document.getElementById(readerId)
      if (!el) {
        console.log("[v0] reader element not found")
        return
      }
      el.innerHTML = ""

      const scanner = new Html5Qrcode(readerId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          if (!mountedRef.current) return
          setScanResult({ text: decodedText, timestamp: new Date() })
          setIsScanning(false)
          scanner.stop().then(() => scanner.clear()).catch(() => {})
          scannerRef.current = null
        },
        () => {
          // frame without QR -- expected, not an error
        }
      )
    } catch (err: any) {
      if (!mountedRef.current) return
      console.log("[v0] scanner start error:", err)
      setIsScanning(false)

      if (err?.toString?.().includes("NotAllowedError")) {
        setError("Camera permission denied. Please allow camera access and try again.")
      } else if (err?.toString?.().includes("NotFoundError")) {
        setError("No camera found on this device.")
      } else {
        setError("Could not start the camera. Please try again or upload a QR image.")
      }
    }
  }, [stopScanner])

  useEffect(() => {
    mountedRef.current = true

    if (!initRef.current) {
      initRef.current = true
      startScanner()
    }

    return () => {
      mountedRef.current = false
      stopScanner()
    }
  }, [startScanner, stopScanner])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await stopScanner()
    setScanResult(null)
    setError(null)
    setIsScanning(false)

    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const readerId = "qr-reader"
      const el = document.getElementById(readerId)
      if (el) el.innerHTML = ""

      const scanner = new Html5Qrcode(readerId)
      const result = await scanner.scanFile(file, true)
      setScanResult({ text: result, timestamp: new Date() })
      scanner.clear()
    } catch {
      setError("No QR code found in that image. Please try another.")
    }

    // Reset file input
    e.target.value = ""
  }

  const handleScanAgain = () => {
    initRef.current = true
    startScanner()
  }

  const isUrl = scanResult?.text ? /^https?:\/\//i.test(scanResult.text) : false

  const handleCopy = async () => {
    if (!scanResult) return
    try {
      await navigator.clipboard.writeText(scanResult.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {error && (
        <div className="w-full rounded-xl border border-red-300 bg-red-50 p-4 text-center">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {scanResult ? (
        <div className="w-full rounded-xl bg-card border border-border p-6 flex flex-col items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2 text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 className="text-lg font-semibold text-card-foreground">
              Scan Successful
            </h2>
          </div>

          <div className="w-full rounded-lg bg-secondary p-4 break-all text-center">
            {isUrl ? (
              <a
                href={scanResult.text}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {scanResult.text}
              </a>
            ) : (
              <p className="text-card-foreground font-mono text-sm">
                {scanResult.text}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Scanned at {scanResult.timestamp.toLocaleTimeString()}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {isUrl && (
              <a
                href={scanResult.text}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-center text-secondary-foreground transition-colors hover:bg-muted"
              >
                Open Link
              </a>
            )}
            <button
              onClick={handleScanAgain}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
            >
              Scan Again
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          <div
            id="qr-reader"
            ref={containerRef}
            className="w-full rounded-xl overflow-hidden bg-card border border-border min-h-[300px]"
          />

          {isScanning && (
            <p className="text-center text-sm text-muted-foreground">
              Point your camera at a QR code to scan it
            </p>
          )}

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground">or</span>
            <label className="cursor-pointer rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted">
              Upload QR Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
