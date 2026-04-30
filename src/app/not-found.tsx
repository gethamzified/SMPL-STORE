import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-8xl md:text-9xl text-foreground mb-4">
          404
        </h1>
        <p className="font-body text-lg md:text-xl text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-outline inline-block">
          Return Home
        </Link>
      </div>
    </main>
  );
}
