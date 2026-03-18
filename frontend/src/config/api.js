/**
 * API Configuration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export { API_BASE_URL };

/**
 * Helper function to construct API URLs
 * @param {string} path - API endpoint path (e.g., '/posts', '/organizations/pending')
 * @returns {string} Full API URL
 */
export const getApiUrl = (path) => {
	const cleanPath = path.startsWith("/") ? path : `/${path}`;
	return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} Response data
 */
export const apiFetch = async (url, options = {}) => {
	try {
		const response = await fetch(url, {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
    });

    if (!response.ok) {
		throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
	} catch (error) {
		console.error("API Fetch Error:", error);
    throw error;
  }
};
