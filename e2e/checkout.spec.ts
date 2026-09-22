import { expect, test } from '@playwright/test';

test('guest can register, add a product, and complete checkout', async ({ page }) => {
  const stamp = Date.now();
  const email = `e2e-${stamp}@oneset.tn`;

  await page.goto('/register');
  await page.getByLabel('First name').fill('E2E');
  await page.getByLabel('Last name').fill('Tester');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Password123');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/account/);

  await page.goto('/shop');
  await page.locator('article').first().getByRole('link').first().click();
  await expect(page).toHaveURL(/\/products\//);

  const variantButtons = page.locator('fieldset button');
  if (await variantButtons.count()) {
    await variantButtons.first().click();
  }

  await page.getByRole('button', { name: /add to cart/i }).click();

  // "Add to cart" opens the drawer automatically — wait for it (auto-waiting,
  // unlike isVisible()) instead of manually toggling the header cart button.
  const checkoutLink = page.getByRole('link', { name: 'Go to checkout' });
  await expect(checkoutLink).toBeVisible();
  await checkoutLink.click();
  await expect(page).toHaveURL('/checkout');

  const newAddressOption = page.getByText('Use a new address', { exact: true });
  if (await newAddressOption.count()) {
    await newAddressOption.click();
  }

  await expect(page.getByLabel('Full name')).toBeVisible();
  await page.getByLabel('Full name').fill('E2E Tester');
  await page.getByLabel('Phone').fill('20123456');
  await page.getByLabel('Address line 1').fill('12 Rue de la Liberté');
  await page.getByLabel('City').fill('Tunis');
  await page.getByLabel('Postal code').fill('1000');

  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await page.getByRole('button', { name: /^Pay / }).click();

  await expect(page).toHaveURL(/\/orders\//);
  await expect(page.getByText('Order confirmed')).toBeVisible();
  await expect(page.getByText(/Order ONE-/)).toBeVisible();
});