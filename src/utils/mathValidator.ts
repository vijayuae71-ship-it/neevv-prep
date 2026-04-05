/**
 * Math Validator for Guesstimate Answers
 * Catches arithmetic errors in student calculations before Dify processes them.
 * Extracts mathematical expressions, evaluates them, and flags mismatches.
 */

interface MathError {
  expression: string;    // e.g. "2 × 2"
  studentResult: number; // what the student said (e.g. 5)
  correctResult: number; // actual answer (e.g. 4)
  description: string;   // human-readable error
}

interface MathValidation {
  hasErrors: boolean;
  errors: MathError[];
  extractedExpressions: string[];
  summary: string; // human-readable summary for the student
}

// Parse multiplier suffixes like "million", "billion", "k", "thousand", etc.
function parseNumberWithSuffix(str: string): number | null {
  const cleaned = str.replace(/,/g, '').trim();
  const multipliers: Record<string, number> = {
    'k': 1e3, 'thousand': 1e3, 'lakh': 1e5, 'lakhs': 1e5,
    'm': 1e6, 'mn': 1e6, 'mil': 1e6, 'million': 1e6,
    'cr': 1e7, 'crore': 1e7, 'crores': 1e7,
    'b': 1e9, 'bn': 1e9, 'bil': 1e9, 'billion': 1e9,
    't': 1e12, 'tn': 1e12, 'trillion': 1e12,
  };

  // Try "5 million", "2.5k", "100 thousand"
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion)?$/i);
  if (match) {
    const num = parseFloat(match[1]);
    const suffix = (match[2] || '').toLowerCase();
    return suffix ? num * (multipliers[suffix] || 1) : num;
  }
  return null;
}

