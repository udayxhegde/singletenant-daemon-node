//app.ts
const logHelper = require("./utils/loghelper");
const identity = require('@azure/identity');


require('dotenv').config();
require('isomorphic-fetch');

var endpoint:string;
var apis = ["/first", "/second", "/third"];
var credential;
var audience:string;


appInit();

function appInit() {
    logHelper.init();
    var freqInSecs:number = +process.env.FREQUENCY_IN_SECONDS;
    endpoint = process.env.ENDPOINT;
    audience = process.env.AUDIENCE;

    credential = new identity.ManagedIdentityCredential(process.env.CLIENT_ID);
    
    setInterval(processAllApis, freqInSecs * 1000 );
    logHelper.logger.info("Api info now running every %d seconds", freqInSecs);
}

function processAllApis()
{
    var token = null;

    //
    // This is simply an example, to show that I am calling get and post 
    // on multiple APIs on my server
    //
    
    apis.forEach(function(api) {
        logHelper.logger.info("calling api %s, %s", endpoint, api);

        let token;

        return credential.getToken(audience)
        .then (function(result) {
            token= result.token;        
            return callMyApi(endpoint+api, token, {method:"GET"});
        })
        .then(function(response) {
            logHelper.logger.info("Get response %o", response);
            return callMyApi(endpoint+api, token, {method:"POST", body:""});
        })
        .then(function(response) {
            logHelper.logger.info("post response %o", response);
        })
        .catch(function(error) {
            logHelper.logger.info("error %o", error);
        });
    });
}


async function callMyApi(endpoint, token, payload)
{
    const headers = new Headers();

    if (token != null) {
        const bearer = `Bearer ${token}`;
        headers.append("Authorization", bearer);
    }
    payload.headers = headers;   
    logHelper.logger.info('request made to %s API at: ' + new Date().toString(), endpoint);
    return fetch(endpoint, payload)
    .then(function(response) {
        return response.json();
    })
}