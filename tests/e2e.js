const wdio = require('webdriverio');
const { sleep } = require('./helper');

const opts = {
  port: 4723,
  hostname: '127.0.0.1',
  capabilities: {
    platformName: process.env.APPIUM_PLATFORM ?? 'mac',
    browserName: 'chrome',
    'appium:automationName': 'Chromium',
  },
};

// Strapi Login Info
const email = process.env.STRAPI_USER_EMAIL;
const password = process.env.STRAPI_USER_PASSWORD;

// Content Type to be tested
const targetContentType = 'article';

// Field name to be tested
const targetFieldName = 'content';

async function main() {
  const client = await wdio.remote(opts);
  await client.url('http://localhost:1337/admin');

  const emailField = await client.$('[name="email"]');
  await emailField.setValue(email);

  const passwordField = await client.$('[name="password"]');
  await passwordField.setValue(password);

  const submit = await client.$('button[type="submit"]');
  await submit.click();

  const contentLink = await client.$('a[aria-label="Content Manager"]');
  await contentLink.waitForDisplayed({ timeout: 3000 });
  await contentLink.click();

  const ctLink = await client.$('nav[aria-label="Content Manager"] a');
  await ctLink.waitForDisplayed({ timeout: 3000 });
  await ctLink.click();
  await sleep(2000);

  const contentManagerLinks = await client.$$('main a[href]');
  for (let key in contentManagerLinks) {
    const link = contentManagerLinks[key];
    if (typeof link === 'object') {
      if (typeof link.waitForDisplayed !== 'undefined') {
        await link.waitForDisplayed({ timeout: 3000 });
        const href = await link.getAttribute('href');
        if (href.toLowerCase().includes(targetContentType)) {
          await link.click();
          break;
        }
      }
    }
  }
  const editorLabel = await client.$(`label[id=${targetFieldName}-label]`);
  await editorLabel.waitForDisplayed({ timeout: 3000 });
  await editorLabel.click();

  await client.keys('/');
  await client.keys('\uE015');
  await sleep(1000);
  await client.keys('\uE007');
  await sleep(1000);

  const promptTextarea = await client.$('.prompt-textarea');
  await promptTextarea.waitForDisplayed({ timeout: 3000 });
  await promptTextarea.addValue('Hello World! This is a test of appium');

  // API call
  const promptSubmit = await client.$('.prompt-submit');
  await promptSubmit.click();

  // save
  const sideButtons = await client.$$('aside button');
  for (let key in sideButtons) {
    const button = sideButtons[key];
    if (typeof button === 'object') {
      if (typeof button.isDisplayed !== 'undefined' && (await button.isDisplayed())) {
        const span = await button.$('span');
        const text = await span.getText();
        if (text === 'Save') {
          await button.click();
          break;
        }
      }
    }
  }
  await sleep(3000);

  // reload page
  await client.refresh();

  const textarea = await client.$('.bn-inline-content');
  await textarea.waitForDisplayed({ timeout: 3000 });
  const text = await textarea.getText();
  if (
    text.trim() !==
    'This is a debugging message. It is needed to reduce the cost of using the API each time during development'
  ) {
    throw new Error(`text not expected: ${text}`);
  }
  await client.deleteSession();
}

main().then(() => console.log('@complete'));
