// components/InstitutionEdit.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

export default function InstitutionEdit() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    established: '',
    location: '',
    category: '',
    facts: [{ label: '', value: '' }],
    featuredImage: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const institutionId = params.id;

  // Fetch institution data on mount
  useEffect(() => {
    setIsMounted(true);
    if (institutionId) {
      fetchInstitution();
    }
  }, [institutionId]);

  const fetchInstitution = async () => {
    try {
      const response = await fetch(`/api/institutions/${institutionId}`);
      if (!response.ok) throw new Error('Failed to fetch institution');
      const data = await response.json();
      console.log('Fetched institution:', data);

      // Set form data with fetched values
      setFormData({
        name: data.name || '',
        description: data.description || '',
        established: data.established || '',
        location: data.location || '',
        category: data.category || '',
        facts: data.facts.length > 0 ? data.facts : [{ label: '', value: '' }],
        featuredImage: data.featuredImage || '', // Base64 or data URL
      });

      // Set image preview if featuredImage exists
      if (data.featuredImage) {
        setImagePreview(data.featuredImage.startsWith('data:') ? data.featuredImage : `data:image/jpeg;base64,${data.featuredImage}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Remove prefix
        setFormData((prev) => ({
          ...prev,
          featuredImage: base64String,
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        featuredImage: '',
      }));
      setImagePreview(null);
    }
  };

  const handleFactChange = (index, field, value) => {
    const newFacts = [...formData.facts];
    newFacts[index][field] = value;
    setFormData((prev) => ({ ...prev, facts: newFacts }));
  };

  const addFact = () => {
    setFormData((prev) => ({
      ...prev,
      facts: [...prev.facts, { label: '', value: '' }],
    }));
  };

  const removeFact = (index) => {
    setFormData((prev) => ({
      ...prev,
      facts: prev.facts.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/institutions/${institutionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update institution');
      }

      setSuccess('Institution updated successfully!');
      setTimeout(() => router.push('/institutions'), 2000); // Redirect after 2s
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isMounted) {
    return <div>Loading...</div>; // Avoid hydration mismatch
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Institution</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Established Year</label>
          <input
            type="text"
            name="established"
            value={formData.established}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Facts</label>
          {formData.facts.map((fact, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Label"
                value={fact.label}
                onChange={(e) => handleFactChange(index, 'label', e.target.value)}
                className="w-1/2 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Value"
                value={fact.value}
                onChange={(e) => handleFactChange(index, 'value', e.target.value)}
                className="w-1/2 p-2 border rounded"
                required
              />
              {formData.facts.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFact(index)}
                  className="p-2 text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFact}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Add Fact
          </button>
        </div>

        <div>
          <label className="block mb-1">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2"
          />
          {isMounted && imagePreview && (
            <div className="mt-2">
              <Image
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto rounded"
                width={400}
                height={200}
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Update Institution
        </button>
      </form>
    </div>
  );
}