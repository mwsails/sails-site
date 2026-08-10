/* ============================================================
   SAILS · fetch-context.js
   Server-side fetch of a visitor-supplied URL, used once per
   conversation to give the CRO agent real site context. SSRF-guarded
   via ssrf-guard.js on both the initial URL and the one redirect hop
   we allow. Strips HTML to plain text and caps output size.
   ============================================================ */

import { isSafeUrl } from './ssrf-guard.js';

const FETCH_TIMEOUT_MS = 8000;
const MAX_TEXT_BYTES = 30 * 1024;

const URL_LIKE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

export function looksLikeUrl(input) {
  const trimmed = (input || '').trim();
  if (!trimmed) return false;
  const hasScheme = /^https?:\/\//i.test(trimmed);
  // Free text with spaces and no explicit scheme is never treated as a URL.
  if (/\s/.test(trimmed) && !hasScheme) return false;
  const candidate = hasScheme ? trimmed.split(/\s+/)[0] : trimmed;
  return URL_LIKE.test(candidate);
}

function normalizeUrl(input) {
  const trimmed = input.trim();
  const hasScheme = /^https?:\/\//i.test(trimmed);
  const candidate = hasScheme ? trimmed.split(/\s+/)[0] : trimmed;
  return hasScheme ? candidate : `https://${candidate}`;
}

function stripHtmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|section|article|header|footer|li|h[1-6]|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function safeFetchOnce(urlStr) {
  const check = await isSafeUrl(urlStr);
  if (!check.safe) return { ok: false, reason: check.reason };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(urlStr, {
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': 'SAILS-CRO-Agent/1.0 (+https://sailsadvisory.com)' },
    });
    clearTimeout(timeout);

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get('location');
      if (!location) return { ok: false, reason: 'redirect_no_location' };
      const nextUrl = new URL(location, urlStr).toString();
      return { ok: false, redirectTo: nextUrl };
    }

    if (!res.ok) return { ok: false, reason: `http_${res.status}` };

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return { ok: false, reason: 'unsupported_content_type' };
    }

    const html = await res.text();
    return { ok: true, html };
  } catch (err) {
    clearTimeout(timeout);
    return { ok: false, reason: err.name === 'AbortError' ? 'timeout' : 'fetch_failed' };
  }
}

/**
 * Fetches a visitor-supplied URL and returns extracted plain text,
 * capped at ~30KB. Follows at most one redirect, re-validating the
 * target through the SSRF guard before following it. Never throws;
 * returns { ok: false, reason } for the caller to fall back gracefully.
 */
export async function fetchSiteContext(rawInput) {
  const url = normalizeUrl(rawInput);

  let result = await safeFetchOnce(url);
  if (!result.ok && result.redirectTo) {
    result = await safeFetchOnce(result.redirectTo);
    // A second redirect is not followed, treat as failure rather than loop.
    if (!result.ok && result.redirectTo) {
      return { ok: false, reason: 'too_many_redirects' };
    }
  }

  if (!result.ok) return { ok: false, reason: result.reason || 'fetch_failed' };

  const text = stripHtmlToText(result.html).slice(0, MAX_TEXT_BYTES);
  if (text.length < 40) return { ok: false, reason: 'insufficient_content' };

  return { ok: true, text };
}
