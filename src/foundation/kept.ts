/**
 * A preference of this browser, such as the theme or a folded rail, kept in
 * localStorage under the app's key, and nothing kept while it is at its
 * default. A browser that refuses storage keeps it for the page's life, in
 * the caller's own state.
 */
export function readKept(key: string): string | null {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

/** Keeps a preference, or forgets it for `null`, its default. */
export function keep(key: string, value: string | null): void {
    try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch {
        // Kept for this page only.
    }
}
