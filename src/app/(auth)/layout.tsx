import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-4 sm:px-6 h-14 flex items-center border-b border-slate-200 bg-white">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="ChambaLatinApp" className="h-8 w-auto" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
