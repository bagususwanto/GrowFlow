import Link from 'next/link';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="space-y-6 py-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-4xl font-extrabold tracking-tight">404</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Maaf, halaman yang Anda cari tidak tersedia, telah dipindahkan, atau alamat URL yang
              dimasukkan salah.
            </p>
          </div>

          <Button className="w-full" nativeButton={false} render={<Link href="/dashboard" />}>
            Kembali ke Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
