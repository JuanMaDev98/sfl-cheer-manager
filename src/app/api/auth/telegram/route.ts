import { NextResponse } from 'next/server';

// Telegram initData validation
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

export async function POST(Request) {
  try {
    const { initData } = await Request.json();

    if (!initData) {
      return NextResponse.json({ error: 'No initData provided' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // Parse initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    // Build data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Compute HMAC-SHA256
    const crypto = await import('crypto');
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const computedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      return NextResponse.json({ error: 'Hash mismatch - invalid data' }, { status: 401 });
    }

    // Check auth_date is not too old (max 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0');
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours

    if (now - authDate > maxAge) {
      return NextResponse.json({ error: 'initData expired' }, { status: 401 });
    }

    // Parse user data
    const user = JSON.parse(params.get('user') || '{}');

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        language_code: user.language_code,
      }
    });

  } catch (err) {
    console.error('Telegram validation error:', err);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
