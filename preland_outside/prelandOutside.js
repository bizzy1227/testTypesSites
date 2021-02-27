const { By } = require('selenium-webdriver');

let capabilities = false;
let driver;
let prelandOutsideResult = {
    device: false,
    browser: false,
    relink: false,
    yandex: false,
    error: false
};

const handlePrelandOutside = async function(optinos) {
    console.log('in handle preland outside');

    capabilities = optinos.capabilities;
    driver = optinos.driver;


    try {    
        optinos.inputURL = await setTestQueryParams(optinos.inputURL);

        // переходим на ссылку с параметрами дял dev
        await driver.get(optinos.inputURL.href);

        await clickLink(driver, optinos.inputURL);

        console.log(new URL(await driver.getCurrentUrl()));

        prelandOutsideResult.device = await getDeviceName('device');
        
        prelandOutsideResult.browser = await getDeviceName('browser'),

        prelandOutsideResult.relink = await checkRelink(driver, optinos.relink);

        prelandOutsideResult.yandex = await checkYandex(driver, optinos.yandex);

        console.log('end test', prelandOutsideResult);

        return prelandOutsideResult;

    } catch (error) {
        console.log(error);
        prelandOutsideResult.error = { device: await getDeviceName('device'), browser: await getDeviceName('browser'), result: {error:  error.message, capabilities: capabilities, URL: optinos.inputURL.href} };
        return prelandOutsideResult;
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
    if (relink.startsWith('http')) {
        let nodeRelinkURL = new URL(relink);
        if (nodeRelinkURL.origin === testURL.origin) {
            return true;
        }
        else {
            return false;
        }
    }
    if (relink.startsWith('/')) {
        if (relink === testURL.pathname) {
            return true;
        }
        else {
            return false;
        }
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