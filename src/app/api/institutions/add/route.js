// app/api/institutions/route.js
import connectToDatabase from '../../../../lib/db'; // Adjust path as needed
import Institution from '../../../../models/Institution'; // Adjust path as needed
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const institutionData = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'description', 'established', 'location', 'category'];
    for (const field of requiredFields) {
      if (!institutionData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Convert Base64 image to Buffer if provided
    if (institutionData.featuredImage) {
      institutionData.featuredImage = Buffer.from(institutionData.featuredImage, 'base64');
    } else {
      institutionData.featuredImage = null; // Ensure it matches schema default
    }

    const institution = new Institution(institutionData);
    const savedInstitution = await institution.save();

    return NextResponse.json(savedInstitution, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating institution', details: error.message },
      { status: 500 }
    );
  }
}