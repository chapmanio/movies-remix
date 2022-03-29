import { Link } from 'remix';

export default function HomeHeader() {
  // Render
  return (
    <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">Remix</h2>
        <Link
          to="/"
          className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl"
        >
          Movies
        </Link>
      </div>
    </div>
  );
}
