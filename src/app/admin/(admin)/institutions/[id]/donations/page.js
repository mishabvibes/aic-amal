// app/institutions/[id]/donations/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function InstitutionDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const institutionId = params.id;

  useEffect(() => {
    if (institutionId) {
      fetchDonations();
    }
  }, [institutionId]);

  const fetchDonations = async () => {
    try {
      const response = await fetch(`/api/institutions/${institutionId}/donations`);
      if (!response.ok) {
        throw new Error(`Failed to fetch donations: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched donations:', data);

      // Handle case where no donations are found
      if (data.message) {
        setDonations([]);
      } else {
        setDonations(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading donations...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Donations for Institution (ID: {institutionId})
      </h1>
      <Link href="/institutions" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to Institutions
      </Link>
      {donations.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No donations found for this institution.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div
              key={donation._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {donation.name || 'Anonymous Donor'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Amount:</strong> ₹{donation.amount}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Type:</strong> {donation.type}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Date:</strong> {new Date(donation.createdAt).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Status:</strong> {donation.status}
              </p>
              {donation.email && (
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Email:</strong> {donation.email}
                </p>
              )}
              {donation.phone && (
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Phone:</strong> {donation.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}