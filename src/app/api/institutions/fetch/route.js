// app/api/institutions/fetch/route.js
import connectToDatabase from '../../../../lib/db'; // Adjust path as needed
import Institution from '../../../../models/Institution'; // Adjust path as needed
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    
    const institutions = await Institution.find({}).lean(); // .lean() for plain JS objects

    // Convert Buffer to Base64 for each institution
    const formattedInstitutions = institutions.map(institution => {
      let imageUrl = null;
      if (institution.featuredImage) {
        const base64Image = institution.featuredImage.toString('base64');
        imageUrl = `data:image/jpeg;base64,${base64Image}`; // Assuming JPEG, adjust if needed
      }
      return {
        ...institution,
        featuredImage: imageUrl, // Replace Buffer with data URL
      };
    });

    return NextResponse.json(formattedInstitutions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching institutions', details: error.message },
      { status: 500 }
    );
  }
}