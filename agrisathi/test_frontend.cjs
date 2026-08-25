const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  console.log('Navigating to http://localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('Page loaded.');
    const content = await page.content();
    console.log('Root HTML size:', content.length);
    const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    console.log('Root element HTML length:', rootHtml.length);
    if (rootHtml.length < 10) {
      console.log('Root element is nearly empty:', rootHtml);
    }
  } catch (err) {
    console.log('Navigation failed:', err.message);
  }

  await browser.close();
})();
