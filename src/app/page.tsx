import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Search App</h1>
      <Link href="/search" className="text-blue-500 hover:underline">
        Go to Search Page
      </Link>
    </main>
  )
}