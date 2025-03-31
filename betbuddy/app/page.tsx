import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          <span className="block text-primary">BetBuddy</span>
          <span className="block text-2xl sm:text-3xl mt-2">Your AI Sports Betting Analyst</span>
        </h1>
        
        <p className="mt-6 text-lg text-muted-foreground">
          Upload your parlay slips and get instant AI-powered analysis on each leg of your bet.
          Our advanced AI will provide insights, confidence ratings, and help you make more informed betting decisions.
        </p>
        
        <div className="mt-10">
          <Link 
            href="/analyze" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Analyze Your Bet
          </Link>
        </div>
        
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
            </div>
            <h3 className="text-xl font-medium">Upload Slip</h3>
            <p className="mt-2 text-muted-foreground text-center">
              Simply upload a photo of your parlay slip
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <h3 className="text-xl font-medium">AI Analysis</h3>
            <p className="mt-2 text-muted-foreground text-center">
              Our AI analyzes each leg of your parlay
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <h3 className="text-xl font-medium">Get Insights</h3>
            <p className="mt-2 text-muted-foreground text-center">
              Receive detailed insights and confidence ratings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 