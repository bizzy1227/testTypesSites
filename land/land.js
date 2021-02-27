const { By } = require('selenium-webdriver');
const CONSTS = require('../consts');

let capabilities = false;
let driver;
let landResult = {
    thanks: false,
    error: false
};
let countRedirect = 0;
let usageEmail = 'testmail11@gmail.com';


const handleLand = async function(options) {
    console.log('in handle land');

    capabilities = options.capabilities;
    driver = options.driver;

    try {
        options.inputURL = await setTestQueryParams(options.inputURL);

        // переходим на ссылку с параметрами дял dev
        await driver.get(options.inputURL.href);

        await checkForm(options.driver, options.inputURL);

        return landResult;

    } catch (error) {
        console.log(error);
    } 
}

async function checkLastUrl(driver, inputURL) {
    let currentUrl = new URL(inputURL);

    if (currentUrl.pathname === '/thanks.php') {
        countRedirect = 0;
        console.log('Test send form done', currentUrl.origin + currentUrl.pathname);
        landResult.thanks = { device: await getDeviceName('device'), browser: await getDeviceName('browser'), result: true };
        return landResult;
    }
    else if (currentUrl.pathname !== '/thanks.php') {
        countRedirect++;
        if (countRedirect < 3) {
            await checkForm(driver, currentUrl);
        }
        else {
            console.log(`The limit (${countRedirect}) of clicks on links has been exceeded`, currentUrl.href);
            landResult.error = { device: await getDeviceName('device'), browser: await getDeviceName('browser'), result: { error: `The limit (${countRedirect}) of clicks on links has been exceeded`, capabilities: capabilities, URL: currentUrl.href } };
            countRedirect = 0;
            return landResult;
        }

    }
}

async function checkForm(driver, inputURL) {
    let forms = await driver.findElements(By.css('form'));
    let form;
    // если есть форма
    if (forms.length > 0) {
        for (let item of forms) {
            if (await item.isDisplayed()) {
                form = item;
                break;
             } 
        }
        await fillForm(driver, inputURL, form);
    } else {
        console.log('page without form');
        landResult.error = { device: await getDeviceName('device'), browser: await getDeviceName('browser'), result: {error: 'page without form', capabilities: capabilities, URL: inputURL.href} };
        return landResult;
    }
}

async function fillForm(driver, inputURL, form) {
    
    try {
        let firstname = await form.findElements(By.name('firstname'));
        await setValue('firstname', firstname[0], inputURL);

        let lastname = await form.findElements(By.name('lastname'));
        await setValue('lastname',lastname[0], inputURL);

        let tel = await form.findElements(By.name('phone_number'));
        await setValue('tel',tel[0], inputURL);
    
        let email = await form.findElements(By.name('email'));
        await setValue('email', email[0], inputURL);

        let submit = await form.findElement(By.xpath(`//*[@type='submit']`));
        if (!await submit.isDisplayed()) submit = await form.findElement(By.css(`button`));

        // скролим к кнопке
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'})", submit);
        await driver.sleep(300);

        await driver.executeScript("arguments[0].click()", submit);

        await driver.sleep(5000);
    
        inputURL = new URL(await driver.getCurrentUrl());
        await checkLastUrl(driver, inputURL.href);

    } catch (error) {
        console.log('fill form failed');
        landResult.error = { device: await getDeviceName('device'), browser: await getDeviceName('browser'), result: {error: 'fill form failed', capabilities: capabilities, URL: inputURL.href} };
        return landResult;
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

async function setValue(name, element, inputURL) {
    try {
        console.log('in setValue');
        if (!element) return;

        await element.clear();
        if (name === 'email') {
            console.log('usageEmail', usageEmail);
            await element.sendKeys(usageEmail);
            return;
        }
        await element.sendKeys(CONSTS.USER_DATA[name]);
    } catch (error) {
        console.log(error);
        landResult.error = { device: await getDeviceName('device'), browser: await getDeviceName('browser'), result: {error: error.message, capabilities: capabilities, URL: inputURL.href} };
        return landResult;
    }

}

module.exports.handleLand = handleLand;