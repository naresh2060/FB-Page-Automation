
export const THEME_PROMPTS = {
  'Market Analysis':
    'Write in an analytical, data-driven style. Reference trends and ' +
    'market dynamics. Use phrases like "data shows" or "industry trends indicate". ' +
    'Include a key insight or statistic.',

  'Brand Story':
    'Write in a warm, narrative style that builds emotional connection. ' +
    'Focus on human elements, values, and authentic journey. Avoid jargon.',

  'Technical Guide':
    'Write in a clear, structured, step-by-step style. Be precise and ' +
    'actionable. Include relevant technical context and best practices.',

  'Opinion Piece':
    'Write in a bold, opinionated first-person voice. Take a clear stance, ' +
    'briefly acknowledge counterarguments, then rebut them. End with a ' +
    'provocative question or strong call to action.',
};

// Default fallback if no theme selected
export const DEFAULT_THEME_INSTRUCTION =
  'Write in an engaging, platform-appropriate style.';