// src/components/InstituteList.tsx
"use client";

import { useState } from "react";
import InstituteCard from "./InstituteCard";
import { motion } from "framer-motion";

// Define Institute type
export interface Institute {
  _id: string;
  id: string;
  name: string;
  description: string;
  featuredImage: string;
  facts: { label: string; value: string }[];
  established: string;
  location: string;
  category: string;
}

interface InstituteListProps {
  institutes: Institute[];
}

const InstituteList = ({ institutes }: InstituteListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  console.log(institutes);
  
  
  // Get unique categories from institutes
  const categories = ["all", ...Array.from(new Set(institutes.map(inst => inst.category)))];
  
  // Filter institutes based on search and category
  const filteredInstitutes = institutes.filter(institute => {
    const matchesSearch = institute.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           institute.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           institute.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || institute.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search input */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Search institutes..."
              className="w-full p-3 pl-10 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 text-indigo-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Category filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                {/* {category.charAt(0).toUpperCase() + category.slice(1)} */}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {filteredInstitutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutes.map((institute,index) => (
            <InstituteCard
              key={index}
              id={institute._id}
              name={institute.name}
              description={institute.description}
              imageSrc={institute.featuredImage}
              facts={institute.facts}
              established={institute.established}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-8 rounded-xl shadow text-center"
        >
          <svg className="w-16 h-16 text-indigo-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Institutes Found</h3>
          <p className="text-gray-500 mb-4">
            We couldn&apos;t find any institutes matching your search criteria.
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="text-indigo-600 font-medium hover:text-indigo-800"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default InstituteList;