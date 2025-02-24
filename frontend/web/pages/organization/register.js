import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function RegisterOrganization() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leaderEmail: '',
    bankInfo: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      routingNumber: '',
      currency: 'USD'
    },
    customSettings: {
      theme: {
        primaryColor: '#1a73e8',
        secondaryColor: '#4285f4'
      }
    }
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/organizations/register', formData);
      router.push('/organization/pending?id=' + response.data.organization.id);
    } catch (err) {
      setError(err.response?.data?.error || 'Error registering organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register Your Organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join ArtistsAid and start supporting your artistic community
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="leaderEmail" className="block text-sm font-medium text-gray-700">
                Leader Email
              </label>
              <input
                id="leaderEmail"
                name="leaderEmail"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.leaderEmail}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bankInfo.accountName" className="block text-sm font-medium text-gray-700">
                    Account Name
                  </label>
                  <input
                    id="bankInfo.accountName"
                    name="bankInfo.accountName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.bankInfo.accountName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="bankInfo.accountNumber" className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    id="bankInfo.accountNumber"
                    name="bankInfo.accountNumber"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.bankInfo.accountNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Registering...' : 'Register Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
