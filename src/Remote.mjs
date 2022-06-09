import 'dotenv/config';
import fetch from 'node-fetch';

export class Remote {

    SHOPIFY_ACCESS_TOKEN = null;
    THEME_ID = null;
    MYSHOPIFY_DOMAIN = null;
    API_VERSION = null;
    BASE_URL = null;

    emitter = function () {
    };

    constructor(emitter) {
        if (emitter) {
            this.emitter = emitter;
        }
        this.SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
        this.THEME_ID = process.env.THEME_ID;
        this.MYSHOPIFY_DOMAIN = process.env.MYSHOPIFY_DOMAIN;
        this.API_VERSION = process.env.API_VERSION;
        this.BASE_URL = `https://${this.MYSHOPIFY_DOMAIN}.myshopify.com/admin/api/${this.API_VERSION}/`;
    }

    buildURL(URLFragrment) {
        if (/^https/.test(URLFragrment)) {
            //assume complete URL
            return URLFragrment;
        }

        return this.BASE_URL.replace(/[\/]*$/, '') + '/' + URLFragrment.replace(/^[\/]*/, '')
    }

    async request(url, method, body) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': this.SHOPIFY_ACCESS_TOKEN
            }
        };

        if (body) {
            options.body = body;
        }

        url = this.buildURL(url);

        let responseError = null;

        const response = await fetch(url, options)
            .catch(error => {
                responseError = error;
            });

        if (responseError) {
            throw new Error(responseError);
        }

        const responseData = await response.json();
        return responseData;
    }
}