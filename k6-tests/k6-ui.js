import { browser } from 'k6/experimental/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    ui_test: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
    },
  },
};

export default async function () {
  const page = browser.newPage();
  await page.goto('https://study-buddy.duckdns.org/login');

  await page.locator('input[name="email"]').type('user@example.com');
  await page.locator('input[name="password"]').type('mypassword');
  await page.locator('button[type="submit"]').click();

  check(page, {
    'logged in successfully': async () =>
      (await page.locator('text=Dashboard').count()) > 0,
  });

  await page.close();
}
