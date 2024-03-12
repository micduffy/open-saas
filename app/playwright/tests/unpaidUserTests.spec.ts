import { expect } from '@playwright/test';
import { createLoggedInUserFixture } from './utils';

// Create a new test fixture with an unpaid user and a logged in page
const test = createLoggedInUserFixture({ hasPaid: false, credits: 0 });

test('Demo app: cannot generate schedule', async ({ loggedInPage }) => {
  const task1 = 'create presentation on SaaS';
  const task2 = 'build SaaS app draft';

  await loggedInPage.waitForURL('/demo-app');

  // Fill input id="description" with "create presentation"
  await loggedInPage.fill('input[id="description"]', task1);

  // Click button:has-text("Add task")
  await loggedInPage.click('button:has-text("Add task")');

  await loggedInPage.fill('input[id="description"]', task2);

  await loggedInPage.click('button:has-text("Add task")');

  // expect to find text in a span element
  expect(loggedInPage.getByText(task1)).toBeTruthy();
  expect(loggedInPage.getByText(task2)).toBeTruthy();

  // find a button with text "Generate Schedule" and check it's visible
  const generateScheduleButton = loggedInPage.getByRole('button', { name: 'Generate Schedule' });
  expect(generateScheduleButton).toBeTruthy();

  await Promise.all([
    loggedInPage.waitForRequest(
      (req) => req.url().includes('operations/generate-gpt-response') && req.method() === 'POST'
    ),
    loggedInPage.waitForResponse((response) => {
      // expect the response to be 402 "PAYMENT_REQUIRED"
      if (response.url().includes('/operations/generate-gpt-response') && response.status() === 402) {
        return true;
      }
      return false;
    }),
    // We already started waiting before we perform the click that triggers the API calls. So now we just perform the click
    generateScheduleButton.click(),
  ]);

  // we already show a table with some dummy data even before the API call
  const table = loggedInPage.getByRole('table');
  await expect(table).toBeVisible();
  const tableTextContent = (await table.innerText()).toLowerCase();

  expect(tableTextContent.includes(task1.toLowerCase())).toBeFalsy();
  expect(tableTextContent.includes(task2.toLowerCase())).toBeFalsy();
});
