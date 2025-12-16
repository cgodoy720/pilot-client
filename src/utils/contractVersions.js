/**
 * Contract Version Configuration (Frontend)
 * 
 * This mirrors the backend configuration for contract versions.
 * The calculator uses this to display version-specific terms.
 */

export const contractVersions = {
  '3.0': {
    name: 'Version 3.0',
    incomeSharePercentage: 12,
    isTiered: false,
    maxPayments: 24,
    coveredPeriod: 24, // months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: null,
    maxPaymentAmount: null
  },
  '4.0': {
    name: 'Version 4.0',
    incomeSharePercentage: 12,
    isTiered: false,
    maxPayments: 36,
    coveredPeriod: 36, // months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 108000,
    maxPaymentAmount: 108000
  },
  '5.0': {
    name: 'Version 5.0',
    incomeSharePercentage: 12,
    isTiered: false,
    maxPayments: 36,
    coveredPeriod: 36, // months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 108000,
    maxPaymentAmount: 108000
  },
  '6.0': {
    name: 'Version 6.0',
    incomeSharePercentage: 12,
    isTiered: false,
    maxPayments: 36,
    coveredPeriod: 36, // months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 108000,
    maxPaymentAmount: 108000
  },
  '7.0': {
    name: 'Version 7.0',
    incomeSharePercentage: null, // Tiered
    isTiered: true,
    tiers: [
      { min: 50000, max: 60000, percentage: 5 },
      { min: 60000, max: 70000, percentage: 10 },
      { min: 70000, max: null, percentage: 15 }
    ],
    maxPayments: 48,
    coveredPeriod: 96, // 8 years in months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 70000,
    maxPaymentAmount: 70000
  },
  '8.0': {
    name: 'Version 8.0',
    incomeSharePercentage: null, // Tiered
    isTiered: true,
    tiers: [
      { min: 50000, max: 60000, percentage: 5 },
      { min: 60000, max: 70000, percentage: 10 },
      { min: 70000, max: null, percentage: 15 }
    ],
    maxPayments: 48,
    coveredPeriod: 96, // 8 years in months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 70000,
    maxPaymentAmount: 70000
  },
  '9.1': {
    name: 'Version 9.1',
    incomeSharePercentage: null, // Tiered
    isTiered: true,
    tiers: [
      { min: 50000, max: 60000, percentage: 5 },
      { min: 60000, max: 70000, percentage: 10 },
      { min: 70000, max: null, percentage: 15 }
    ],
    maxPayments: 48,
    coveredPeriod: 96, // 8 years in months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 70000,
    maxPaymentAmount: 70000
  },
  '9.2': {
    name: 'Version 9.2',
    incomeSharePercentage: null, // Tiered
    isTiered: true,
    tiers: [
      { min: 50000, max: 60000, percentage: 5 },
      { min: 60000, max: 70000, percentage: 10 },
      { min: 70000, max: null, percentage: 15 }
    ],
    maxPayments: 48,
    coveredPeriod: 96, // 8 years in months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 70000,
    maxPaymentAmount: 70000
  },
  '9.3': {
    name: 'Version 9.3-9.6',
    incomeSharePercentage: null, // Tiered
    isTiered: true,
    tiers: [
      { min: 50000, max: 60000, percentage: 5 },
      { min: 60000, max: 70000, percentage: 10 },
      { min: 70000, max: null, percentage: 15 }
    ],
    maxPayments: 48,
    coveredPeriod: 96, // 8 years in months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 70000,
    maxPaymentAmount: 70000
  },
  '10.1': {
    name: 'Version 10.1-10.5',
    incomeSharePercentage: null, // Tiered
    isTiered: true,
    tiers: [
      { min: 50000, max: 60000, percentage: 5 },
      { min: 60000, max: 70000, percentage: 10 },
      { min: 70000, max: null, percentage: 15 }
    ],
    maxPayments: 48,
    coveredPeriod: 96, // 8 years in months
    monthlyThreshold: null,
    annualThreshold: null,
    totalThreshold: 70000,
    maxPaymentAmount: 70000
  },
  'ai-native': {
    name: 'AI Native',
    incomeSharePercentage: 15,
    isTiered: false,
    annualThreshold: 85000, // >$85k
    monthlyThreshold: 7083, // ~$85k/12
    maxPayments: 36,
    coveredPeriod: 60, // 5 years in months
    totalThreshold: 55000,
    maxPaymentAmount: 55000
  },
  'default': {
    name: 'Good Job Agreement (Legacy)',
    incomeSharePercentage: 15,
    isTiered: false,
    annualThreshold: 85000,
    monthlyThreshold: 7083,
    maxPayments: 36,
    coveredPeriod: 60, // 5 years in months
    totalThreshold: 55000,
    maxPaymentAmount: 55000
  }
};

/**
 * Calculate income share percentage for tiered contracts
 * @param {Object} version - The contract version config
 * @param {number} annualIncome - Annual income
 * @returns {number} - The income share percentage
 */
export function calculateTieredPercentage(version, annualIncome) {
  if (!version || !version.isTiered || !version.tiers) {
    return version?.incomeSharePercentage || 0;
  }
  
  for (const tier of version.tiers) {
    if (annualIncome >= tier.min && (tier.max === null || annualIncome < tier.max)) {
      return tier.percentage;
    }
  }
  
  return 0;
}

/**
 * Get contract version configuration
 * @param {string} version - The version identifier
 * @returns {Object|null} - The contract version config or default
 */
export function getContractVersion(version) {
  if (!version) {
    return contractVersions['default'];
  }
  return contractVersions[version] || contractVersions['default'];
}


