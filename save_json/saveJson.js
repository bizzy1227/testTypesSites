const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const saveJson  = async function(inputURL) {
    let resultSaveJson = {
        jsonData: false,
        error: false
    };
    console.log('in saveJson');
    // '--headless'
    let driver = await new Builder().forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless', '--disable-gpu', '--no-sandbox']))
    .build();

    try {
        let nodeURL = new URL(inputURL);

        nodeURL.pathname = '/settings.json';
        await driver.get(nodeURL.href);

        let elements = await driver.findElements(By.css('pre'));
        let jsonData = JSON.parse(await elements[0].getText());
        resultSaveJson.jsonData = jsonData;

        // console.log('resultSaveJson', resultSaveJson);

        return resultSaveJson;

    } catch (error) {
        return resultSaveJson.error = { hasError: true, result: { err: error.message, URL: nodeURL.href } };
    } finally {
        driver.quit();
    }
}

module.exports.saveJson = saveJson;