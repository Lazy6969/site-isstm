import { defineConfig } from '@playwright/test';

/**
 * Targeted security checks (headers, cookie flags, CSRF, reflected input,
 * access control on admin routes) run against the site already served by
 * Herd at site_isstm.test — complements the automated OWASP ZAP scan rather
 * than duplicating it. See tests/security/README.md.
 */
export default defineConfig({
    testDir: './tests/security',
    use: {
        baseURL: 'http://site_isstm.test',
        ignoreHTTPSErrors: true,
    },
    reporter: [['list'], ['html', { outputFolder: 'tests/security/report', open: 'never' }]],
});
