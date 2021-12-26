export function codeloadUrl (repo: string, commit: string) {
  if (!repo) throw Error('Missing repo')
  if (!commit) throw Error('Missing commit')

  return `https://codeload.github.com/${repo}/tar.gz/${commit}`;
}
