# LeafletAI

A dynamic 3D flipbook viewer for InDesign/Illustrator exports with Gemini AI integration.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your API key:
   ```
   API_KEY=your_google_gemini_api_key
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is configured for deployment on Vercel.

1. Push to GitHub.
2. Import project in Vercel.
3. Add `API_KEY` in Vercel Project Settings > Environment Variables.
4. Deploy.
