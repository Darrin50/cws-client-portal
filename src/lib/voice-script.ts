import type { MorningBriefData } from '@/db/schema/morning-briefs';

/**
 * Builds a natural, conversational voice script from morning brief data.
 * Target: ~120 words, ~55 seconds at 1x speed (130 wpm average).
 *
 * This is a pure function with no external deps — safe to import in both
 * server (API routes) and client (VoiceBriefingPlayer) contexts.
 *
 * ── Future TTS swap-in ──────────────────────────────────────────────────────
 * This function generates the TEXT that gets spoken. To upgrade to a real TTS
 * service (ElevenLabs, OpenAI TTS, etc.), keep this for text generation and
 * update TTSProvider in voice-briefing-player.tsx to POST to an API endpoint
 * (e.g. /api/portal/voice-briefing) that returns an audio URL, then play it
 * with a standard <audio> element instead of SpeechSynthesisUtterance.
 * ───────────────────────────────────────────────────────────────────────────
 */
export function buildVoiceScript(data: MorningBriefData): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const parts: string[] = [`${greeting}! Here is your business update.`];

  // Leads
  if (data.newLeadsOvernight > 0) {
    const n = data.newLeadsOvernight;
    const word = n === 1 ? 'lead came' : 'leads came';
    const flourish = data.milestoneHit ? ', which is great traction' : '';
    parts.push(`${n} new ${word} in overnight${flourish}.`);
  } else {
    parts.push(`No new leads came in overnight, but your site is still running strong.`);
  }

  // Messages
  if (data.newMessagesOvernight > 0) {
    const n = data.newMessagesOvernight;
    parts.push(
      `Your CWS team sent ${n} new ${n === 1 ? 'message' : 'messages'}.`
    );
  }

  // Growth score
  if (data.growthScoreDelta !== null && data.growthScoreDelta !== undefined) {
    const d = data.growthScoreDelta;
    if (d > 0) {
      parts.push(
        `Your growth score climbed ${d} ${d === 1 ? 'point' : 'points'} to ${data.growthScore} out of 100.`
      );
    } else if (d < 0) {
      parts.push(
        `Your growth score dipped ${Math.abs(d)} ${Math.abs(d) === 1 ? 'point' : 'points'} to ${data.growthScore} out of 100.`
      );
    } else {
      parts.push(`Your growth score holds steady at ${data.growthScore} out of 100.`);
    }
  } else {
    parts.push(`Your growth score sits at ${data.growthScore} out of 100.`);
  }

  // Open requests
  if (data.openRequests > 0) {
    const n = data.openRequests;
    parts.push(
      `You have ${n} open ${n === 1 ? 'request' : 'requests'} waiting for your attention.`
    );
  }

  // Competitor alert — brief mention, no raw data in spoken form
  if (data.competitorAlert) {
    parts.push(`Heads up: there has been some recent competitor activity worth checking today.`);
  }

  // Milestone
  if (data.milestoneHit) {
    parts.push(`Big win: ${data.milestoneHit}`);
  }

  // Recommended action
  parts.push(`For today, ${data.recommendedAction}`);

  parts.push(`That is your morning brief. Have a great day!`);

  return parts.join(' ');
}
