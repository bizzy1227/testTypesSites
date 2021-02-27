
const DEV_NEOGARA_CRM_URL = 'https://dev.admin.neogara.com/';
const DEV_NEOGARA_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibG9naW4iOiJhZG1pbiIsInJvbGVzIjpbIlBJUEVMSU5FX1JFQUQiLCJQSVBFTElORV9FRElUIiwiU1VQRVJfQURNSU4iXSwiY3JlYXRlZEF0IjoxNjEzNjQxNDQ4MjAyLCJpYXQiOjE2MTM2NDE0NDh9.MVBz_c8DMyxjXpepw_q_sHx0xcFlQ_I_MSVnULJIzTo';

const PROXY = {
    'US': '206.189.189.81:3128',
    'PL': '45.159.147.232:8000'
};

const USER_DATA = {
    firstname: 'test',
    lastname: 'test',
    sendFormEmailErrors: 'testmail5@gmail.com',
    emailWebErrors: 'testmail6@gmail.com',
    autoSendFormEmailErrors: 'testmail7@gmail.com',
    autoEmailWebErrors: 'testmail8@gmail.com',
    tel: 9111111111
};

module.exports.USER_DATA = USER_DATA;
module.exports.PROXY = PROXY;
module.exports.DEV_NEOGARA_CRM_URL = DEV_NEOGARA_CRM_URL;
module.exports.DEV_NEOGARA_AUTH_TOKEN = DEV_NEOGARA_AUTH_TOKEN;