/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date string to localized date string, handling microsecond precision in ISO format
 * @param dateStr - ISO date string, potentially with microsecond precision
 * @returns Formatted date string or fallback if invalid
 */
export const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '-';
    
    try {
        // Convert ISO string to date, handling microsecond precision
        // Replace the microsecond part to ensure compatibility
        const normalizedDateStr = dateStr.replace(/\.\d{6}Z$/, 'Z');
        const date = new Date(normalizedDateStr);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateStr);
            return '-';
        }
        
        return date.toLocaleDateString();
    } catch (err) {
        console.error('Error formatting date:', err);
        return '-';
    }
};

/**
 * Format a date string to localized date and time string
 * @param dateStr - ISO date string
 * @returns Formatted date and time string or fallback if invalid
 */
export const formatDateTime = (dateStr: string | undefined): string => {
    if (!dateStr) return '-';
    
    try {
        // Convert ISO string to date, handling microsecond precision
        // Replace the microsecond part to ensure compatibility
        const normalizedDateStr = dateStr.replace(/\.\d{6}Z$/, 'Z');
        const date = new Date(normalizedDateStr);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateStr);
            return '-';
        }
        
        return date.toLocaleString();
    } catch (err) {
        console.error('Error formatting date:', err);
        return '-';
    }
};
