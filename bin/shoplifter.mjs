#!/usr/bin/env node

"use strict";

import {Asset} from "../src/Asset.mjs";
import {ScriptTag} from "../src/ScriptTag.mjs";

let args = process.argv.slice(2),
    command = args.shift().split(':'),
    type = command[0],
    method = command[1];

if(type === 'asset'){
    //new Asset(console.log)[method](...args);
    new Asset()[method](...args);
}
else if(type === 'tag'){
    //new ScriptTag(console.log)[method](...args);
    new ScriptTag()[method](...args);
}