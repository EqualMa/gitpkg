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
