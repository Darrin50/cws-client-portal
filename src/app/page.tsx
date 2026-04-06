import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
};

export default function Home(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Caliber Web Studio Portal</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Client portal coming soon
        </p>
      </div>
    </main>
  );
}
