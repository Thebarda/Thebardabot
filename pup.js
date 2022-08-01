const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  
  await page.evaluate(() => window.Lighthouse = 'couille');

  console.log(await page.evaluate(() => window.Lighthouse));

  await browser.close();
})();