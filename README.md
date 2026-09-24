# SophonBIM website

The public, static homepage for SophonBIM. It includes the Intro, Tutorial, operation guide, and Windows release status. The Tutorial videos are recordings of the local desktop application. This site does not run the Jev, DeepSeek, Activity Log, or Episode services.

## GitHub Pages

Publish the repository from **Settings → Pages → Deploy from a branch → main → /(root)**. The site uses relative links and works at `https://Wenhe-XU.github.io/SophonBIM-site/`. The empty `.nojekyll` file keeps GitHub Pages from processing the static files with Jekyll.

No Windows installer is included in this repository. The download button remains disabled until a validated installer is attached to a GitHub Release. When that release exists, set the exact `githubRepository`, `releaseTag`, and `installerName` values at the top of `site.js`, then verify the direct link on the published page. Keep `.exe` files in GitHub Releases, outside the Pages branch.

## Local preview

Serve this directory with any static HTTP server, then open its `index.html`. The videos and pages do not need the SophonBIM local API.

The project's source and desktop release process are maintained separately from this static site.
