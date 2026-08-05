const TOXIC_PATTERNS = [
  /\b(kill|die|murder)\s+(yourself|urself|u)\b/i,
  /\b(kys|stfu)\b/i,
  /\bn[i1]gg/i,
  /\bf[a@]gg/i,
  /\bretard/i,
];

const SPAM_PATTERNS = [
  /(https?:\/\/[^\s]+){3,}/i,
  /(.)\1{10,}/,
  /\b(buy|sell|discount|click here|free money|earn money)\b/i,
  /\b(whatsapp|telegram|snapchat)\s*[:\-]?\s*\+?\d/i,
];

const NUDITY_KEYWORDS = [
  /\b(nude|naked|porn|xxx|onlyfans|nsfw)\b/i,
  /\bshow\s+(me\s+)?(your\s+)?(body|boobs|tits|dick|ass)\b/i,
];

export function moderateContent(text: string): { allowed: boolean; reasons: string[] } {
  const reasons: string[] = [];

  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push('TOXICITY');
      break;
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      reasons.push('SPAM');
      break;
    }
  }

  for (const pattern of NUDITY_KEYWORDS) {
    if (pattern.test(text)) {
      reasons.push('NUDITY_KEYWORDS');
      break;
    }
  }

  return {
    allowed: reasons.length === 0,
    reasons,
  };
}
