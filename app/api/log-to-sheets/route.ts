import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const scriptUrl = process.env.NEXT_PUBLIC_SHEETS_SCRIPT_URL;

    if (!scriptUrl) {
      return NextResponse.json({ error: 'Sheets Script URL missing' }, { status: 500 });
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // Google Apps Script usually redirects, fetch handles this by default (follow)
    // We don't necessarily need to wait for the response to be successful for logging,
    // but it's good to check.
    
    if (response.ok || response.status === 302) {
      return NextResponse.json({ status: 'success' });
    }

    const errorText = await response.text();
    console.error('Apps Script Error:', errorText);
    return NextResponse.json({ error: 'Failed to log to sheet' }, { status: 500 });

  } catch (error: any) {
    console.error('Server Log Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
