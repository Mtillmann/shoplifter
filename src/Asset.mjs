import {Remote} from "./Remote.mjs";
import {promises as fs} from 'fs';


export class Asset extends Remote {

    async get(key = null) {
        let url = `/themes/${this.THEME_ID}/assets.json`;

        if (key) {
            console.log('asset:get - only fetching key and public_url for single asset...');
            url += `?asset[key]=${encodeURIComponent(key)}&fields=key,public_url`;
        }

        let resp = await this.request(url, 'GET');
        this.emitter(resp);
        return resp;
    }

    async put(key, content) {
        if (content.length < 255 && /\.\w{2,}$/.test(content)) {
            console.log(`asset:put - reading ${content} as file...`);
            content = await fs.readFile(content, 'utf-8');
        }

        let resp = await this.request(`/themes/${this.THEME_ID}/assets.json`, 'PUT', JSON.stringify({
            asset: {
                key,
                value: content
            }
        }));

        this.emitter(resp)
        return resp;
    }

    async delete(key) {
        let url = `/themes/${this.THEME_ID}/assets.json?asset[key]=${encodeURIComponent(key)}`;

        let resp = await this.request(url, 'DELETE');
        this.emitter(resp);
        return resp;
    }
}