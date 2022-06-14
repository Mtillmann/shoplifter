import {Remote} from "./Remote.mjs";
import {promises as fs} from 'fs';


export class Asset extends Remote {


    /**
     * insert ORIGINAL *before* the extension, otherwise
     * you can't inspect the file in the shopify theme file browser
     *
     * @param key
     * @returns {string}
     */
    backupFilename(key) {
        let filename = key.split('.');
        filename.splice(-1, 0, 'ORIGINAL');

        return filename.join('.');
    }

    async backup(key) {
        this.get(key, null).then(json => {
            let backupFilename = this.backupFilename(key);
            this.put(backupFilename, json.asset.value);
            console.log(`creating backup ${backupFilename} for ${key}`);
        });
    }

    async restore(key) {
        let backupFilename = this.backupFilename(key);
        this.get(backupFilename, null).then(json => {
            this.put(key, json.asset.value);
            console.log(`restoring ${key} from ${backupFilename}`);
        });
    }

    checkBackup(key, createIfMissing) {
        let originalFilename = this.backupFilename(key),
            currentFile;

        this.get(key, null).then(json => {
            currentFile = json
        })
            .catch(() => {
                console.log(`file ${key} not found on remote, aborting`);
            })
            .finally(() => {
                if (currentFile) {
                    this.get(originalFilename, null).then(json => {
                        console.log(`backup for ${key} exists, size differs by ${Math.abs(json.asset.size - currentFile.asset.size)}`);
                    }).catch(e => {
                        console.log(`no backup exists for ${key}`);
                        if(/create-if-missing$/.test(createIfMissing)){
                            this.backup(key);
                        }
                    });
                }
            });
    }

    async get(key = null, singleAssetFields = ['key', 'public_url']) {
        let url = `/themes/${this.THEME_ID}/assets.json`;

        if (key) {
            url += `?asset[key]=${encodeURIComponent(key)}`;
            if (singleAssetFields) {
                url += `&fields=${singleAssetFields}`;
            }
        }

        let resp = await this.request(url, 'GET');
        this.emitter(resp);
        return resp;
    }

    async put(key, content) {
        if (content.length < 255 && /\.\w{2,4}$/.test(content)) {
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