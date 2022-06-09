import {Remote} from "./Remote.mjs";
import {Asset} from "./Asset.mjs";

export class ScriptTag extends Remote {

    defaultOptions = {
        display_scope: 'online_store',
        event: 'onload'
    }

    async post(...args) {
        return await this.createOrUpdate(...args);
    }

    async put(...args) {
        return await this.createOrUpdate(...args);
    }

    async upsert(...args) {
        if(args.length > 1 && /^auto$|^\d{10,}$/.test(args[1])){
            args[1] = 'auto';
        }else{
            args.splice(1,0,'auto');
        }

        return await this.createOrUpdate(...args);
    }

    async find(filename) {
        let resp = await this.get();
        return resp.script_tags.filter(scriptTag => scriptTag.src.indexOf(filename) > -1);
    }

    async findid(filename) {
        let found = await this.find(filename);
        if (found && found.length > 0) {
            this.emitter(found[0].id);
            return found[0].id
        }

        throw new Error(`no existing script tag for ${filename} found :(`);
    }

    async createOrUpdate(...args) {
        let file = args.shift(),
            method = /^auto$|^\d{10,}$/.test(args[0]) ? 'PUT' : 'POST',
            id = method === 'PUT' ? args.shift() : null,
            url,
            options = args.reduce((obj, item) => {
                let [key, value] = item.split('=');
                obj[key.replace(/[^\w]/g, '')] = value.replace(/"/g, '');

                return obj;
            }, {});

        options = {...this.defaultOptions, ...options};

        if (id === 'auto') {
            id = await this.findid(file);
        }

        if (id) {
            options.id = id;
        }

        url = method === 'PUT' ? `/script_tags/${id}.json` : '/script_tags.json';

        if (!/^http/.test(file)) {
            //fetch public url of asset...
            let remoteAsset = await (new Asset()).get(file);
            file = remoteAsset.asset.public_url;
        }

        options.src = file;
        let resp = await this.request(url, method, JSON.stringify({
            script_tag: options
        }));
        this.emitter(resp);
        return resp;

    }

    async get(id) {
        let url = '/script_tags';
        if (id) {
            url += `/${id}.json`;
        } else {
            url += '.json';
        }

        let resp = await this.request(url, 'GET');
        this.emitter(resp);
        return resp;
    }

    async count(src) {
        let url = '/script_tags/count.json';
        if (src) {
            url += `?src=${encodeURIComponent(src)}`;
        }

        let resp = await this.request(url, 'GET');
        this.emitter(resp);
        return resp;
    }

    async delete(key) {
        let resp = await this.request(`/script_tags/${key}.json`, 'DELETE');
        this.emitter(resp);
        return resp;
    }

    async deleteforfile(filename) {
        return await this.delete(await this.findid(filename));
    }
}