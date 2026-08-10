/* ============================================================
   SAILS · ssrf-guard.js
   Validates a visitor-supplied URL is safe to fetch server-side
   before cro-agent.js reads it for site context. Blocks private,
   loopback, link-local (including the cloud metadata endpoint),
   and non-http(s) targets. Re-checked on the one redirect hop
   fetch-context.js is allowed to follow.
   ============================================================ */

import dns from 'node:dns/promises';
import net from 'node:net';

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function inV4Range(ip, base, maskBits) {
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

const BLOCKED_V4_RANGES = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16], // includes the 169.254.169.254 cloud metadata endpoint
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function isBlockedV4(ip) {
  return BLOCKED_V4_RANGES.some(([base, bits]) => inV4Range(ip, base, bits));
}

function isBlockedV6(ip) {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // fc00::/7 unique local
  if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true; // fe80::/10 link-local
  // IPv4-mapped IPv6 (::ffff:a.b.c.d): unwrap and check the embedded v4 address
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedV4(mapped[1]);
  return false;
}

export function isPrivateIp(ip) {
  const family = net.isIP(ip);
  if (family === 4) return isBlockedV4(ip);
  if (family === 6) return isBlockedV6(ip);
  return true; // not a recognizable IP at all, treat as unsafe
}

/**
 * Resolves the hostname and confirms every address it could resolve to
 * is public. Returns { safe: boolean, reason?: string }.
 */
export async function isSafeUrl(urlStr) {
  let url;
  try {
    url = new URL(urlStr);
  } catch {
    return { safe: false, reason: 'unparseable_url' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { safe: false, reason: 'unsupported_scheme' };
  }

  const hostname = url.hostname;

  if (net.isIP(hostname)) {
    return isPrivateIp(hostname) ? { safe: false, reason: 'private_ip_literal' } : { safe: true };
  }

  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    return { safe: false, reason: 'dns_lookup_failed' };
  }

  if (addresses.length === 0) return { safe: false, reason: 'dns_lookup_failed' };
  const unsafe = addresses.some((a) => isPrivateIp(a.address));
  return unsafe ? { safe: false, reason: 'resolves_to_private_ip' } : { safe: true };
}
