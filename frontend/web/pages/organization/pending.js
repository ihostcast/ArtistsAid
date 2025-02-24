import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PendingOrganization() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registration Pending
          </h2>
          <div className="mt-8 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-center mb-4">
                <svg
                  className="h-12 w-12 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              
              <p className="text-center text-gray-700 mb-4">
                Your organization registration is pending approval. Our team will review your application and get back to you soon.
              </p>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Next Steps:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We will review your organization&apos;s details</li>
                  <li>Verify the provided information</li>
                  <li>Send you an email with the approval status</li>
                  <li>If approved, you&apos;ll receive access to your organization dashboard</li>
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Organization ID:</h3>
                <p className="text-gray-600 font-mono bg-gray-100 p-2 rounded">
                  {id}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please save this ID for future reference
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
