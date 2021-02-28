const SaveJson = require('./save_json/saveJson');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let opts = new chrome.Options();

const PrelandOutside = require('./preland_outside/prelandOutside');
const Land = require('./land/land');
const deviceSettings = require('./devices');

const switcher = async function(optionsSwitcher) {
    console.log('in switcher');

    let driver;
    // console.log('optionsSwitcher', optionsSwitcher)
    let jsonData = await SaveJson.saveJson(optionsSwitcher.inputURL);

    try {
        
        if (optionsSwitcher.device) {
            driver = await new Builder().usingServer('http://hub-cloud.browserstack.com/wd/hub')
            .withCapabilities(optionsSwitcher.device).setChromeOptions(new chrome.Options().addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors', '--headless']))
            .build();
        } else {
            opts.addArguments(['--ignore-certificate-errors', '--ignore-ssl-errors'])
            driver = await new Builder().forBrowser('chrome')
            .setChromeOptions(opts)
            .build();
        }

        let options = {
            driver: driver,
            inputURL: new URL(optionsSwitcher.inputURL),
            email: optionsSwitcher.email,
            capabilities: optionsSwitcher.device,
            relink: jsonData.jsonData.relink,
            yandex: jsonData.jsonData.yandex
        }

        if (optionsSwitcher.typeSite === 'prelandOutside') {
            console.log('in prelandOutside');
            const resultTest = await PrelandOutside.handlePrelandOutside(options);
            console.log('resultTest', resultTest);
            return resultTest;
        }
        if (optionsSwitcher.typeSite === 'land') {
            console.log('in land');
            let resultTest = await Land.handleLand(options);
            console.log('resultTest', resultTest);
            return resultTest;
        }
        if (optionsSwitcher.typeSite === 'prelandWithLand') {
            console.log('in prelandWithLand');
            let resultTest = {
                preland: false,
                land: false
            }
            resultTest.preland = await PrelandOutside.handlePrelandOutside(options);
            // если локально расположен ленд - добавляем к урлу релинк в pathname
            options.inputURL.pathname = options.relink;
            // console.log('options', options);
            resultTest.land = await Land.handleLand(options);
            console.log('from return with switcher resultTest', resultTest);
            return resultTest;
        }
    } catch (error) {
        console.log(error)
    } finally {
        driver.quit();
    }

}

module.exports.switcher = switcher;