import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Frame from '@/models/Frame';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Assuming these are the shapes of your data based on usage
interface Dimensions {
    width: number;
    height: number;
}

interface PlacementCoords {
    x: number;
    y: number;
}

interface TextSettings {
    fontSize: number;
    color: string;
    // Add other properties as needed
}

interface UpdateData {
    name: string;
    imageUrl: string;
    dimensions: Dimensions;
    placementCoords: PlacementCoords;
    textSettings: TextSettings;
    isActive: boolean;
    usageCount?: number;
}

const getFilenameFromUrl = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/');
        return pathParts[pathParts.length - 1];
    } catch (error) {
        console.error('Error extracting filename from URL:', error);
        return null;
    }
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const frame = await Frame.findById(params.id);

        if (!frame) {
            return NextResponse.json({
                success: false,
                message: 'Frame not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: frame,
            message: 'Frame fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching frame:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch frame',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const existingFrame = await Frame.findById(params.id);

        if (!existingFrame) {
            return NextResponse.json({
                success: false,
                message: 'Frame not found'
            }, { status: 404 });
        }

        // Check if this is a JSON request or form data
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('multipart/form-data')) {
            // Handle form data update (for full frame updates)
            const formData = await request.formData();
            const frameImage = formData.get('frameImage') as File | null;
            const name = formData.get('name') as string;
            const dimensions = JSON.parse(formData.get('dimensions') as string) as Dimensions;
            const placementCoords = JSON.parse(formData.get('placementCoords') as string) as PlacementCoords;
            const textSettings = JSON.parse(formData.get('textSettings') as string) as TextSettings;
            const currentImageUrl = formData.get('currentImageUrl') as string;
            const isActive = formData.get('isActive') === 'true';
            const incrementUsage = formData.get('incrementUsage') === 'true';

            if (!name) {
                return NextResponse.json({
                    success: false,
                    message: 'Frame name is required'
                }, { status: 400 });
            }

            let imageUrl = currentImageUrl;

            if (frameImage) {
                try {
                    const fileExt = frameImage.name.split('.').pop();
                    const fileName = `${uuidv4()}.${fileExt}`;
                    const filePath = `frames/${fileName}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('frames')
                        .upload(filePath, frameImage, {
                            cacheControl: '3600',
                            upsert: false,
                            contentType: frameImage.type
                        });

                    if (uploadError) {
                        throw new Error(uploadError.message);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('frames')
                        .getPublicUrl(filePath);

                    imageUrl = publicUrl;
                    
                    if (currentImageUrl) {
                        const fileName = getFilenameFromUrl(currentImageUrl);
                        if (fileName) {
                            const { error: deleteError } = await supabase.storage
                                .from('frames')
                                .remove([`frames/${fileName}`]);
                            if (deleteError) {
                                console.error('Error deleting old file:', deleteError);
                            }
                        }
                    }
                } catch (uploadError) {
                    console.error('Error updating file:', uploadError);
                    return NextResponse.json({
                        success: false,
                        message: 'Failed to update image',
                        error: uploadError instanceof Error ? uploadError.message : 'Unknown error'
                    }, { status: 500 });
                }
            }

            const updateData: UpdateData = {
                name,
                imageUrl,
                dimensions,
                placementCoords,
                textSettings,
                isActive: isActive !== undefined ? isActive : existingFrame.isActive
            };

            if (incrementUsage) {
                updateData.usageCount = (existingFrame.usageCount || 0) + 1;
            }

            const updatedFrame = await Frame.findByIdAndUpdate(
                params.id,
                updateData,
                { new: true }
            );

            return NextResponse.json({
                success: true,
                data: updatedFrame,
                message: 'Frame updated successfully'
            });
        } else {
            // Handle JSON request (for usage increment)
            const body = await request.json();
            const { incrementUsage } = body;

            if (incrementUsage) {
                const updatedFrame = await Frame.findByIdAndUpdate(
                    params.id,
                    { $inc: { usageCount: 1 } },
                    { new: true }
                );

                return NextResponse.json({
                    success: true,
                    data: updatedFrame,
                    message: 'Frame usage incremented successfully'
                });
            }

            return NextResponse.json({
                success: false,
                message: 'No valid update operation specified'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error updating frame:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update frame',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const frame = await Frame.findById(params.id);

        if (!frame) {
            return NextResponse.json({
                success: false,
                message: 'Frame not found'
            }, { status: 404 });
        }

        if (frame.imageUrl) {
            try {
                const fileName = getFilenameFromUrl(frame.imageUrl);
                if (fileName) {
                    const { error: deleteError } = await supabase.storage
                        .from('frames')
                        .remove([`frames/${fileName}`]);
                    if (deleteError) {
                        console.error('Error deleting file:', deleteError);
                    }
                }
            } catch (deleteError) {
                console.error('Error processing file deletion:', deleteError);
            }
        }
        await Frame.findByIdAndDelete(params.id);

        return NextResponse.json({
            success: true,
            message: 'Frame deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting frame:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete frame',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}