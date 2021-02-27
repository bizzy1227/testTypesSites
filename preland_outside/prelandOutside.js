const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let opts = new chrome.Options();
const CONSTS = require('../consts');

let capabilities = false;
let driver;
let prelandOutsideResult = {
    relink: false,
    yandex: false,
    error: false
};

const handlePrelandOutside = async function(optinos) {
    capabilities = optinos.cp;
    

    if (capabilities) {
        driver = await new Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub')
        .withCapabilities(capabilities).setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless']))
        .build();
    } else {
        opts.addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors'])
        driver = await new Builder().forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
    }

    try {    
        optinos.inputURL = await setTestQueryParams(optinos.inputURL);

        // переходим на ссылку с параметрами дял dev
        await driver.get(optinos.inputURL.href);

        await clickLink(driver, optinos.inputURL);

        console.log(new URL(await driver.getCurrentUrl()));

        prelandOutsideResult.relink = await checkRelink(driver, optinos.relink);

        prelandOutsideResult.yandex = await checkYandex(driver, optinos.yandex);

        console.log('end test', prelandOutsideResult);

        return prelandOutsideResult;

    } catch (error) {
        console.log(error)
    }
}

const clickLink = async function(driver, inputURL) {
    let link;

    console.log('in block clickLink');

    let links = await driver.findElements(By.xpath('//a'));

    // взять ссылку которую видно
    for(i of links) {
        if (await i.isDisplayed() === true) {
            link = i;
            break;
        }
        else continue;
    };        
    let href = await link.getAttribute('href');
    let testNodeUrl = new URL(href);
    if (testNodeUrl.protocol === 'chrome-error:') {
        if (writeLogsForm) {
            logger.log({
                level: 'error',
                message: href,
                URL: inputURL.href,
                capabilities: capabilities
            });
        }
        driver.quit();
        prelandOutsideResult.error = { device: await getDeviceName('device'), browser: await getDeviceName('browser'), result: {error:  href, capabilities: capabilities, URL: inputURL.href} };
        return prelandOutsideResult;
    }

    await link.click();

    await driver.sleep(5000);
}

async function getDeviceName(requestField) {
    let nameDevice;
    if (capabilities) {
        if (requestField === 'device') {
            if (capabilities.device) {
                nameDevice = `${capabilities.device}, ${capabilities.os_version}`;
                return nameDevice;
            }
            else if (capabilities.os) {
                nameDevice = `${capabilities.os}, ${capabilities.os_version}`;
                return nameDevice;
            }
        }
        if (requestField === 'browser') {
            nameDevice = `${capabilities.browserName}`;
            return nameDevice;
        }

    }
}

async function setTestQueryParams(inputURL) {
    // добавляем параметры для отправки на dev.neogara
    let searchParams = inputURL.searchParams;
    searchParams.set('action', 'test');
    searchParams.set('pid', 'kag318');
    searchParams.set('group', '1');
    inputURL.search = searchParams.toString();
    return inputURL;
}

async function checkRelink(driver, relink) {
    let testURL = new URL(await driver.getCurrentUrl());
    if (relink === testURL.origin + testURL.pathname) {
        return true;
    }
    else {
        return false;
    }
}

async function checkYandex(driver, yandex) {
    let testURL = new URL(await driver.getCurrentUrl());
    if (testURL.searchParams.has('yand') && yandex === testURL.searchParams.get('yand')) {
        return true;
    }
    else {
        return false;
    }
}

module.exports.handlePrelandOutside = handlePrelandOutside;