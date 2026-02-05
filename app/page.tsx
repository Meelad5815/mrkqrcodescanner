import QrScanner from "@/components/qr-scanner"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
          </svg>
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] text-balance">
            MRK QR Code Scanner
          </h1>
        </div>
        <p className="text-[hsl(var(--muted-foreground))] max-w-md text-pretty">
          Scan any QR code instantly using your device camera or by uploading an
          image file.
        </p>
      </header>

      <QrScanner />

      <footer className="mt-auto pt-8 text-center">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Your camera feed stays on your device and is never sent to any server.
        </p>
      </footer>
    </main>
  )
}
