---
sidebar: auto
---

# GitPkg Guide

## Simplest API

- Use a sub folder of a repo as dependency (master branch will be used)

  ```
  https://gitpkg.now.sh/<repo>/<subdir>
  ```

- If you want to use another branch or commit instead

  ```
  https://gitpkg.now.sh/<repo>/<subdir>?<commit-ish>
  ```

  ::: tip

  Usually, a commit-ish can be a `branch`, a `commit`, or a `tag`, etc.

  For more information, see: [git docs > commit-ish](https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefcommit-ishacommit-ishalsocommittish)

  :::

- In fact, usage without sub folder is also available:

  `https://gitpkg.now.sh/<repo>`

  `https://gitpkg.now.sh/<repo>?<commit-ish>`

  But `yarn add` and `npm install` support using github url directly:

  `<repo>`

  `<repo>#<commit-ish>`

Examples:

```shell
yarn init -y

# dep: repo=[EqualMa/gitpkg-hello] > sub folder=[packages/hello]
yarn add https://gitpkg.now.sh/EqualMa/gitpkg-hello/packages/hello

# dep: [EqualMa/gitpkg-hello] > [packages/core] # branch=[feat/md]
yarn add https://gitpkg.now.sh/EqualMa/gitpkg-hello/packages/core?feat/md
```

## More Formal API

```
https://gitpkg.now.sh/pkg?url=<repo>/<subdir>
https://gitpkg.now.sh/pkg?url=<repo>/<subdir>&commit=<commit-ish>
```

Or if you want to make the file format clear:

```
https://gitpkg.now.sh/pkg.tgz?url=&commit=
```

## Custom Scripts

### Why we need custom scripts

Many github repositories contains source code only, which you can't use directly as a npm/yarn dependency.

So this service provide the option to configure custom scripts

### How to use

#### edit with the Web UI

All you need is go to the [main page](/),
click the `Add a custom script` button,
edit the script name and content,
then the install command will include the custom scripts.

You can try the [example](#custom-script-example).

#### (Advanced) setup the url by yourself

If you don't want to use the UI, you can setup the url by your self

- Simplest API

  ```
  https://gitpkg.now.sh/<repo>/<subdir>?<commit-ish>&scripts.<script-name>=<script-content>
  ```

- More Formal API

  ```
  https://gitpkg.now.sh/pkg?url=<repo>/<subdir>&scripts.<script-name>=<script-content>
  https://gitpkg.now.sh/pkg?url=<repo>/<subdir>&commit=<commit-ish>&scripts.<script-name>=<script-content>
  ```

::: warning
`<script-name>` and `<script-content>` must NOT contain special chars including `& ? =`. You can use `encodeURIComponent` to encode them before putting them in the query param.
:::

::: warning
If you use windows, then using `yarn install <url>` or `npm install <url>` if `<url>` contains `&` may lead to errors.

In such cases, you have to manually add `"<package-name>": "<url>"` to the `dependency` or `devDependency` of `package.json`.
:::

##### replace, append to, or prepend to the original script

If the original `package.json` contains the script with the same name,
you can choose to whether to replace it. For example:

The `package.json` is like:

```json
{
  // ...
  "scripts": {
    "postinstall": "node original-install.js"
  }
  // ...
}
```

- To **replace** the original, just use `scripts.postinstall=command-from-gitpkg`,
  then the generated `package.json` will be like:

  ```json
  {
    "scripts": {
      "postinstall": "command-from-gitpkg"
    }
  }
  ```

- To **append** to the original, add `&&` (encoded as `%26%26`) **before** your script content: `scripts.postinstall=%26%26command-from-gitpkg`.
  Then the generated `package.json` will be like:

  ```json
  {
    "scripts": {
      "postinstall": "node original-install.js && command-from-gitpkg"
    }
  }
  ```

- To **prepend** to the original, add `&&` **after** your script content: `scripts.postinstall=command-from-gitpkg%26%26`.
  Then the generated `package.json` will be like:

  ```json
  {
    "scripts": {
      "postinstall": "command-from-gitpkg && node original-install.js"
    }
  }
  ```

### (Advanced) How this function is implemented

GitPkg service process the tar file of the github repo in the form of stream,
so that only a few memory is used.

This means when a user (yarn or npm actually) requests `my-sub-dir` folder from repo `example-user/example-repo`,
GitPkg service requests the tarball of whole repo `example-user/example-repo` from github,
open a stream from the tarball response.

Then the stream is parsed as an `tar entry stream`,
and each entry is checked for whether it is in `my-sub-dir` folder.

If yes, this entry is added to the stream which responses to the user.
If not, this entry is ignored.

To add the custom scripts, when an entry's path is `my-sub-dir/package.json`,
this entry's file content will be loaded,
and modified (the custom scripts are added to the `scripts` prop).
Then the modified version is added to the stream which responses to the user.

So when the user, or yarn and npm, receive the tarball,
the tarball only contains files under `my-sub-dir`.
And if custom scripts are specified,
the `package.json` is modified to include the specified scripts.

This is how GitPkg works.

## Examples

### Custom script example

This example shows how to install [EqualMa/gitpkg-hello > packages/hello-ts](https://github.com/EqualMa/gitpkg-hello/tree/master/packages/hello-ts) as dependency.
The sub folder of this repo only contains typescript source code so we need to use custom scripts:
`scripts.postinstall=npm install --ignore-scripts && npm run build`

```shell
mkdir hello-gitpkg
cd hello-gitpkg
npm init -y
npm install 'https://gitpkg.now.sh/EqualMa/gitpkg-hello/packages/hello-ts?master&scripts.postinstall=npm%20install%20--ignore-scripts%20%26%26%20npm%20run%20build'
```

Then make a new file `test.js`

```js
const { hello } = require("hello-ts");
console.log(hello("world"));
```

Running it should outputs `Hello world from TypeScript!`
