import { test, expect } from '@playwright/test';

test.describe('EducAndes Interactive AI Practice E2E Test', () => {
  test('should log in as a student, navigate to a practice lesson, and resolve with Yachaq', async ({ page, context }) => {
    // Pre-populate localStorage to bypass onboarding screens (language selector and tutorial)
    await context.addInitScript(() => {
      window.localStorage.setItem('educandes-lang', 'es');
      window.localStorage.setItem('educandes-tutorial-done', '1');
    });

    // 1. Visit Auth page
    await page.goto('/auth');

    // 2. Fill login form (María Quispe Demo - Seeded Student)
    await page.fill('input[placeholder*="DNI"]', '12345678');
    await page.fill('input[placeholder*="Contrase"]', 'andes2025');
    
    // Click login button (handles either Spanish 'Ingresar' or Quechua 'Yaykuy')
    const loginButton = page.locator('button[type="submit"]:has-text("Ingresar"), button[type="submit"]:has-text("Yaykuy"), button[type="submit"]:has-text("Mantaña")');
    await loginButton.click();

    // 3. Confirm login succeeded by checking URL redirection
    await expect(page).toHaveURL(/.*(metas|cursos|home)/);

    // 3.5. Dismiss the tutorial modal that is forced open after login
    const skipTutorialBtn = page.locator('button:has-text("Saltar tutorial"), button:has-text("Tutorialta t\'aspiy"), button:has-text("X")').first();
    await expect(skipTutorialBtn).toBeVisible();
    await skipTutorialBtn.click();
    await expect(skipTutorialBtn).not.toBeVisible();

    // 4. Navigate to Crianza de Cuyes course detail page via header navigation (soft navigation)
    const cursosLink = page.locator('a[href="/cursos"]').first();
    await expect(cursosLink).toBeVisible();
    await cursosLink.click();
    await expect(page).toHaveURL(/.*cursos/);

    const cuyesCourseCard = page.locator('a[href="/curso/cuyes"]').first();
    await expect(cuyesCourseCard).toBeVisible();
    await cuyesCourseCard.click();
    await expect(page).toHaveURL(/.*cuyes/);

    // 5. Find Lesson 5 (Enfermedades frecuentes) which is seeded with isPractice: true
    const lessonCard = page.locator('div.rounded-3xl').filter({ hasText: 'Enfermedades frecuentes' }).first();
    await expect(lessonCard).toBeVisible();

    // Click on "Realizar tema" (handles Quechua 'Temata ruwana' or Aymara/Shipibo)
    const doLessonBtn = lessonCard.locator('button:has-text("Realizar tema"), button:has-text("Temata ruwana"), button:has-text("luraña")');
    await expect(doLessonBtn).toBeVisible();
    await doLessonBtn.click();

    // 6. Verify the AI Practice panel trigger button is displayed
    const runAiBtn = page.locator('button:has-text("Resolver caso con Yachaq")');
    await expect(runAiBtn).toBeVisible();
    
    // Open AI Practice panel
    await runAiBtn.click();

    // 7. Verify practice panel has opened
    const chatPanelHeader = page.locator('h2:has-text("Yachaq"), h2:has-text("Taller Práctico")').filter({ visible: true }).first();
    await expect(chatPanelHeader).toBeVisible();

    // 8. Find text input and write a proposal
    const textInput = page.locator('input[placeholder*="propuesta"], input[placeholder*="decisión"]');
    await expect(textInput).toBeVisible();
    await textInput.fill('Propongo aislar de inmediato al cuy enfermo en una poza separada y limpiar todo el corral con cal para evitar que contagie a los demás.');

    // Click send
    const sendBtn = page.locator('button[type="submit"]');
    await sendBtn.click();

    // 9. Verify user message appears in chat history
    const userMsg = page.locator('p:has-text("Propongo aislar de inmediato")');
    await expect(userMsg).toBeVisible();

    // 10. Verify AI responds (wait for the 3rd bubble containing the AI response to appear)
    const bubbles = page.locator('div.flex-1.overflow-y-auto p');
    await expect(bubbles).toHaveCount(3, { timeout: 10000 });

    // 11. Close the overlay cleanly
    const closeBtn = page.locator('button').filter({ visible: true }).filter({ has: page.locator('.lucide-x') }).first();
    await closeBtn.click();
    await expect(chatPanelHeader).not.toBeVisible();
  });
});
