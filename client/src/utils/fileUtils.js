import { SERVER_URL } from '../api/config';

/**
 * Returns the correct URL for a file/image path.
 * If the path is absolute (starts with http/https), it returns it as is.
 * If the path is relative, it prepends the SERVER_URL.
 * Returns null if path is empty/null.
 * 
 * @param {string} path - The file path (absolute or relative)
 * @returns {string|null} - The full URL or null
 */
export const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${SERVER_URL}${path}`;
};

/**
 * Ensures a URL has a protocol (http/https). If missing, prepends https://.
 * Useful for user-entered external links like github.com/...
 * 
 * @param {string} url - The URL to check
 * @returns {string|null} - The absolute URL or null
 */
export const ensureAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `https://${url}`;
};
