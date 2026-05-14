import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

// Simple in-memory cache for shared data
const analysisCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function POST(req: Request) {
  try {
    const { url, strategy = 'mobile' } = await req.json();
    const apiKey = process.env.PAGESPEED_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: 'PageSpeed API key missing' }, { status: 500 });

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const cacheKey = `${normalizedUrl}_shared`;
    const cached = analysisCache.get(cacheKey);

    // Initial tech stack and security objects
    let techStack = { technologies: [], ssl: { valid: false }, headers: {} };
    let urlSecurity = { grade: 'N/A', warnings: [] };
    let securityDetails: any = { organization: 'Unknown', score: 0, hasForms: false, hasCaptcha: false };
    let insights = '';

    // START TURBO PARALLEL TASKS: Tech Stack + Gemini + PageSpeed
    console.log(`[PageSpeed] Starting Turbo Analysis for ${url}...`);
    
    const techPromise = (async () => {
      try {
        const detectRes = await fetch(`https://detectzestack.com/api/v1/analyze?url=${encodeURIComponent(normalizedUrl)}`, {
          headers: { 'x-api-key': process.env.DETECTZESTACK_API_KEY || '' }
        });
        if (detectRes.ok) return await detectRes.json();
      } catch (e) { console.warn('[DetectZeStack] Failed:', e); }
      return null;
    })();

    const geminiPromise = (async () => {
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) return cached.data;
      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const modelNames = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-1.5-flash"];
        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `Act as a web analyst. Analyze ${normalizedUrl}. Provide 1 line for ORGANIZATION: name and 3 ultra-short speed TIPS: (separated by semicolons). Max 4 lines total. No bolding.`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) {
              const getSection = (key: string) => {
                const parts = text.split(new RegExp(`${key}:`, 'i'));
                return parts.length > 1 ? parts[1].split(/\n/)[0].trim() : '';
              };
              const orgName = getSection('ORGANIZATION');
              const rawTips = getSection('TIPS');
              const formattedTips = rawTips.split(';').map((t, i) => `${i + 1}. ${t.trim()}`).join('\n');
              return { insights: `Organization: ${orgName}\n${formattedTips}`, orgName };
            }
          } catch (e) { continue; }
        }
      }
      return { insights: '', orgName: 'Unknown' };
    })();

    const lighthousePromise = runLighthouse(normalizedUrl, strategy, apiKey);

    // Wait for ALL tasks in parallel
    const [detectData, aiResult, lighthouseResult] = await Promise.all([techPromise, geminiPromise, lighthousePromise]);

    // Process Tech Stack
    if (detectData) {
      techStack = detectData.techStack || techStack;
      urlSecurity = detectData.security || urlSecurity;
    }

    insights = aiResult.insights || '';
    securityDetails.organization = aiResult.orgName || 'Unknown';

    // Cache the AI results
    analysisCache.set(cacheKey, {
      timestamp: Date.now(),
      data: { techStack, urlSecurity, securityDetails, insights }
    });

    if (!lighthouseResult) {
      return NextResponse.json({
        url: normalizedUrl,
        strategy,
        scores: { performance: null, accessibility: null, bestPractices: null, seo: null },
        metrics: {
          firstContentfulPaint: "N/A",
          speedIndex: "N/A",
          largestContentfulPaint: "N/A",
          interactive: "N/A",
          totalBlockingTime: "N/A",
          cumulativeLayoutShift: "N/A",
        },
        insights: insights || "PageSpeed analysis was blocked, but AI and Tech analysis completed.",
        security: securityDetails,
        techStack,
        urlSecurity,
        screenshot: null,
      });
    }

    const data = lighthouseResult.lighthouseResult;
    const scores = data.categories;

    return NextResponse.json({
      url: normalizedUrl,
      strategy,
      scores: {
        performance: scores.performance?.score ? Math.round(scores.performance.score * 100) : 0,
        accessibility: scores.accessibility?.score ? Math.round(scores.accessibility.score * 100) : 0,
        bestPractices: scores['best-practices']?.score ? Math.round(scores['best-practices'].score * 100) : 0,
        seo: scores.seo?.score ? Math.round(scores.seo.score * 100) : 0,
      },
      metrics: {
        firstContentfulPaint: data.audits['first-contentful-paint']?.displayValue || "N/A",
        speedIndex: data.audits['speed-index']?.displayValue || "N/A",
        largestContentfulPaint: data.audits['largest-contentful-paint']?.displayValue || "N/A",
        interactive: data.audits['interactive']?.displayValue || "N/A",
        totalBlockingTime: data.audits['total-blocking-time']?.displayValue || "N/A",
        cumulativeLayoutShift: data.audits['cumulative-layout-shift']?.displayValue || "N/A",
      },
      insights,
      security: securityDetails,
      techStack,
      urlSecurity,
      screenshot: data.audits['final-screenshot']?.details?.data || null,
    });

  } catch (error: any) {
    console.error('[PageSpeed] Fatal Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function runLighthouse(url: string, strategy: string, key: string) {
  try {
    const fastCategories = ['performance', 'accessibility', 'seo'];
    const fetchWithTimeout = async (cats: string[]) => {
      const params = new URLSearchParams({ url, strategy, key });
      cats.forEach(c => params.append('category', c));
      const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`);
      if (res.ok) return await res.json();
      return null;
    };

    // Stage 1: Fast Audit (Performance, Accessibility, SEO)
    let data = await fetchWithTimeout(fastCategories);
    
    // Stage 2: Performance Only if Stage 1 failed
    if (!data) {
      console.warn(`[PageSpeed] Fast audit failed for ${url}. Retrying performance only...`);
      data = await fetchWithTimeout(['performance']);
    }

    return data;
  } catch (e) {
    return null;
  }
}
