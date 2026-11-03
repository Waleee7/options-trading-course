import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="label">404</p>
      <h1 className="display mt-3 text-6xl">Nothing here.</h1>
      <p className="mt-4 text-xl">That page does not exist. The course does.</p>
      <Link href="/" className="btn mt-8">Back to the syllabus →</Link>
    </div>
  );
}
