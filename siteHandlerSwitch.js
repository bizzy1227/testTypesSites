const PrelandOutside = require('./preland_outside/prelandOutside');
const deviceSettings = require('./devices');


const switcher = async function(inputURL, typeSite, cp) {
    // get json
    // if (typeSite === 'prelandOutside') {
        let options = {
            inputURL: new URL('https://pulszaqnesu.info/'),
            typeSite: 'typeSite',
            cp: false,
            relink: 'https://bavnoklpdpl.info/',
            yandex: '72946891'
        }
        PrelandOutside.handlePrelandOutside(options);
    // }
}

switcher();