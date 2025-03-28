// components/InstitutionList.js
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Edit, Trash2 } from 'lucide-react';

export default function InstitutionList() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await fetch('/api/institutions/fetch');
      if (!response.ok) throw new Error('Failed to fetch institutions');
      const data = await response.json();
      console.log('Fetched institutions:', data);
      setInstitutions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this institution?')) return;
    try {
      const response = await fetch(`/api/institutions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete institution');
      setInstitutions(institutions.filter((inst) => inst._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading institutions...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Institutions</h1>
      <div className="grid grid-cols-1 text-black md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map((institution) => {
          const institutionId = institution._doc?._id || institution._id; // Ensure ID is valid
          console.log(`Institution ID for ${institution._doc?.name || 'Unnamed'}:`, institutionId); // Debug ID

          return (
            <div
              key={institutionId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              {institution.featuredImage ? (
                <Image
                  src={institution.featuredImage}
                  alt={institution._doc?.name || 'Unnamed Institution'}
                  width={300}
                  height={150}
                  className="w-full h-32 object-cover rounded-md mb-4"
                  onError={() => console.error(`Failed to load image for ${institution.name}`)}
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">No Image</span>
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {institution.name || 'Unnamed Institution'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                {institution.description || 'No description'}
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/institutions/${institutionId}/donations`}
                  className="p-2 text-blue-500 hover:text-blue-700"
                  title="View Donations"
                  onClick={() => console.log(`Navigating to donations for ID: ${institutionId}`)} // Debug click
                >
                  <Eye className="h-5 w-5" />
                </Link>
                <Link href={`/admin/institutions/edit/${institutionId}`} className="p-2 text-green-500 hover:text-green-700">
                  <Edit className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDelete(institutionId)}
                  className="p-2 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}