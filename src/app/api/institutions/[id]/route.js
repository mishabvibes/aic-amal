// app/api/institutions/[id]/route.js
import connectToDatabase from '../../../../lib/db'; // Adjust path
import Institution from '../../../../models/Institution'; // Adjust path
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
    }

    const institutionData = await request.json();

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
      institutionData.featuredImage = null; // Clear image if not provided
    }

    const updatedInstitution = await Institution.findByIdAndUpdate(
      id,
      institutionData,
      { new: true, runValidators: true } // Return updated doc, validate schema
    );

    if (!updatedInstitution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json(updatedInstitution, { status: 200 });
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { error: 'Error updating institution', details: error.message },
      { status: 500 }
    );
  }
}

// Add GET for fetching a single institution
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
    }

    const institution = await Institution.findById(id).lean();
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    // Convert Buffer to base64 for frontend
    if (institution.featuredImage) {
      const base64Image = institution.featuredImage.toString('base64');
      institution.featuredImage = `data:image/jpeg;base64,${base64Image}`; // Adjust MIME type as needed
    }

    return NextResponse.json(institution, { status: 200 });
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { error: 'Error fetching institution', details: error.message },
      { status: 500 }
    );
  }
}

// Add DELETE for completeness (see Step 3)
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
    }

    const deletedInstitution = await Institution.findByIdAndDelete(id);
    if (!deletedInstitution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Institution deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { error: 'Error deleting institution', details: error.message },
      { status: 500 }
    );
  }
}