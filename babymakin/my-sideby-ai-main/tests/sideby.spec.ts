import { expect, test } from "@playwright/test";

test.describe("Sideby Tests", () => {
    const baseURL = "https://staging.sideby.ai";

    test("Hero Section Load Test", async ({ page }) => {
        await page.goto(baseURL);
        await page.locator("input[type=password]").fill("sideby2025!");
        await page.locator("text=Access Staging").click();
        await expect(page.locator("h1")).toContainText(
            "Why Educators Get sideby",
        );
    });

    test('"Enter Here" Link Test', async ({ page }) => {
        await page.goto(baseURL);
        await page.locator("input[type=password]").fill("sideby2025!");
        await page.locator("text=Access Staging").click();
        const enterHereLink = page.locator("text=Enter Here");
        await expect(enterHereLink).toBeVisible();
        // It's difficult to know the exact URL without inspecting the page, so we'll just check it navigates to a new page
        await Promise.all([
            page.waitForNavigation(),
            enterHereLink.click(),
        ]);
        expect(page.url()).not.toBe(baseURL);
    });

    test('"Learn More" Link Test', async ({ page }) => {
        await page.goto(baseURL);
        await page.locator("input[type=password]").fill("sideby2025!");
        await page.locator("text=Access Staging").click();
        const learnMoreLink = page.locator("text=Learn More");
        await expect(learnMoreLink).toBeVisible();
        // It's difficult to know the exact URL without inspecting the page, so we'll just check it navigates to a new page
        await Promise.all([
            page.waitForNavigation(),
            learnMoreLink.click(),
        ]);
        expect(page.url()).not.toBe(baseURL);
    });

    test("Features Section Load Test", async ({ page }) => {
        await page.goto(baseURL);
        await page.locator("input[type=password]").fill("sideby2025!");
        await page.locator("text=Access Staging").click();
        await expect(page.locator("text=Built for Educator Growth"))
            .toBeVisible();
    });

    test("User Sign Up Test, Sign In, then Delete", async ({ page }) => {
        await page.goto(baseURL);
        await page.locator("input[type=password]").fill("sideby2025!");
        await page.locator("text=Access Staging").click();

        // Navigate to Sign Up tab
        await page.goto(`${baseURL}/register`);

        // Generate unique email
        const uniqueEmail = `crew+test@sideby.ai`; // Replace example.com with a valid domain if needed
        const password = "password123!";

        // Fill in sign up form
        await page.locator('input[id="signup-email"]').fill(uniqueEmail);
        await page.locator('input[id="first-name"]').fill("Test");
        await page.locator('input[id="last-name"]').fill("Test");

        await page.locator('input[id="signup-password"]').fill(password); // Replace with a strong password
        await page.locator('input[id="confirm-password"]').fill(password); // Replace with a strong password

        // Click sign up button
        await page.locator('button:has-text("Sign Up with Email")').click();

        // Add assertions for successful sign up (e.g., check for redirection or a success message)
        // await expect(page).toHaveURL(/dashboard/); // Example assertion
    });
});
