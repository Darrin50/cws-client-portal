import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2.5 mb-10">
        <Image
          src="/logo.png"
          alt="CWS"
          width={32}
          height={32}
          className="object-contain"
          unoptimized
        />
        <span className="text-white font-semibold text-lg">Caliber Web Studio</span>
      </div>

      <div className="text-8xl font-black text-white/10 select-none mb-4">404</div>

      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-slate-400 text-sm max-w-xs mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to your portal.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm px-6 py-2.5 transition-colors"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 text-slate-300 hover:text-white hover:border-white/30 font-medium text-sm px-6 py-2.5 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
