# Shoplifter - Simple Shopify Asset Helper

This helper is intended to work with cli scripts that manage `assets` and `script_tags` of a shopify instance and its
theme.

## Prerequisites

### Tokens and Credentials

You'll need a `SHOPIFY_ACCESS_TOKEN` from your shopify instance. This can be acquired by creating an app inside shopify,
then _to be further described here.._.

Apart from the `SHOPIFY_ACCESS_TOKEN` you'll need a `THEME_ID` if you plan to manage assets, your `MYSHOPIFY_DOMAIN` and
the `API_VERSION` (_2022-04_ may be used as a fallback).

The `MYSHOPIFY_DOMAIN` should is the subdomain of your instance, between _https://_ and _.myshopify.com_,
i.e. `https://THATS_YOUR_MYSHOPIFY_DOMAIN.myshopify.com`

The `THEME_ID` can be found in the URL when you manage or view the theme settings:
`.../themes/THAT_NUMBER_HERE`.

The latest `API_VERSION` can be looked up in the shopify documentation, although _2022_04_ is a safe default since
that's what this client is built on.

### env vars

The credentials are passed as environment variables. During your build process you should pass them as repository
secrets (GitHub) or something similar.

During development, you can pass them by using a .env file in the root of your project:

```dotenv
SHOPIFY_ACCESS_TOKEN=shpat_SOME_HASH
THEME_ID=123456789012
MYSHOPIFY_DOMAIN=averycoolshop
API_VERSION=2022-04
```

> Make sure to `echo .env >> .gitignore`

## Usage

### CLI

After installing (`npm i ... --save`) the package, add a new command to **your project's package.json**:

```json5
{
  //...
  "scripts": {
    //...
    "shoplifter": "shoplifter"
    // key may be whatever, value part is fixed
  }
}
```

This enables you to call the helper like this:

```shell
npm run shoplifter -- asset:get
```

> Make sure you use the `--` between the npm call and the arguments, otherwise the arguments will be passed to `npm`, not to the `shoplifter` binary!

Alternatively you can create a specific command in your package.json like this:

```json5
{
  //...
  "scripts": {
    //...
    "upload-some-asset": "shoplifter asset:put assets/some-script.js dist/some-script.js"
  }
}
```

Calling the script requires no further arguments and inside the script definition there is no need for the `--`.

```shell
npm rum upload-some-asset
```

### Programmatic

Import the class you need, then call the class' methods with the same signature as the CLI arguments (see below):

```ecmascript 6
import {Asset} from '???';

//assuming you have properly set the env vars (see above)

//await variant
const assetList = await new Asset().get();

//promise variante
new Asset().get().then(resp => {
    //...
});

//emitter callback variant
//this should only be used during development. 
//the callback allows for inspection of certain responses
//without interupting internal calls
(new Asset(resp => {
    console.log(resp)
})).get();

// if you have no environment vars, you can set the properties like so:

let asset = new Asset();
asset.SHOPIFY_ACCESS_TOKEN = '...';
asset.MYSHOPIFY_DOMAIN = '...';
asset.THEME_ID = '...';
asset.API_VERSION = '...';

// then proceed as usual
```

## API

### Asset

> Assets are files inside themes.

> the THEME_ID env var controls inside which theme the files are manipulated

#### `asset:put` / `new Asset().put()`

Creates or updates an `asset` on the remote.

| argument    | description                                                                                                                               |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| destination | The destination file, i.e. `assets/some-file.ext`                                                                                         |
| source      | Source content. If the argument looks like a filename, the client will attempt to read it from disk, otherwise the string content is used |

```shell
npm run shoplifter -- asset:put assets/some-script.js dist/some-script.js
```

```ecmascript 6
new Asset().put('assets/some-script.js', 'dist/some-script.js');
```

#### `asset:get` / `new Asset().get()`

Fetches a list or `assets` or single `asset` when key (filename) is given.

| argument       | description                                                                         |
|----------------|-------------------------------------------------------------------------------------|
| key (optional) | when given, only the asset that matches the given key aka filename will be returned |

