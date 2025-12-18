const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createDummyPdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Test PDF content');

    const pdfBytes = await pdfDoc.save();

    const dir = path.join(__dirname, 'tests/fixtures');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(path.join(dir, 'test.pdf'), pdfBytes);
    console.log('Dummy PDF created at tests/fixtures/test.pdf');
}

createDummyPdf();
