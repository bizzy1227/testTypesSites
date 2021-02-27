const SaveJson = require('./save_json/saveJson');
const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
let opts = new chrome.Options();

const PrelandOutside = require('./preland_outside/prelandOutside');
const Land = require('./land/land');
const deviceSettings = require('./devices');

const switcher = async function(inputURL, typeSite = 'prelandWithLand', capabilities = false) {
    inputURL = await new URL('https://powblzaslwflzkzis.info/');

    let driver;

    let jsonData = await SaveJson.saveJson(inputURL.href);

    try {
        
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

        let options = {
            driver: driver,
            inputURL: inputURL,
            capabilities: capabilities,
            relink: jsonData.jsonData.relink,
            yandex: jsonData.jsonData.yandex
        }

        if (typeSite === 'prelandOutside') {
            console.log('in prelandOutside');
            let resultTest = await PrelandOutside.handlePrelandOutside(options);
            console.log('resultTest', resultTest);
            return resultTest;
        }
        if (typeSite === 'land') {
            console.log('in land');
            let resultTest = await Land.handleLand(options);
            console.log('resultTest', resultTest);
            return resultTest;
        }
        if (typeSite === 'prelandWithLand') {
            console.log('in prelandWithLand');
            let resultTest = {
                preland: false,
                land: false
            }
            resultTest.preland = await PrelandOutside.handlePrelandOutside(options);
            // если локально расположен ленд - добавляем к урлу релинк в pathname
            options.inputURL.pathname = options.relink;
            console.log('options', options);
            resultTest.land = await Land.handleLand(options);
            console.log('resultTest', resultTest);
            return resultTest;
        }
    } catch (error) {
        console.log(error)
    } finally {
        driver.quit();
    }

}

switcher();