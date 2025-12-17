
# StackPDF – Your Personal PDF Swiss Army Knife 🛠️

**StackPDF** is a secure, private, and powerful PDF toolkit that runs primarily in your browser. It combines the speed of local processing with the power of cloud APIs for advanced conversions.

![StackPDF Dashboard](https://github.com/goldestdev/stackpdf/assets/placeholder/dashboard.png)

## ✨ Features

### 🔒 100% Local & Private (Client-Side)
These tools run entirely in your browser. Your files never leave your device.
- **Merge PDF**: Combine multiple files.
- **Split PDF**: Extract pages or split into individual files.
- **Organize PDF**: Reorder, rotate, or delete pages.
- **Images to PDF**: Convert JPG, PNG, GIF to PDF.
- **PDF to Images**: Extract pages as high-quality images.
- **OCR (PDF to Text)**: Extract text from scanned PDFs.
- **Protect/Unlock**: Add or remove password encryption.
- **Watermark**: Add custom text stamps.
- **Form Flattening**: Lock interactive forms.
- **Sign PDF**: Add your signature.

### ☁️ Advanced Conversions (API Powered)
These tools use the [Cloudmersive API](https://cloudmersive.com) for high-fidelity conversion.
- **PDF to Word (.docx)**: Editable Word documents.
- **PDF to Excel (.xlsx)**: Extract tables to spreadsheets.
- **PDF to PowerPoint (.pptx)**: Convert slides.
- **Office to PDF**: Convert Word, Excel, and PPT back to PDF.

> **Note**: API uploads are limited to **3.5MB** (Free Tier Limit).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Cloudmersive API Key](https://cloudmersive.com) (Free)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/goldestdev/stackpdf.git
    cd stackpdf
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env.local` file in the root directory:
    ```env
    CLOUDMERSIVE_API_KEY=your_api_key_here
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

---

## 🌐 Deploying to Vercel

This project is optimized for deployment on [Vercel](https://vercel.com).

1.  **Push to GitHub**: Make sure your code is on GitHub.
2.  **Import Project**: Go to Vercel Dashboard -> "Add New..." -> "Project" -> Select your repo.
3.  **Environment Variables**:
    - In the "Environment Variables" section, add:
      - Key: `CLOUDMERSIVE_API_KEY`
      - Value: `your_api_key_from_cloudmersive`
4.  **Deploy**: Click **Deploy**.

That's it! Your personal PDF toolbox is now live. 🚀

## 🛠️ Built With
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **pdf-lib** & **pdf.js** (PDF manipulation)
- **Cloudmersive SDK** (Advanced conversions)
- **Lucide React** (Icons)

## 📄 License
MIT License. Feel free to use and modify for personal or commercial use.
