const branchNamePrecedence = [
  "master",
  "dev",
  "next",
  // tag vx.x.x
  name => /[vV][0-9.]+.*/.test(name),
  "bug/",
  "feat/",
  "fix/",
];

const getPrecedence = ({ commit }) => {
  let i = branchNamePrecedence.findIndex(v =>
    typeof v === "function" ? v(commit) : commit === v,
  );

  if (i === -1) {
    i = branchNamePrecedence.findIndex(
      v => typeof v === "string" && commit.startsWith(v),
    );
    if (i !== -1) i += 10000;
  }

  return i === -1 ? Infinity : i;
};

const API_BASE = "https://gitpkg.now.sh/";
const REGEX_URL = /^https?:\/\/([^/?#]+)\/([^/?#]+)\/([^/?#]+)(?:(?:\/tree\/([^#?]+))|\/)?([#?].*)?$/;

function apiFromCommitInfo({
  commit,
  subdir,
  originalUrl,
  domain,
  userName,
  repoName,
}) {
  const repo = userName + "/" + repoName;

  const data = {
    originalUrl,
    domain,
    userName,
    repoName,
    commit,
    subdir,
  };

  const commitPart = commit ? "?" + commit : "";

  if (!subdir) {
    return {
      type: "warn",
      warnType: "suggest-to-use",
      data,
      suggestion: {
        apiUrl: commit ? repo + "#" + commit : repo,
      },
      apiUrl: API_BASE + repo + commitPart,
      params: { url: repo, commit },
    };
  } else {
    return {
      type: "success",
      data,
      apiUrl: API_BASE + repo + "/" + subdir + commitPart,
      params: { url: repo + "/" + subdir, commit },
    };
  }
}

export const apiFromUrl = url => {
  const match = REGEX_URL.exec(url.trim());
  if (!match) {
    return {
      type: "error",
      errorType: "url-wrong",
      data: {
        originalUrl: url,
      },
    };
  }

  const [fullUrl, domain, userName, repoName, _commitAndSubDir] = match;

  const data = {
    originalUrl: fullUrl,
    domain,
    userName,
    repoName,
  };

  if (domain !== "github.com") {
    return {
      type: "error",
      errorType: "platform-not-supported",
      data,
    };
  }

  const commitAndSubDir =
    _commitAndSubDir && _commitAndSubDir.endsWith("/")
      ? _commitAndSubDir.slice(0, -1)
      : _commitAndSubDir;

  // no sub folder
  // || commitAndSubDir.indexOf("/") === -1
  if (!commitAndSubDir) {
    return apiFromCommitInfo({
      ...data,
      commit: undefined,
      subdir: undefined,
    });
  }

  const routes = commitAndSubDir.split("/").filter(Boolean);

  const possibleCommitAndSubDirs = routes.map((p, i, arr) => {
    return {
      commit: arr.slice(0, i + 1),
      subdir: arr.slice(i + 1),
    };
  });

  return {
    type: "choice",
    data,
    possibleApis: possibleCommitAndSubDirs
      .map(p => {
        const subdir = p.subdir.join("/");
        const commit = p.commit.join("/");
        return apiFromCommitInfo({ ...data, subdir, commit });
      })
      .map(info => ({
        info,
        precedence: getPrecedence({
          commit: info.data.commit,
          subdir: info.data.subdir,
        }),
      }))
      .sort((a, b) => a.precedence - b.precedence)
      .map(a => a.info),
  };
};
