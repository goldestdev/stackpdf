# StackPDF 📄

**StackPDF** is a powerful, privacy-first, and fully offline-capable PDF toolkit. It's designed to be your personal "Swiss Army Knife" for documents, requiring no subscriptions, no file uploads to third-party servers (except for specific Office conversions), and no data tracking.

![StackPDF Banner](/public/icon-512.png)

## 🚀 Key Features

### 🛠️ Core Tools (100% Local)
*   **Merge PDF**: Combine multiple PDFs into a single file.
*   **Split PDF**: Extract specific pages or split by range.
*   **Organize**: Drag-and-drop page reordering, rotation, and deletion using a visual interface.
*   **Images to PDF**: Convert JPG/PNGs into a PDF document.
*   **PDF to Images**: Extract pages as high-quality images.
*   **Compress**: Reduce file size while maintaining quality.
*   **Sign**: Draw your signature and place it anywhere on the document.
*   **Watermark**: Add text watermarks with custom positioning and opacity.
*   **Protect**: Encrypt your PDF with a password.
*   **Flatten**: Lock forms and annotations to prevent further editing.
*   **Metadata**: Edit Title, Author, Subject, and Keywords.
*   **Markdown to PDF**: Convert markdown text directly to PDF.
*   **OCR**: Extract text from scanned PDFs (using Tesseract.js).

### ☁️ Advanced Conversions (Powered by Cloudmersive)
*   **Office to PDF**: Convert Word, Excel, and PowerPoint files to PDF.
*   **PDF to Office**: Convert PDFs back to editable Word, Excel, and PowerPoint formats.

### 🌟 Pro Features
*   **PWA Support**: Install as a native app on your desktop or mobile. Fully works offline.
*   **Local History**: Auto-saves your recent files to your browser's database (IndexedDB). Never lose your work.
*   **Dark Mode**: Sleek, modern, and eye-friendly interface.
*   **Privacy First**: All core processing happens right in your browser.

---

## 🛠️ Technology Stack

*   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
*   **Styling**: Vanilla CSS (CSS Modules & Variables)
*   **PDF Processing**: `pdf-lib`, `pdfjs-dist`
*   **Drag & Drop**: `@dnd-kit/core`, `react-dropzone`
*   **Storage**: `idb` (IndexedDB wrapper)
*   **Testing**: Playwright
*   **Icons**: `lucide-react`

---

## 🏁 Getting Started

### Prerequisites
*   Node.js 18+ installed.
*   A Cloudmersive API Key (free tier available) for Office conversions.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/goldestdev/stackpdf.git
    cd stackpdf
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory:
    ```env
    CLOUDMERSIVE_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

We use **Playwright** for End-to-End (E2E) testing.

1.  **Run all tests:**
    ```bash
    npx playwright test
    ```

2.  **Run UI Mode (Interactive):**
    ```bash
    npx playwright test --ui
    ```

3.  **View Report:**
    ```bash
    npx playwright show-report
    ```

---

## 📦 Deployment

### Vercel (Recommended)
1.  Push your code to GitHub.
2.  Import the project into Vercel.
3.  Add the `CLOUDMERSIVE_API_KEY` to the Environment Variables.
4.  Deploy!

### Docker (Optional)
(Dockerfile coming soon)

---

## 📜 License

MIT License. Free to use and modify.

---

built with ❤️ by goldestdev
