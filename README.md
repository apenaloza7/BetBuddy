# BetBuddy - Sports Betting Analyst

BetBuddy is a web application that analyzes sports betting parlay slips using AI. Users can upload photos of their parlay slips, and the application will provide detailed analysis and confidence ratings for each leg of the bet.

## Features

- Upload parlay slip images
- AI-powered analysis of each bet leg
- Confidence ratings for individual legs and overall parlay
- Detailed insights and recommendations
- Mobile-friendly responsive design

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **AI Integration**: Claude API (Anthropic)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Anthropic API key (for Claude)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/betbuddy.git
   cd betbuddy
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development

### Project Structure

```
betbuddy/
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── analyze/          # Analysis pages
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/               # UI components
│   └── upload-form.tsx   # Upload form component
├── lib/                  # Utility functions
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

### Local Development

The application is designed to work in local development mode without requiring actual API calls to Claude. Mock data is provided for testing purposes.

To test the full functionality with the Claude API:

1. Ensure you have a valid Anthropic API key in your `.env.local` file
2. Uncomment the Claude API integration code in `app/api/analyze/route.ts`
3. Restart the development server

## Deployment

The application is configured for easy deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add your `ANTHROPIC_API_KEY` as an environment variable in the Vercel project settings
4. Deploy

## License

[MIT](LICENSE)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Anthropic Claude](https://www.anthropic.com/)