```shell
npm run shoplifter -- asset:get
```

```ecmascript 6
new Asset().get();
```

```shell
npm run shoplifter -- asset:get assets/some-script.js
```

```ecmascript 6
new Asset().get('assets/some-script.js');
```

#### `asset:delete` / `new Asset().delete()`

Deletes an `asset` on the remote by given filename.

| argument | description                            |
|----------|----------------------------------------|
| key      | remote filename of the asset to delete |

```shell
npm run shoplifter -- asset:delete assets/some-script.js
```

```ecmascript 6
new Asset().delete('assets/some-script.js');
```

### ScriptTag

> changes on script_tags may take several seconds until they appear in the frontend

> script_tags exist outside of themes. All `src`-properties passed must be publicly accessible

> internally `put` and `post` use the same `upsert` method

#### `tag:get` / `new ScriptTag().get()`

| argument      | description                                                        |
|---------------|--------------------------------------------------------------------|
| id (optional) | when given, only the script tag with the given id will be returned | 

```shell
npm run shoplifter -- tag:get
```

```ecmascript 6
new ScriptTag.get();
```

```shell
npm run shoplifter -- tag:get 123456789
```

```ecmascript 6
new ScriptTag.get(123456789);
```

#### `tag:post` / `new ScriptTag().post()`

Creates a new `script_tag`.

| argument                                | description                                                                                                                                                                         |
|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| src                                     | file to be used inside script tag. If given URI does not begin with `http`, it is assumed that it's an "asset key", which is then fetched to acquire the `public_url` of the asset. |
| --event=onload (optional)               | set the event property of the script tag                                                                                                                                            | 
| --cache=false (optional)                | set the cache property of the script tag                                                                                                                                            | 
| --display_scope=online_store (optional) | set the display_scope property of the script tag                                                                                                                                    | 

```shell
npm run shoplifter -- tag:post assets/some-script.js
```

```ecmascript 6
new ScriptTag().post('assets/some-script.js'/*, ... */);
```

#### `tag:put` / `new ScriptTag().put()`

Updates an existing `script_tag`.

| argument | description                                                                                                            |
|----------|------------------------------------------------------------------------------------------------------------------------|
| src      | see above in `post`                                                                                                    |
| id       | either the numeric script tag id _OR_ `'auto'` to find and update the existing script tag that points to the given src |

optional arguments are identical to the post method's arguments.

```shell
npm run shoplifter -- tag:put assets/some-script.js 123455678
npm run shoplifter -- tag:put assets/some-script.js auto
```

```ecmascript 6
new ScriptTag().put('assets/some-script.js', 123455678/*, ... */);
new ScriptTag().put('assets/some-script.js', 'auto'/*, ... */);
```

#### `tag:count` / `new ScriptTag().count()`

Fetches `script_tag`-count from remote.

```shell
npm run shoplifter -- tag:count
```

```ecmascript 6
new ScriptTag().count();
```

#### `tag:delete` / `new ScriptTag().delete()`

Deletes a `script_tag` by given `id`.

```shell
npm run shoplifter -- tag:delete 12345678812
```

```ecmascript 6
new ScriptTag().delete(1234567232);
```

#### `tag:deleteforfile` / `new ScriptTag().deleteforfile()`

Deletes a `script_tag` for a given filename that's matched inside the remote `script_tag`'s `src`-attr. Use with caution.

```shell
npm run shoplifter -- tag:deleteforfile assets/some-script.js
```

```ecmascript 6
new ScriptTag().deleteforfile("assets/some-script.js");
```

#### `tag:find` / `new ScriptTag().find()`

Finds a list of `script_tag`s by given filename`.

```shell
npm run shoplifter -- tag:find assets/some-script.js
```

```ecmascript 6
new ScriptTag().find("assets/some-script.js");
```

#### `tag:findid` / `new ScriptTag().findid()`

Yields the id of first remote `script_tag` whose `src`-attr matches given filename. Primarily used internally...

```shell
npm run shoplifter -- tag:findid assets/some-script.js
```

```ecmascript 6
new ScriptTag().findid("assets/some-script.js");
```

