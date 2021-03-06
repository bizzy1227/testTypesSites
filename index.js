const fs = require("fs");

const deviceSettings = require('./devices');
const parseNeogara = require('./parsers/neogaraParser');
const CONSTS = require('./consts');
const handlerSwitch = require('./siteHandlerSwitch')

let startDate;
let lastResultObj = {};
let additionalСhecks = 0;
let updatedSiteQuery = [];

const runServer = async function(sites, typeRun, typeSites) {
    // обновляем при каждом запросе данные
    lastResultObj = {};
    updatedSiteQuery = [];
    additionalСhecks = 0;

    let mainRespone = {};



    console.log('server side sites', sites);

    // настрока времени старта
    startDate = new Date().toISOString();
    console.log(startDate);

    // добавляем количество сайтов для проверки запросов
    additionalСhecks += deviceSettings.DEVICES.length;

    for (let i of sites) {
        console.log('in loop for', i);
        // результаты обработок
        let selfUpdateResult = null;
        let checkJsonResult;
        const testResult = [];
        let lighthouseResult;


        let inputURL = '';
        // проверка на домен и если надо добавляем https://
        if (i.match(/^https:\/\//)) inputURL = i;
        else inputURL = 'https://' + i;

        let nodeUrl = new URL(inputURL);

        let options = {
            inputURL: nodeUrl.href,
            email: await getEmail('sendFormErrors'),
            device: false,
            typeSite: 'prelandWithLand'
        }

        for (const device of deviceSettings.DEVICES) {
            options.device = device;
            testResult.push(await handlerSwitch.switcher(options));
        }

        console.log('testResult after loop', testResult)    

        updatedSiteQuery.push(nodeUrl.href);

        mainRespone[nodeUrl.href] = {
            selfUpdateResult: selfUpdateResult,
            checkJsonResult: checkJsonResult,
            testResult: testResult,
            lighthouseResult: lighthouseResult,
            neogaraResults: true
        }

    }

    let neogaraRes = await checkNeogara(startDate, await getEmail('sendFormErrors'));
    if (Object.keys(lastResultObj).length !== 0) {
        for (let key in lastResultObj) {
            if (neogaraRes === 'neogara is empty') mainRespone[key].neogaraResults = neogaraRes;
            else mainRespone[key].neogaraResults = lastResultObj[key];
        }
    }


    console.log('log response mainRespone', JSON.stringify(mainRespone));
    return mainRespone;
}

runServer([
  'powblzaslwflzkzis.info/b.php'
]);

const runServerWebErrors = async function(sites, typeRun) {
  // обновляем при каждом запросе данные
  // lastResultObj = {};
  // updatedSiteQuery = [];
  // additionalСhecks = 0;

  let mainRespone = {};
  let webErrors;


  console.log('server side sites web errors', sites);

  for (let i of sites) {

    webErrors = [];

    let inputURL = '';
    // проверка на домен и если надо добавляем https://
    if (i.match(/^https:\/\//)) inputURL = i;
    else inputURL = 'https://' + i;
  
    let nodeUrl = new URL(inputURL);

    webErrors = await sendModule.checkSend(nodeUrl, true, false, false, false, false, await getEmail(typeRun));


    console.log('before mainRespone', mainRespone);
    
    mainRespone[nodeUrl.origin + nodeUrl.pathname] = {
      webErrors: webErrors
    }

    console.log('after mainRespone', mainRespone);

  }

  console.log('log response mainRespone', JSON.stringify(mainRespone));
  return mainRespone;
}

const autoRunServerWebErrors = async function() {
  // получаем список сайтов
  let siteQuery = fs.readFileSync("../inputAutoWebErrors.txt", "utf8");
  siteQuery = siteQuery.replace(/\r/g, '');
  siteQuery = siteQuery.split('\n');

  console.log('server side sites web errors auto', siteQuery);

  for (let i of siteQuery) {

    let inputURL = '';
    // проверка на домен и если надо добавляем https://
    if (i.match(/^https:\/\//)) inputURL = i;
    else inputURL = 'https://' + i;
  
    let nodeUrl = new URL(inputURL);

    await sendModule.checkSend(nodeUrl, true, false, false, true, false);


  }
}

const autoRunServerFormErrors = async function() {
    // получаем список сайтов
    let siteQuery = fs.readFileSync("../inputAutoWebErrors.txt", "utf8");
    siteQuery = siteQuery.replace(/\r/g, '');
    siteQuery = siteQuery.split('\n');
  
    console.log('server side sites form errors auto', siteQuery);

    for (let i of siteQuery) {

      let inputURL = '';
      // проверка на домен и если надо добавляем https://
      if (i.match(/^https:\/\//)) inputURL = i;
      else inputURL = 'https://' + i;
    
      let nodeUrl = new URL(inputURL);
  
      // делаю selfUpdate для каждого сайта
      // await selfUpdateModule.selfUpdate(nodeUrl.href, true);
  
      // проверка settings.json на каждом сайте
      await checkJsonModule.checkJson(nodeUrl.href, true);
  
      // запуск для теста формы для разных девайсов c browserstack
      for (let device of deviceSettings.DEVICES) {
        await sendModule.checkSend(nodeUrl, false, device, false, false, true);
      }
  
    }
}

async function getEmail(typeRun) {
    if (typeRun === 'webErrors') return CONSTS.USER_DATA['emailWebErrors'];
    if (typeRun === 'sendFormErrors') return CONSTS.USER_DATA['sendFormEmailErrors'];
    if (typeRun === 'autoWebErrors') return CONSTS.USER_DATA['autoEmailWebErrors'];
    if (typeRun === 'autoSendFormErrors') return CONSTS.USER_DATA['autoSendFormEmailErrors'];
}

// checkNeogara для работы с сайтами после всех итераций
async function checkNeogara(startDate, email) {
  console.log('in checkNeogara', startDate);
  
  const neogararesults = await parseNeogara.NeogaraGetConversions(startDate, 0, email);
  
  for (let sqIndex of updatedSiteQuery) {
    lastResultObj[sqIndex] = [];
  }

  console.log('lastResultObj empty: ', lastResultObj);
  console.log('neogararesults', neogararesults);

  if (neogararesults.length === 0) return 'neogara is empty'
  
  let count = neogararesults[0].totals.count;
  let total = neogararesults[0].totals.total;
  // добавляем +1 для следующего запроса
  let page = neogararesults[0].totals.page + 1;
  let pageCount = neogararesults[0].totals.pageCount;
  
  // console.log('new test log in neogara', total, updatedSiteQuery.length * additionalСhecks);
  // возвращаемся из функции если совпало количество конверсий с количеством запросов
  if (total === updatedSiteQuery.length * additionalСhecks) {
    console.log('better outcome condition');
    lastResultObj = {};
    return lastResultObj;
  }  

  let allConversions = [];
  // пушим сразу первые данные
  // allConversions.push(neogararesults);
  neogararesults.forEach(conv => allConversions.push(conv));
  
  // пушим следующие конверсии в массив
  if(pageCount > 1) {
    for (page; page <= pageCount; page++) {
      let newConvs = await parseNeogara.NeogaraGetConversions(startDate, page, email);
      await newConvs.forEach(conv => allConversions.push(conv));
    }
  }

  console.log('all allConversions', allConversions);
  

  for (let conversion of allConversions) {
    let convNodeUrl = new URL(conversion.ref);
    for (let sqIndex of updatedSiteQuery) {
      let queryNodeUrl = new URL(sqIndex);
      if (convNodeUrl.host === queryNodeUrl.host && conversion.email === email) {
        lastResultObj[sqIndex].push(conversion);
      }
    }
  }

  console.log('lastResultObj before check: ', lastResultObj);

  // в конце удаляем те сайты, которые имеют в себе лидов ровно столько сколько было отправлено форм
  // если лидо не ровно - какая-то отправка сфейлилась
  for (let key in lastResultObj) {
    if (lastResultObj[key].length === additionalСhecks) {
      delete lastResultObj[key];
    }
  }

  console.log('lastResultObj after delete: ', lastResultObj);

  // пушим в новый файл сайты которы имеют ошибку после теста
  if (Object.keys(lastResultObj).length !== 0) {
    let keysObj = Object.keys(lastResultObj)
    console.log(keysObj);
    keysObj.forEach(key => {
      fs.appendFile('inputAfterTest.txt', key + '\n', function (err) {
        if (err) throw err;
      });
    })
    console.log('results saved!');
  }

}

module.exports.runServer = runServer;
module.exports.runServerWebErrors = runServerWebErrors;
module.exports.autoRunServerWebErrors = autoRunServerWebErrors;
module.exports.autoRunServerFormErrors = autoRunServerFormErrors;
