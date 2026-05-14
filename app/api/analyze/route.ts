import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

// Simple in-memory cache to save quota and ensure consistency
const analysisCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function POST(req: Request) {
  try {
    const { url, strategy = 'mobile' } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://${normalizedUrl}`;
    } else {
      normalizedUrl = normalizedUrl.replace(/^(https?:)\/*/, '$1//');
    }

    // Check Cache for Shared Data (Tech Stack, Security, AI)
    const cacheKey = `shared_${normalizedUrl}`;
    const cached = analysisCache.get(cacheKey);
    const now = Date.now();

    let techStack = null;
    let urlSecurity = null;
    let cachedInsights = null;
    let cachedSecurity = null;

    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      console.log(`[Cache] Using cached shared data for ${normalizedUrl}`);
      techStack = cached.data.techStack;
      urlSecurity = cached.data.urlSecurity;
      cachedInsights = cached.data.insights;
      cachedSecurity = cached.data.securityDetails;
    } else {
      // DetectZeStack URL Security & Tech Analysis
      const dzsKey = process.env.DETECTZESTACK_API_KEY;
      if (dzsKey) {
        try {
          const domain = normalizedUrl.replace(/https?:\/\//, '').split('/')[0];
          const dzsRes = await fetch(`https://detectzestack.com/analyze?url=${domain}`, {
            headers: { 'X-API-Key': dzsKey }
          });
          const dzsData = await dzsRes.json();
          if (dzsRes.ok) {
            techStack = dzsData.technologies || [];
            urlSecurity = {
              grade: dzsData.security_score || 'N/A',
              headers: dzsData.security_headers || [],
              ssl: dzsData.ssl_info || null,
            };
          }
        } catch (err) {
          console.error('[DetectZeStack] Error:', err);
        }
      }
    }

    // Initialize security details (reuse cached if available)
    let securityDetails = cachedSecurity ? { ...cachedSecurity } : { hasCaptcha: false, hasForms: false, hasValidation: false, score: 100 };

    const apiKey = process.env.PAGESPEED_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Backup Metadata Fetcher (if Lighthouse fails)
    let backupMetadata = { title: '', description: '' };
    try {
      const metaRes = await fetch(normalizedUrl, { next: { revalidate: 3600 } });
      const html = await metaRes.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      backupMetadata.title = titleMatch ? titleMatch[1] : '';
      const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
      backupMetadata.description = descMatch ? descMatch[1] : '';
    } catch (e) {
      console.log('[Backup Meta] Failed to fetch meta');
    }

    const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
    const params = new URLSearchParams({
      url: normalizedUrl,
      key: apiKey,
      strategy,
    });
    
    categories.forEach(cat => params.append('category', cat));

    let data: any = null;
    const runLighthouse = async (cats: string[]) => {
      const retryParams = new URLSearchParams({
        url: normalizedUrl,
        key: apiKey,
        strategy,
      });
      cats.forEach(c => retryParams.append('category', c));
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${retryParams.toString()}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);
      try {
        const response = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) {
          const json = await response.json();
          return json;
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    console.log(`[PageSpeed] Analyzing: ${url} (${strategy})`);
    
    // Stage 1: Full Analysis
    data = await runLighthouse(categories);

    // Stage 2: Optimized Retry (Remove Best Practices - often the cause of errors)
    if (!data) {
      console.log(`[PageSpeed] Full analysis failed. Retrying without Best Practices...`);
      data = await runLighthouse(['performance', 'accessibility', 'seo']);
    }

    // Stage 3: Core Retry (Performance + SEO)
    if (!data) {
      console.log(`[PageSpeed] Optimized retry failed. Retrying with Performance & SEO...`);
      data = await runLighthouse(['performance', 'seo']);
    }

    // Stage 4: Minimal Retry (Performance Only)
    if (!data) {
      console.log(`[PageSpeed] Core retry failed. Final attempt with Performance only...`);
      data = await runLighthouse(['performance']);
    }

    const lighthouseResult = data?.lighthouseResult;
    
    // Prepare metadata for Gemini
    const siteTitle = lighthouseResult?.audits['document-title']?.displayValue || backupMetadata.title || 'Unknown Title';
    const siteDesc = lighthouseResult?.audits['meta-description']?.displayValue || backupMetadata.description || '';

    // Extract security and form info from Lighthouse if available
    const thirdPartyScripts = lighthouseResult?.audits['third-party-summary']?.details?.items || [];
    const hasCaptcha = thirdPartyScripts.some((item: any) => 
      item.entity?.name?.toLowerCase().includes('recaptcha') || 
      item.entity?.name?.toLowerCase().includes('hcaptcha')
    );
    const hasForms = !!lighthouseResult?.audits['form-field-multiple-labels'] || !!lighthouseResult?.audits['label'];

    // Update security details with Lighthouse info
    securityDetails.hasCaptcha = hasCaptcha;
    securityDetails.hasForms = hasForms;

    // Optional: Get Gemini Insights (if not cached)
    let insights = cachedInsights;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (geminiKey && !insights) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const modelNames = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-1.5-flash"];
      let lastError = null;

      for (const modelName of modelNames) {
        try {
          console.log(`[PageSpeed] Attempting AI insights with: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          
          const prompt = `Act as a web analyst. Analyze the overall website: ${url}
          Site Title: ${siteTitle}
          Site Description: ${siteDesc}
          
          Task:
          1. Provide exactly 3 ultra-short speed tips (one sentence each).
          2. Identify the official organization name.
          
          IMPORTANT: DO NOT use asterisks (*). No bolding. Keep tips extremely brief (max 10 words per tip).
          
          Response Format:
          ORGANIZATION: (Name)
          TIPS: (List 3 short tips separated by semicolons) `;

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
            
            insights = `Organization: ${orgName}\n${formattedTips}`;
            securityDetails.organization = orgName || 'Unknown';
            
            // Calculate security score based on Lighthouse data
            if (securityDetails.hasForms) {
              securityDetails.score = securityDetails.hasCaptcha ? 100 : 50;
            } else {
              securityDetails.score = 100;
            }

            // Save shared data to cache
            analysisCache.set(cacheKey, {
              timestamp: Date.now(),
              data: { techStack, urlSecurity, securityDetails, insights }
            });
            console.log(`[PageSpeed] Success with model: ${modelName}`);
            break; // Success!
          }
        } catch (err: any) {
          console.warn(`[PageSpeed] Model ${modelName} failed:`, err.message);
          lastError = err;
          continue;
        }
      }

      // Final attempt: Auto-discovery if all models failed
      if (!insights) {
        try {
          console.log("[PageSpeed] Final attempt: Discovering any available model...");
          const modelsResult = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
          const modelsData = await modelsResult.json();

          if (modelsData.models) {
            const autoFound = modelsData.models.find((m: any) =>
                m.supportedGenerationMethods.includes("generateContent") &&
                !m.name.includes("vision") && !m.name.includes("tts")
            );

            if (autoFound) {
                const modelName = autoFound.name.replace("models/", "");
                console.log(`[PageSpeed] Trying auto-discovered model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(`Act as a web analyst. Analyze ${url}. Provide ORGANIZATION name and 3 speed TIPS.`);
                const text = result.response.text();
                insights = text;
            }
          }
        } catch (e) {
          console.error("[PageSpeed] Auto-discovery failed.");
        }
      }

      if (!insights && lastError?.code === 429) {
        insights = "AI analysis limit reached for all models. Please wait a while or upgrade your plan.";
      }
    }

    if (!lighthouseResult) {
      // Partial return if PageSpeed fails, but now with AI INSIGHTS!
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
        insights: insights || "Google Lighthouse was unable to analyze this site, but technology analysis was completed.",
        security: securityDetails,
        techStack,
        urlSecurity,
        screenshot: null,
      });
    }

    const getScore = (cat: string) => {
      const category = lighthouseResult.categories[cat];
      if (!category) return null; // Category was skipped
      const score = category.score;
      return typeof score === 'number' ? Math.round(score * 100) : null;
    };

    const getAudit = (audit: string) => lighthouseResult.audits[audit]?.displayValue || 'N/A';

    const scores = {
      performance: getScore('performance'),
      accessibility: getScore('accessibility'),
      bestPractices: getScore('best-practices'),
      seo: getScore('seo'),
    };

    const metrics = {
      firstContentfulPaint: getAudit('first-contentful-paint'),
      speedIndex: getAudit('speed-index'),
      largestContentfulPaint: getAudit('largest-contentful-paint'),
      interactive: getAudit('interactive'),
      totalBlockingTime: getAudit('total-blocking-time'),
      cumulativeLayoutShift: getAudit('cumulative-layout-shift'),
    };

    const result = {
      url: lighthouseResult.requestedUrl,
      fetchTime: lighthouseResult.fetchTime,
      scores,
      metrics,
      insights: insights || "No AI insights generated for this run.",
      security: securityDetails,
      techStack,
      urlSecurity,
      screenshot: lighthouseResult.audits['final-screenshot']?.details?.data || null,
    };

    console.log(`[PageSpeed] Success: ${url}`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[PageSpeed] Fatal Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
