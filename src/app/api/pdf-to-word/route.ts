
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

        const buffer = Buffer.from(await file.arrayBuffer());

        const externalFormData = new FormData();
        externalFormData.append('inputFile', new Blob([buffer]), file.name);

        const response = await fetch('https://api.cloudmersive.com/convert/pdf/to/docx', {
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

        const docxBuffer = await response.arrayBuffer();

        return new NextResponse(docxBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}.docx"`,
            },
        });

    } catch (error) {
        console.error('Conversion error:', error);
        return NextResponse.json({ error: 'Internal server error during conversion' }, { status: 500 });
    }
}
