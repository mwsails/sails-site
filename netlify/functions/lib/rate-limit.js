/* ============================================================
   SAILS · rate-limit.js
   Netlify Blobs-backed guardrails for the cro-agent function:
   3 conversations/visitor/day, a hard monthly spend cap. The
   12-messages-per-conversation cap is enforced statelessly in
   cro-agent.js from the client-sent transcript length, no Blobs
   needed for that one. Store is keyed by deploy context so preview
   traffic never eats into or pollutes production's daily/monthly
   counters.
   ============================================================ */

import { getStore } from '@netlify/blobs';

export const DAILY_CONVERSATION_LIMIT = 3;
export const MESSAGE_LIMIT_PER_CONVERSATION = 12;
export const MAX_OUTPUT_TOKENS = 1200;

// Rough per-model $/token pricing for the monthly spend-cap estimate.
// Intentionally approximate (a guardrail, not a billing system), update
// if CRO_AGENT_MODEL changes to a materially different price tier.
const PRICE_PER_MILLION_TOKENS = {
  input: 3,
  output: 15,
};

function store() {
  const scope = process.env.CONTEXT || 'dev';
  return getStore({ name: `cro-agent-limits-${scope}` });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function monthKey() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export function estimateCostUsd(usage) {
  if (!usage) return 0;
  const inputCost = ((usage.input_tokens || 0) / 1_000_000) * PRICE_PER_MILLION_TOKENS.input;
  const outputCost = ((usage.output_tokens || 0) / 1_000_000) * PRICE_PER_MILLION_TOKENS.output;
  return inputCost + outputCost;
}

export async function checkAndRecordConversationStart(visitorKey) {
  const s = store();
  const key = `convo-count:${visitorKey}:${todayKey()}`;
  const raw = await s.get(key);
  const count = raw ? Number(raw) : 0;

  if (count >= DAILY_CONVERSATION_LIMIT) {
    return { allowed: false, reason: 'daily_conversation_limit' };
  }

  await s.set(key, String(count + 1));
  return { allowed: true };
}

export async function checkSpendCap() {
  const cap = Number(process.env.MONTHLY_SPEND_CAP_USD || '50');
  const s = store();
  const key = `spend:${monthKey()}`;
  const raw = await s.get(key);
  const spent = raw ? Number(raw) : 0;

  if (spent >= cap) {
    return { allowed: false, reason: 'spend_cap', spent, cap };
  }
  return { allowed: true, spent, cap };
}

export async function recordSpend(costUsd) {
  if (!costUsd || costUsd <= 0) return;
  const s = store();
  const key = `spend:${monthKey()}`;
  const raw = await s.get(key);
  const spent = raw ? Number(raw) : 0;
  await s.set(key, String(spent + costUsd));
}
