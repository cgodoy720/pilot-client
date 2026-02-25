/**
 * Frontend Salary Formatter
 * Formats structured salary data for display
 */

/**
 * Format a salary for display from structured data
 * @param {Object} application - Job application object with salary fields
 * @returns {string|null} Formatted salary string or null
 */
export function formatSalary(application) {
    // If we have structured data, use it
    if (application.salary_min || application.salary_max) {
        const min = application.salary_min;
        const max = application.salary_max;
        const currency = application.salary_currency || 'USD';
        
        const symbol = getCurrencySymbol(currency);
        const formatNum = (num) => {
            if (!num) return null;
            if (num >= 1000) {
                return `${symbol}${Math.round(num / 1000)}K`;
            }
            return `${symbol}${num.toLocaleString()}`;
        };

        if (!max || min === max) {
            return formatNum(min);
        }

        return `${formatNum(min)} - ${formatNum(max)}`;
    }

    // Fallback to raw salary strings
    return application.salary_range || application.salary || null;
}

/**
 * Get currency symbol for a currency code
 * @param {string} currency - ISO 4217 currency code
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(currency) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'CAD': 'CA$',
        'AUD': 'A$'
    };
    return symbols[currency] || '$';
}

/**
 * Get the numeric salary range for filtering/sorting
 * @param {Object} application - Job application object
 * @returns {Object} { min: number, max: number, avg: number }
 */
export function getSalaryRange(application) {
    if (application.salary_min || application.salary_max) {
        const min = application.salary_min || 0;
        const max = application.salary_max || application.salary_min || 0;
        const avg = (min + max) / 2;
        return { min, max, avg };
    }
    return { min: 0, max: 0, avg: 0 };
}

