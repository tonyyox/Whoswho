'use strict';

const build = require('@microsoft/sp-build-web');
const fs = require('fs');
const path = require('path');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be made available via the 'styles' object.`);

// When running in GitHub Codespaces, rewrite localhost URLs in manifests
// so the SharePoint workbench can load bundles from the forwarded port.
if (process.env.CODESPACE_NAME) {
  const codespaceUrl = `https://${process.env.CODESPACE_NAME}-4321.app.github.dev`;

  const rewriteManifests = build.subTask('rewrite-manifests', function (gulp, buildOptions, done) {
    const manifestPath = path.join(buildOptions.rootPath, 'temp', 'build', 'manifests.js');
    if (fs.existsSync(manifestPath)) {
      let content = fs.readFileSync(manifestPath, 'utf8');
      content = content.replace(/https?:\/\/localhost:4321\//g, codespaceUrl + '/');
      content = content.replace(/https?:\/\/0\.0\.0\.0:4321\//g, codespaceUrl + '/');
      content = content.replace(/https?:\/\/localhost:54321\//g, codespaceUrl + '/');
      fs.writeFileSync(manifestPath, content, 'utf8');
    }
    done();
  });

  build.rig.addPostBundleTask(rewriteManifests);
}

var getTasks = build.rig.getTasks;
build.rig.getTasks = function () {
  var result = getTasks.call(build.rig);
  result.set('serve', result.get('serve-deprecated'));
  return result;
};

build.initialize(require('gulp'));
