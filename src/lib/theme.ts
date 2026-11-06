export const THEME_STORAGE_KEY = "hm-theme";

export type Theme = "dark" | "light";

/**
 * Inline script for <head>: applies the saved theme to <html> before first paint so a user who chose light
 * never sees a dark flash. Dark is the default (no attribute needed); invalid or unreadable values are ignored.
 */
export const themeInitScript = `try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.hmTheme=t}catch(e){}`;
