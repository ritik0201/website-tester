import SpeedTester from "@/components/SpeedTester";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-black text-zinc-900 dark:text-zinc-50 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#e0e7ff_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] pointer-events-none" />
      
      <header className="relative z-10 py-6 px-8 border-b border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-md bg-white/30 dark:bg-black/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">SpeedInsights</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</a>
            <a href="#" className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-opacity">Login</a>
          </nav>
        </div>
      </header>

      <div className="relative z-10 px-6">
        <SpeedTester />
      </div>

      <footer className="relative z-10 py-12 border-t border-zinc-200 dark:border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-8 text-center text-zinc-500 dark:text-zinc-500 text-sm">
          <p>© 2026 SpeedInsights. Powered by Google PageSpeed API.</p>
        </div>
      </footer>
    </main>
  );
}
