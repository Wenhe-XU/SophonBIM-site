# SophonBIM website

The public, static homepage for SophonBIM. It includes the Intro, Tutorial, operation guide, and Windows release status. The Tutorial videos are recordings of the local desktop application. This site does not run the Jev, DeepSeek, Activity Log, or Episode services.

## GitHub Pages

Publish the repository from **Settings → Pages → Deploy from a branch → main → /(root)**. The site uses relative links and works at `https://Wenhe-XU.github.io/SophonBIM-site/`. The empty `.nojekyll` file keeps GitHub Pages from processing the static files with Jekyll.

No Windows installer is included in this repository. The x64 and ARM64 buttons show installation notices while their assets are pending. After a release exists, set `githubRepository` and the exact `releaseTag`/`installerName` values for x64 or `armReleaseTag`/`armInstallerName` for ARM64 at the top of `site.js`, then verify the direct links on the published page. The ARM64 notice explains that this architecture has not been locally tested on a compatible device. Keep `.exe` files in GitHub Releases, outside the Pages branch.

## Local preview

Serve this directory with any static HTTP server, then open its `index.html`. The videos and pages do not need the SophonBIM local API.

The project's source and desktop release process are maintained separately from this static site.
