import { defineConfig } from 'vite';

/** GitHub project Pages URL: https://elinava26.github.io/wedding-Mher-Elina/ */
const GITHUB_PAGES_BASE = '/wedding-Mher-Elina/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? GITHUB_PAGES_BASE : '/',
}));
