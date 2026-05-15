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
    let urlSecurity = { grade: 'N/A', warnings: [] as string[], headers: [] as string[], ssl: null as any };
    let securityDetails: any = { organization: 'Unknown', score: 0, hasForms: false, hasCaptcha: false };
    let insights = '';

    // START TURBO PARALLEL TASKS: Tech Stack + Gemini + PageSpeed + Local Security
    console.log(`[PageSpeed] Starting Turbo Analysis for ${url}...`);
    
    const localSecurityPromise = analyzeSecurityLocally(normalizedUrl);

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
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return { 
          insights: cached.data.insights, 
          orgName: cached.data.securityDetails?.organization || 'Unknown' 
        };
      }
      if (geminiKey) {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const modelNames = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-1.5-flash"];
        for (const modelName of modelNames) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `Act as a web analyst. Analyze the website: ${normalizedUrl}. 
            Output format:
            ORGANIZATION: [Exact Legal Name of the company or 'Unknown']
            TIPS: [3 short performance tips separated by semicolons]`;
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) {
              const getSection = (key: string) => {
                const regex = new RegExp(`${key}:\\s*(.*)`, 'i');
                const match = text.match(regex);
                return match ? match[1].split('\n')[0].trim() : '';
              };
              let orgName = getSection('ORGANIZATION');
              
              // Fallback: If orgName is still empty, try to extract from the first line if it looks like a name
              if (!orgName && text.length > 0) {
                const firstLine = text.split('\n')[0];
                if (firstLine.toUpperCase().includes('ORGANIZATION')) {
                   orgName = firstLine.split(':')[1]?.trim() || '';
                }
              }

              // Final cleaning: remove quotes or periods at the end
              orgName = orgName.replace(/["'.]$/g, '').trim();

              const rawTips = getSection('TIPS');
              const formattedTips = rawTips.split(';').map((t, i) => `${i + 1}. ${t.trim()}`).join('\n');
              return { insights: `Organization: ${orgName}\n${formattedTips}`, orgName };
            }
          } catch (e) { continue; }
        }
      }

      // Final Fallback if AI failed or returned Unknown
      let finalOrgName = 'Unknown';
      try {
        const domain = new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0];
        finalOrgName = domain.charAt(0).toUpperCase() + domain.slice(1);
      } catch (e) {}

      return { insights: '', orgName: finalOrgName };
    })();

    const lighthousePromise = runLighthouse(normalizedUrl, strategy, apiKey);

    // Wait for ALL tasks in parallel
    const [detectData, aiResult, lighthouseResult, localSecurity] = await Promise.all([
      techPromise, 
      geminiPromise, 
      lighthousePromise,
      localSecurityPromise
    ]);

    // Process Tech Stack
    if (detectData) {
      techStack = detectData.techStack || techStack;
      // Merge detectData security with local security if detectData is better
      if (detectData.security && detectData.security.grade !== 'N/A') {
        urlSecurity = { ...urlSecurity, ...detectData.security };
      }
    }

    // Always prefer local security headers and SSL if available
    urlSecurity.headers = Array.from(new Set([...(urlSecurity.headers || []), ...localSecurity.headers]));
    urlSecurity.ssl = localSecurity.ssl || urlSecurity.ssl;
    urlSecurity.warnings = Array.from(new Set([...(urlSecurity.warnings || []), ...localSecurity.warnings]));
    
    // Calculate Score if N/A or low
    if (urlSecurity.grade === 'N/A') {
      const headerCount = localSecurity.headers.length;
      if (headerCount >= 4) urlSecurity.grade = 'A';
      else if (headerCount >= 2) urlSecurity.grade = 'B';
      else if (headerCount >= 1) urlSecurity.grade = 'C';
      else urlSecurity.grade = 'D';
    }

    securityDetails.score = calculateSecurityScore(urlSecurity, localSecurity);

    insights = aiResult.insights || '';
    let orgName = aiResult.orgName || 'Unknown';

    // GUARANTEED FALLBACK: If AI returned 'Unknown', use the domain name
    if (orgName.toLowerCase() === 'unknown' || !orgName) {
      try {
        const domain = new URL(normalizedUrl).hostname.replace('www.', '').split('.')[0];
        orgName = domain.charAt(0).toUpperCase() + domain.slice(1);
      } catch (e) {
        orgName = 'Unknown';
      }
    }
    securityDetails.organization = orgName;

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

async function analyzeSecurityLocally(url: string) {
  const results = {
    headers: [] as string[],
    ssl: null as any,
    warnings: [] as string[],
    isHttps: url.startsWith('https')
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { 
      method: 'HEAD', 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebsiteTester/1.0' }
    });
    clearTimeout(timeout);

    const headers = res.headers;
    const securityHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy'
    ];

    securityHeaders.forEach(h => {
      if (headers.get(h)) {
        results.headers.push(h.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-'));
      }
    });

    if (!results.isHttps) {
      results.warnings.push('Website is not using HTTPS');
    }

  } catch (e) {
    console.warn('[LocalSecurity] Header check failed:', e);
  }

  return results;
}

function calculateSecurityScore(urlSecurity: any, localSecurity: any) {
  let score = 0;
  
  // SSL Check (40 points)
  if (localSecurity.isHttps) score += 30;
  if (urlSecurity.ssl) score += 10;

  // Headers Check (40 points)
  const headerWeight = 40 / 6;
  score += (localSecurity.headers.length * headerWeight);

  // Grade multiplier (20 points)
  if (urlSecurity.grade === 'A' || urlSecurity.grade === 'A+') score += 20;
  else if (urlSecurity.grade === 'B') score += 15;
  else if (urlSecurity.grade === 'C') score += 10;

  return Math.min(100, Math.round(score));
}

async function runLighthouse(url: string, strategy: string, key: string) {
  try {
    const fastCategories = ['performance', 'accessibility', 'seo', 'best-practices'];
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
