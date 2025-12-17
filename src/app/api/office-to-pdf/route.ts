
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
            return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
        }

        // Cloudmersive Free Plan limit: 3.5MB
        const MAX_SIZE = 3.5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'File exceeds 3.5MB limit' }, { status: 413 });
        }

        // Determine endpoint based on file type
        let endpoint = '';
        const name = file.name.toLowerCase();

        if (name.endsWith('.docx') || name.endsWith('.doc')) {
            endpoint = 'https://api.cloudmersive.com/convert/docx/to/pdf';
            // Note: For legacy .doc, Cloudmersive has a different endpoint usually, 
            // but let's assume .docx for now or check docs. 
            // Actually, convert/doc/to/pdf exists for legacy doc.
            // Let's stick to standard modern formats for safety or generic "autodetect"?
            // Cloudmersive has 'convert/autodetect/to/pdf' but it might be strictly for some formats.
            // Let's be explicit and strictly support modern formats for MVP stability.
            if (name.endsWith('.doc')) endpoint = 'https://api.cloudmersive.com/convert/doc/to/pdf';
        } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
            endpoint = 'https://api.cloudmersive.com/convert/xlsx/to/pdf';
            if (name.endsWith('.xls')) endpoint = 'https://api.cloudmersive.com/convert/xls/to/pdf';
        } else if (name.endsWith('.pptx') || name.endsWith('.ppt')) {
            endpoint = 'https://api.cloudmersive.com/convert/pptx/to/pdf';
            if (name.endsWith('.ppt')) endpoint = 'https://api.cloudmersive.com/convert/ppt/to/pdf';
        } else {
            return NextResponse.json({ error: 'Unsupported file format. Please use Word, Excel, or PowerPoint files.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const externalFormData = new FormData();
        externalFormData.append('inputFile', new Blob([buffer]), file.name);

        const response = await fetch(endpoint, {
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

        const pdfBuffer = await response.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^/.]+$/, "")}.pdf"`,
            },
        });

    } catch (error) {
        console.error('Conversion error:', error);
        return NextResponse.json({ error: 'Internal server error during conversion' }, { status: 500 });
    }
}
