/**
 * Format a dollar amount with appropriate abbreviation (K, M, B)
 * Best practices: show full numbers under 1M, abbreviate larger amounts
 * @param value - The dollar amount to format
 * @returns Formatted string like "$1.2M" or "$450K" or "$12,345"
 */
export const formatDollar = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return '$0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  // Less than 1 thousand: show full amount
  if (absValue < 1000) {
    return `${sign}$${absValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  
  // Less than 1 million: show in thousands with K
  if (absValue < 1000000) {
    const thousands = absValue / 1000;
    if (thousands < 10) {
      // Under 10K: show 1 decimal (e.g., $5.5K)
      return `${sign}$${thousands.toFixed(1)}K`;
    } else {
      // 10K+: no decimals (e.g., $450K)
      return `${sign}$${Math.round(thousands)}K`;
    }
  }
  
  // Less than 1 billion: show in millions with M
  if (absValue < 1000000000) {
    const millions = absValue / 1000000;
    if (millions < 10) {
      // Under 10M: show 2 decimals (e.g., $5.45M)
      return `${sign}$${millions.toFixed(2)}M`;
    } else if (millions < 100) {
      // 10M-100M: show 1 decimal (e.g., $45.5M)
      return `${sign}$${millions.toFixed(1)}M`;
    } else {
      // 100M+: no decimals (e.g., $450M)
      return `${sign}$${Math.round(millions)}M`;
    }
  }
  
  // 1 billion or more: show in billions with B
  const billions = absValue / 1000000000;
  if (billions < 10) {
    return `${sign}$${billions.toFixed(2)}B`;
  } else if (billions < 100) {
    return `${sign}$${billions.toFixed(1)}B`;
  } else {
    return `${sign}$${Math.round(billions)}B`;
  }
};

/**
 * Alias for backward compatibility
 */
export const formatDollarMillions = formatDollar;

/**
 * Format a number as a percentage
 * @param value - The percentage value (0-100)
 * @returns Formatted string like "45%"
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return '0%';
  return `${Math.round(value)}%`;
};

