'use client';

import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <span className="text-2xl font-bold bg-blue-600 text-white px-3 py-1 rounded-lg">
        A
      </span>
      <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
        ArtistsAid
      </span>
    </Link>
  );
}
