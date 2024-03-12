import { test, expect } from '@playwright/test';
import { DOCS_URL } from '../../src/shared/constants';

test.describe('general landing page tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has title', async ({ page }) => {
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/SaaS/);
  });

  test('get started link', async ({ page }) => {
    await page.getByRole('link', { name: 'Get started' }).click();
    await page.waitForURL(DOCS_URL);
  });

  test('headings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Some cool words' })).toBeVisible();
  });
});
