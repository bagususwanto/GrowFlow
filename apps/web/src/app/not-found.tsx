import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/40 p-8 shadow-2xl backdrop-blur-xl">
        {/* Glow Visual Asset */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-4xl font-extrabold tracking-tight">404</span>
        </div>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-foreground">
          Halaman Tidak Ditemukan
        </h1>
        
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau alamat URL yang dimasukkan salah.
        </p>

        <div className="mt-8">
          <Link
            href="/dashboard"
            className="block w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-98"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
