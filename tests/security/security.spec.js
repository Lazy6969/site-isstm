// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Targeted checks a generic ZAP crawl is unlikely to assert on precisely:
 * exact cookie flags, exact security headers, whether an XSS payload
 * actually *executes* (vs. merely appears in a response), and whether a
 * specific admin route truly redirects an anonymous visitor rather than
 * rendering. Read alongside the ZAP HTML report for the fuller sweep.
 */

test.describe('response headers', () => {
    for (const path of ['/', '/contact', '/recherche']) {
        test(`${path} sets the baseline security headers`, async ({ request }) => {
            const res = await request.get(path);
            const headers = res.headers();

            expect(headers['x-content-type-options']).toBe('nosniff');
            // Laravel/Inertia don't set X-Frame-Options or a CSP by default —
            // recorded as a finding in the report, not asserted as a pass here.
        });
    }
});

test.describe('cookies', () => {
    test('the session cookie is HttpOnly and SameSite', async ({ page, context }) => {
        await page.goto('/');
        const cookies = await context.cookies();
        const session = cookies.find((c) => c.name.includes('session'));

        expect(session).toBeTruthy();
        expect(session?.httpOnly).toBe(true);
        expect(['Lax', 'Strict']).toContain(session?.sameSite);
    });

    test('the XSRF-TOKEN cookie is readable by JS but SameSite-restricted', async ({ page, context }) => {
        await page.goto('/');
        const cookies = await context.cookies();
        const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN');

        expect(xsrf).toBeTruthy();
        // Deliberately readable by JS (Laravel sends it precisely so axios/fetch
        // can echo it back as X-XSRF-TOKEN) — only SameSite is the relevant guard.
        expect(xsrf?.httpOnly).toBe(false);
        expect(['Lax', 'Strict']).toContain(xsrf?.sameSite);
    });
});

test.describe('CSRF protection', () => {
    test('a state-changing POST without a CSRF token is rejected', async ({ request }) => {
        const res = await request.post('/contact/message-rapide', {
            data: { name: 'Playwright', email: 'playwright@example.com', message: 'probe' },
            headers: { Accept: 'application/json' },
            failOnStatusCode: false,
        });

        expect(res.status()).toBe(419);
    });
});

test.describe('access control', () => {
    test('the admin console redirects an anonymous visitor to login instead of rendering', async ({ page }) => {
        const response = await page.goto('/console/dashboard');
        expect(page.url()).toContain('/login');
        expect(response?.status()).toBeLessThan(400);
    });

    test('a deactivated-looking direct hit on a staff-only export route is not silently 200', async ({ request }) => {
        const res = await request.get('/console/preinscriptions/export', { failOnStatusCode: false, maxRedirects: 0 });
        expect([302, 401, 403, 404]).toContain(res.status());
    });
});

test.describe('reflected input', () => {
    test('a script payload in the search query never executes', async ({ page }) => {
        let dialogFired = false;
        page.on('dialog', async (dialog) => {
            dialogFired = true;
            await dialog.dismiss();
        });

        await page.goto('/recherche?q=' + encodeURIComponent('<script>window.__xss=1</script>'));
        await page.waitForLoadState('networkidle');

        const executed = await page.evaluate(() => window.__xss === 1);
        expect(executed).toBe(false);
        expect(dialogFired).toBe(false);
    });

    test('a script payload typed into the Assistant chatbot is rendered as text, not markup', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        const toggle = page.locator('button[aria-label="Assistant ISSTM"]').first();
        await toggle.waitFor({ state: 'visible', timeout: 10000 });
        await toggle.click({ force: true });

        const input = page.getByPlaceholder(/tapez votre question/i);
        await input.waitFor({ state: 'visible', timeout: 5000 });
        await input.fill('<img src=x onerror="window.__xss=1">');
        await input.press('Enter');
        await page.waitForTimeout(1500);

        const executed = await page.evaluate(() => window.__xss === 1);
        expect(executed).toBe(false);
    });
});

test.describe('sensitive files', () => {
    for (const path of ['/.env', '/.git/config', '/storage/logs/laravel.log', '/composer.json']) {
        test(`${path} is not publicly served`, async ({ request }) => {
            const res = await request.get(path, { failOnStatusCode: false });
            expect(res.status()).toBeGreaterThanOrEqual(400);
        });
    }
});