// Normalize a number string to a raw number
function toNumber(str: string): number | null {
  const withSuffix = parseNumberWithSuffix(str);
  if (withSuffix !== null) return withSuffix;
  const cleaned = str.replace(/[,$\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Format large numbers in a readable way
function formatNumber(n: number): string {
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, '') + ' trillion';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + ' billion';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' million';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toFixed(n % 1 !== 0 ? 2 : 0);
}

// Extract and validate "A × B = C" patterns
function findMultiplicationErrors(text: string): MathError[] {
  const errors: MathError[] = [];
  // Patterns: "5 × 2 = 12", "5 * 2 = 12", "5 x 2 = 12", "5 times 2 = 12", "5 multiplied by 2 = 12"
  const patterns = [
    // A op B = C (with optional suffixes)
    /(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*(?:[×x*]|times|multiplied\s+by)\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*[=≈~]\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const a = toNumber(match[1]);
      const b = toNumber(match[2]);
      const claimed = toNumber(match[3]);
      if (a !== null && b !== null && claimed !== null) {
        const actual = a * b;
        // Allow 5% tolerance for rounding
        if (Math.abs(actual - claimed) > Math.max(actual * 0.05, 0.5)) {
          errors.push({
            expression: `${match[1].trim()} × ${match[2].trim()}`,
            studentResult: claimed,
            correctResult: actual,
            description: `${match[1].trim()} × ${match[2].trim()} = ${formatNumber(actual)}, not ${formatNumber(claimed)}`,
          });
        }
      }
    }
  }
  return errors;
}

function findAdditionErrors(text: string): MathError[] {
  const errors: MathError[] = [];
  const pattern = /(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*(?:\+|plus|added?\s+to)\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*[=≈~]\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const a = toNumber(match[1]);
    const b = toNumber(match[2]);
    const claimed = toNumber(match[3]);
    if (a !== null && b !== null && claimed !== null) {
      const actual = a + b;
      if (Math.abs(actual - claimed) > Math.max(actual * 0.05, 0.5)) {
        errors.push({
          expression: `${match[1].trim()} + ${match[2].trim()}`,
          studentResult: claimed,
          correctResult: actual,
          description: `${match[1].trim()} + ${match[2].trim()} = ${formatNumber(actual)}, not ${formatNumber(claimed)}`,
        });
      }
    }
  }
  return errors;
}

function findDivisionErrors(text: string): MathError[] {
  const errors: MathError[] = [];
  const pattern = /(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*(?:[÷/]|divided\s+by)\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*[=≈~]\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const a = toNumber(match[1]);
    const b = toNumber(match[2]);
    const claimed = toNumber(match[3]);
    if (a !== null && b !== null && b !== 0 && claimed !== null) {
      const actual = a / b;
      if (Math.abs(actual - claimed) > Math.max(actual * 0.05, 0.5)) {
        errors.push({
          expression: `${match[1].trim()} ÷ ${match[2].trim()}`,
          studentResult: claimed,
          correctResult: actual,
          description: `${match[1].trim()} ÷ ${match[2].trim()} = ${formatNumber(actual)}, not ${formatNumber(claimed)}`,
        });
      }
    }
  }
  return errors;
}

function findSubtractionErrors(text: string): MathError[] {
  const errors: MathError[] = [];
  const pattern = /(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*(?:[-−]|minus|subtract(?:ed)?(?:\s+(?:by|from))?)\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*[=≈~]\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const a = toNumber(match[1]);
    const b = toNumber(match[2]);
    const claimed = toNumber(match[3]);
    if (a !== null && b !== null && claimed !== null) {
      const actual = a - b;
      if (Math.abs(actual - claimed) > Math.max(Math.abs(actual) * 0.05, 0.5)) {
        errors.push({
          expression: `${match[1].trim()} − ${match[2].trim()}`,
          studentResult: claimed,
          correctResult: actual,
          description: `${match[1].trim()} − ${match[2].trim()} = ${formatNumber(actual)}, not ${formatNumber(claimed)}`,
        });
      }
    }
  }
  return errors;
}

// Check for percentage calculation errors: "X% of Y = Z"
function findPercentageErrors(text: string): MathError[] {
  const errors: MathError[] = [];
  const pattern = /(\d+(?:\.\d+)?)\s*%\s*(?:of|×|x|\*)\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)\s*[=≈~]\s*(\d+(?:\.\d+)?(?:\s*(?:k|thousand|lakh|lakhs|m|mn|mil|million|cr|crore|crores|b|bn|bil|billion|t|tn|trillion))?)/gi;

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const pct = parseFloat(match[1]);
    const base = toNumber(match[2]);
    const claimed = toNumber(match[3]);
    if (!isNaN(pct) && base !== null && claimed !== null) {
      const actual = (pct / 100) * base;
      if (Math.abs(actual - claimed) > Math.max(actual * 0.05, 0.5)) {
        errors.push({
          expression: `${match[1]}% of ${match[2].trim()}`,
          studentResult: claimed,
          correctResult: actual,
          description: `${match[1]}% of ${match[2].trim()} = ${formatNumber(actual)}, not ${formatNumber(claimed)}`,
        });
      }
    }
  }
  return errors;
}

/**
 * Main validation function - checks a student's guesstimate answer for math errors.
 * Returns validation result with any found errors.
 */
export function validateMath(text: string): MathValidation {
  const allErrors: MathError[] = [
    ...findMultiplicationErrors(text),
    ...findAdditionErrors(text),
    ...findSubtractionErrors(text),
    ...findDivisionErrors(text),
    ...findPercentageErrors(text),
  ];

  // Deduplicate by expression
  const seen = new Set<string>();
  const errors = allErrors.filter((e) => {
    const key = e.expression + e.studentResult;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const extractedExpressions = errors.map((e) => e.expression);

  let summary = '';
  if (errors.length > 0) {
    summary = `⚠️ **Math Check — ${errors.length} error${errors.length > 1 ? 's' : ''} found:**\n\n`;
    for (const err of errors) {
      summary += `❌ ${err.description}\n`;
    }
    summary += `\nPlease fix your calculations and resubmit.`;
  }

  return {
    hasErrors: errors.length > 0,
    errors,
    extractedExpressions,
    summary,
  };
}

/**
 * Determines if a message is likely a guesstimate response (contains math/numbers).
 */
export function isGuesstimateLikelyAnswer(text: string): boolean {
  // Contains multiple numbers and math operators
  const numberCount = (text.match(/\d+(?:\.\d+)?/g) || []).length;
  const hasMathOps = /[×x*÷/+\-−%]/.test(text) || /(?:times|multiplied|divided|plus|minus|percent)/i.test(text);
  const hasEquals = /[=≈~]/.test(text);
  return numberCount >= 3 && hasMathOps && hasEquals;
}
