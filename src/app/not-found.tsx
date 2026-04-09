import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold mb-4">Not Found</h2>
      <p className="text-lg mb-4">Could not find the requested resource</p>
      <Link href="/" className="btn btn-primary">
        Return Home
      </Link>
    </div>
  )
}