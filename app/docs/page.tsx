import Link from 'next/link';

export default function Documentation() {
  const sections = [
    {
      title: "Performance Score",
      description: "A summary of how fast your page loads and becomes interactive for users.",
      meaning: "This score is a weighted average of the Core Web Vitals metrics. It gives you a bird's-eye view of your site's speed performance.",
      howFound: "We use the Google Lighthouse engine to simulate a real user visiting your site and measure the timing of various rendering events.",
      howToFix: [
        "Enable text compression (Gzip/Brotli)",
        "Optimize and compress images",
        "Minify CSS and JavaScript",
        "Use a Content Delivery Network (CDN)"
      ],
      details: [
        "0-49 (Red): Poor performance - significant impact on user retention",
        "50-89 (Orange): Needs improvement - some bottlenecks detected",
        "90-100 (Green): Good performance - follows best practices"
      ]
    },
    {
      title: "Core Web Vitals",
      description: "Specific factors that Google considers critical for a great user experience.",
      metrics: [
        { 
          name: "First Contentful Paint (FCP)", 
          desc: "Time until the first text or image is rendered.",
          fix: "Reduce server response time and remove render-blocking scripts."
        },
        { 
          name: "Largest Contentful Paint (LCP)", 
          desc: "Time until the main content of the page is loaded.",
          fix: "Optimize your HERO image and prioritize its loading."
        },
        { 
          name: "Cumulative Layout Shift (CLS)", 
          desc: "Measures visual stability and unexpected movement.",
          fix: "Always include width and height attributes for images and video."
        },
        { 
          name: "Total Blocking Time (TBT)", 
          desc: "Measures how long the main thread was busy.",
          fix: "Reduce JavaScript execution time and split large bundles."
        }
      ],
      howFound: "Calculated using the Chrome DevTools protocol during a controlled page load.",
      howToFix: [
        "Preload critical assets",
        "Defer non-critical JavaScript",
        "Avoid large layout shifts by reserving space for ads/images"
      ]
    },
    {
      title: "Security Health",
      description: "Evaluates how well your website protects user data and prevents attacks.",
      meaning: "A combination of SSL strength and the presence of protective HTTP headers.",
      howFound: "We perform a real-time handshake with your server to check the SSL certificate and scan the response headers for security directives.",
      howToFix: [
        "Force HTTPS for all traffic",
        "Implement Content Security Policy (CSP) headers",
        "Add HSTS (Strict-Transport-Security) to prevent MITM attacks",
        "Set X-Frame-Options to 'DENY' or 'SAMEORIGIN' to prevent clickjacking"
      ],
      details: [
        "SSL Certificate (40%): Validates encryption and issuer trust.",
        "Security Headers (40%): Checks for CSP, HSTS, XSS Protection, etc.",
        "Grade Multiplier (20%): Overall reputation from DetectZeStack."
      ]
    },
    {
      title: "Accessibility",
      description: "How easy it is for everyone, including people with disabilities, to use your site.",
      meaning: "Ensures your site is usable with screen readers, keyboard-only navigation, and high-contrast modes.",
      howFound: "Scanning the DOM for ARIA attributes, color contrast ratios, and semantic HTML elements.",
      howToFix: [
        "Add alt text to all images",
        "Ensure high color contrast for text",
        "Use proper heading hierarchy (H1, H2, H3)",
        "Provide descriptive labels for form inputs"
      ]
    },
    {
      title: "Best Practices",
      description: "General web development standards for security and code quality.",
      meaning: "Checks if you're using modern web technologies and avoiding deprecated APIs.",
      howFound: "Monitoring console errors, checking HTTPS status, and verifying doctypes.",
      howToFix: [
        "Avoid using 'document.write()'",
        "Ensure all links are secure (HTTPS)",
        "Use modern image formats like WebP or AVIF"
      ]
    },
    {
      title: "SEO (Search Engine Optimization)",
      description: "How well search engines can understand and rank your content.",
      meaning: "Measures the presence of meta tags, crawlability, and mobile-friendliness.",
      howFound: "Checking for meta tags, robots.txt, and structured data in your HTML.",
      howToFix: [
        "Add a descriptive <title> and <meta name='description'>",
        "Ensure your page is mobile-friendly",
        "Use descriptive anchor text for links"
      ]
    },
    {
      title: "Technology Stack",
      description: "Identifies the frameworks, libraries, and tools used to build the website.",
      meaning: "Gives insight into the underlying technology, CMS, web server, and analytics tools.",
      howFound: "We use DetectZeStack to analyze the site's footprint, script tags, and server headers.",
      howToFix: [
        "Keep libraries updated to their latest versions",
        "Remove unused scripts and plugins",
        "Migrate from legacy frameworks to modern alternatives"
      ]
    },
    {
      title: "AI Recommendations",
      description: "Smart, context-aware advice generated specifically for your website.",
      meaning: "Tailored improvements based on your unique combination of performance and security results.",
      howFound: "We feed the raw metrics into Google Gemini 2.0 Flash, which acts as an expert web analyst.",
      howToFix: [
        "Review the top 3 tips provided in the results dashboard",
        "Focus on the 'High Impact' recommendations first",
        "Use the built-in ChatBot to ask follow-up questions about specific fixes"
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-black text-zinc-900 dark:text-zinc-50 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#e0e7ff_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      
      <header className="relative z-10 py-6 px-8 border-b border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl bg-white/30 dark:bg-black/30 sticky top-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tighter">Speed<span className="text-indigo-600">Insights</span></span>
          </Link>
          
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <Link href="/" className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tool
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 space-y-24">
        {/* Hero Section */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Knowledge Base
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] animate-in slide-in-from-bottom-8 duration-1000">
            Metrics & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Methodology</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-100">
            Deep dive into how we evaluate your website's performance, security, and accessibility standards.
          </p>
        </section>

        {/* Documentation Sections */}
        <div className="grid gap-16">
          {sections.map((section, i) => (
            <div key={i} className="group relative">
              {/* Card Decoration */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="relative space-y-10">
                {/* Section Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center text-indigo-500">
                      <span className="text-xl font-black">{i + 1}</span>
                    </div>
                    <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{section.title}</h2>
                  </div>
                  <p className="text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-tight px-1">
                    {section.description}
                  </p>
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-2 gap-8 px-1">
                  {/* Meaning & Findings */}
                  <div className="space-y-6">
                    <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-zinc-200/10 backdrop-blur-md space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[10px]">
                          <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          Definition
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                          {section.meaning}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3 text-amber-500 dark:text-amber-400 font-bold uppercase tracking-widest text-[10px]">
                          <div className="p-1.5 bg-amber-500/10 rounded-lg">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          Our Detection Logic
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {section.howFound}
                        </p>
                      </div>
                    </div>

                    {/* Tags for details */}
                    {section.details && (
                      <div className="flex flex-wrap gap-2">
                        {section.details.map((detail, j) => (
                          <div key={j} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800/40 rounded-2xl text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border border-zinc-200/50 dark:border-zinc-700/50">
                            {detail}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fixes & Metrics */}
                  <div className="space-y-6">
                    <div className="p-8 bg-emerald-500/5 dark:bg-emerald-500/[0.03] rounded-[2.5rem] border border-emerald-500/10 dark:border-emerald-500/10 space-y-6">
                      <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        Action Plan to Fix
                      </div>
                      <div className="grid gap-3">
                        {section.howToFix?.map((step, j) => (
                          <div key={j} className="flex items-start gap-4 p-4 bg-white dark:bg-black/20 rounded-2xl border border-emerald-500/5 dark:border-emerald-500/10 group/item transition-colors hover:border-emerald-500/20">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 text-xs font-black">
                              {j + 1}
                            </div>
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover/item:text-zinc-900 dark:group-hover/item:text-zinc-100 transition-colors">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {section.metrics && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {section.metrics.map((metric, j) => (
                          <div key={j} className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{metric.name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{metric.desc}</p>
                            {metric.fix && (
                              <div className="pt-2 flex items-start gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
                                <span className="mt-0.5">●</span>
                                <span>{metric.fix}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing Section */}
        <section className="relative p-12 bg-zinc-900 dark:bg-white rounded-[3.5rem] overflow-hidden text-center space-y-6">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
          <h2 className="relative z-10 text-4xl font-black text-white dark:text-black tracking-tight">Built on Industry Standards</h2>
          <p className="relative z-10 text-zinc-400 dark:text-zinc-500 max-w-2xl mx-auto leading-relaxed text-lg">
            Our analysis pipeline integrates directly with Google's Lighthouse 10.0 core, utilizing the Chrome DevTools protocol for maximum precision. Combined with Gemini AI, we provide context that standard tools miss.
          </p>
        </section>
      </div>

      <footer className="relative z-10 py-12 border-t border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 dark:text-zinc-500 text-sm font-medium">
          <p>© 2026 SpeedInsights Engine. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              API Status: Operational
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
