
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const apiKey = process.env.CLOUDMERSIVE_API_KEY;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!apiKey) {
            console.error('CLOUDMERSIVE_API_KEY is missing');
            return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
        }

        // Cloudmersive Free Plan limit: 3.5MB
        const MAX_SIZE = 3.5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File exceeds 3.5MB limit' }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const externalFormData = new FormData();
        externalFormData.append('inputFile', new Blob([buffer]), file.name);

        const response = await fetch('https://api.cloudmersive.com/convert/pdf/to/pptx', {
            method: 'POST',
            headers: {
                'Apikey': apiKey,
            },
            body: externalFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cloudmersive API Error:', response.status, errorText);
            return NextResponse.json({ error: `Cloudmersive API failed: ${response.statusText}` }, { status: response.status });
        }

        const pptxBuffer = await response.arrayBuffer();

        return new NextResponse(pptxBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}.pptx"`,
            },
        });

    } catch (error) {
        console.error('Conversion error:', error);
        return NextResponse.json({ error: 'Internal server error during conversion' }, { status: 500 });
    }
}
