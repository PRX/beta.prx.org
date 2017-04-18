# PRX.org Version 4
[![Build Status](https://preview.snap-ci.com/PRX/www.prx.org/branch/master/build_image)](https://preview.snap-ci.com/PRX/www.prx.org/branch/master)
[![Build Status](https://travis-ci.org/PRX/www.prx.org.png?branch=master)](https://travis-ci.org/PRX/www.prx.org)
[![Coverage Status](https://coveralls.io/repos/PRX/www.prx.org/badge.png?branch=master)](https://coveralls.io/r/PRX/www.prx.org?branch=master)

    Note: This repository houses only the web frontend
    component of PRX.org Version 4. In order to use it,
    you will need a working version of the CMS or backend
    component, available at [PRX/cms.prx.org](/PRX/cms.prx.org).
    If you want to contribute to the frontend without needing
    to change the backend, you can use our live CMS, but
    may be subject to rate-limiting.

    Additionally, both this application and the cms depend
    on a working instance of our identification service for
    login and write support. That service's source code is
    not currently publicly available, but we are investigating
    options for documenting the expected protocol or releasing
    the source code. Until that time, the service is available
    at [id.prx.org](https://id.prx.org).

## Getting Started
The quickest way to get started is to check out the repository and docker-compose it against our live v4 backend, in just a few commands. You will need to have dinghy and docker running.

Currently, you'll also need to have a recent version of Node (5.x.x) installed locally.

```shell
git clone git://github.com/PRX/www.prx.org.git www.prx.org
cd www.prx.org

# install local dependencies and config
npm install
cp env-example .env

# edit .env and uncomment the ID_CLIENT_KEY for www.prx.docker
vi .env

# run docker
dinghy up
docker-compose build
docker-compose up
open www.prx.docker
```

This runs a dev-server, which watches the code for changes.  The test suite currently only runs locally (not in Docker):

```shell
npm run test

# ... or ...
npm run testunit
npm run teste2e

# ... or to run end-to-end tests in sauce labs ...
export SAUCE_USERNAME=somebody
export SAUCE_ACCESS_KEY=something
npm run teste2e
```

## Architecture
Version 4 of PRX.org is implemented as a constellation of applications – currently a *CMS API* which is executed by the server and implemented using Ruby on Rails, a *frontend* which is executed by web browsers and implemented using AngularJS, an *Identification Service* supporting user registration and sign-in, and several other small server-side applications which may react to events occurring throughout the system, provide a public HTTP API, or both.

### General Principles
The application is built in javascript using AngularJS and Stylus (a CSS-like language which compiles to CSS).

#### Building
Because of the nature of optimizations which need to take place when serving rich web applications, this project has a build process which performs these optimizations before and during deployment.

Most of this process is handled by Gulp. During development, gulp continuously `build`s the project, keeping your `app.js` and `app.css` up to date. In staging/production, these files are further minified and gzipped.  To run your dev server against a prod-like build, use the gulp `build:dist` and `watch:dist` tasks, rather than `build:dev` and `watch:dev`.

The unit tests are run against non-minified javascript, compiled via Browserify.  The end-to-end tests are run against minified prod-like javascript.

#### Dependencies
Dependencies on libraries are all handled using `npm`. Most are `require`d into the files that use them, except for several `vendor` libraries that are not compiled into `app.js` (see `gulp/vendor.js`).

#### Testing
This project should be well unit tested. There are (fairly low) code coverage requirements on the suites that will cause them to fail integration if they are not met. Tests are written with Jasmine.

End to end tests run via Protractor. When running locally, they'll likely launch your Chrome/Firefox/Safari/etc. When running in CI, they use Sauce Labs. Because of the number of services touched by these tests, they may eventually leave this repo and move over to the [meta.prx.org](https://github.com/PRX/meta.prx.org) acceptance test suite.  (Which guards against incompatible services being deployed to production).

##### CI
Tests initially ran via Travis CI. As this converts to a Dockerized project, the tests will move over to Snap CI.  However, the e2e tests are a bit trickier to run there, so currently we're testing in multiple places. We block pull requests that do not pass tests, so that `master` always passes (see [*Master is Always Deployable*](#master-is-always-deployable), below).

#### Deploying
When a `master` pipeline passes tests in Snap CI, it is automatically dockerized and pushed to the Elastic Container Registry. Then the new ECR image is deployed to our `prx-staging` EC2 Container Services cluster.

After Staging is updated, a new [meta.prx.org](https://preview.snap-ci.com/PRX/meta.prx.org/branch/master) pipeline is triggered.  This runs acceptance tests against all PRX services in staging, and decides if this combination of services can be deployed to production.

The final "deploy to production" stage is currently manual, but just requires a single button click in Snap CI.

##### Master is Always Deployable
We're able to make very little ceremony out of deploying because master is always deployable (and, in fact, will likely be automatically deployed in the future). We maintain this state of affairs by ensuring that our code is well-tested ([automatically](#testing), with help from [Travis CI](#Travis-CI)) and by following a code review process that uses Github Pull Requests to ensure that at least two people have looked at each set of changes.

### Project Layout

#### Configuration

File                        | Description
--------------------------: | :--------------------------------
`.env`                      | Configures your dev environment. Identical to doing `export FLAG_NAME=value`.
`config/flags.conf.js`      | Computes the environment feature-flags and configures backend services. Uses a combination of `ENV` > `.env` > defaults.
`config/karma.conf.js`      | Used by `karma` to run unit tests.
`config/protractor.conf.js` | Used by `protractor` to run end to end tests.

In development, you'll want to `cp env-example .env`, and edit to suit your needs.  In ECS environments, configurations will be passed to Docker via ENV variables.

#### Building

File                        | Description
--------------------------: | :--------------------------------
`Dockerfile`                | Used to build a tiny, tiny docker image
`docker-compose.yml`        | Dev environment
`gulpfile.js`               | Manifest for js/css building processes
`gulp/*.js`                 | Individual gulp tasks

When the build completes, you end up with several things in the `/build` directory:

File                        | Description
--------------------------: | :--------------------------------
`build/index.jade`          | A direct copy of `src/index.jade`. Because the docker-image removes all directories other than `build` and `lib`.
`build/flags.conf.js`       | A direct copy of `config/flags.conf.js`. Flags are set by ENV variables at runtime.
`build/assets/*`            | The browser-compatible css/js. Also includes fonts and images.
`gulp/vendor/*`             | Third party libs that are loaded on-demand, and not included in the actual `app.js`.

#### Application Source

#### `src/`
Application code lives under the `src/` directory. In practice, only assets that
will be a part of the final deployed bundle and their supporting tests live under
`src/`. Files that primarily relate to building or serving the application bundle
 go in [`lib/`](#lib).

##### `src/app/`
Application specific javascript, jade, and tests live in the `src/app/` directory,
separated into modules. Modules usually consist of, at a minimum, a folder with
the a file of the same name with `.js` at the end. For example:

```shell
src/app/
└── accounts
    └── accounts.js
```

###### Javascript Files
Each javascript file, by convention, maps to a single Angular.js module. The
module's name follows the convention of joining the directory trees, the filename
(unless it is the main file, sharing the name of the folder), and a prefix of `prx`
with dots (`.`). Thus, the following modules can be defined in the associated file:

Module                 | File
---------------------: | :----------
prx.accounts           | src/app/accounts/accounts.js
prx.accounts.stats     | src/app/accounts/stats/stats.js
prx.accounts.history   | src/app/accounts/history.js

Note that `prx.accounts.stat` could be defined in either `src/app/accounts/stats.js`
or in `src/app/accounts/stats/stats.js`. The latter is usually preferred if the
module in question is not self-contained to the single javascript file. It is not
permissible for both `src/app/module/foo.js` (the file) and `src/app/module/foo/`
(the directory) to exist.

In the event that a javascript module is not specific to the application, it should
be put in the [`src/common`](#srccommon).

###### Spec Files
Each javascript file should be accompanied by a spec file. The spec files live in
the same directory as the javascript file they are paired with, and have the same
filename with the extension prefix `.spec`. Thus, the specs for `src/app/accounts/accounts.js`
would be in a file called `src/app/accounts/accounts.spec.js`.

These spec files should be used as unit tests for the Angular.JS files they accompany.
The only modules that should be required by the specs are the module under test and
mock-specific modules (such as `ngHalMock`, although it is likely that these will be)
included globally in a future revision, making their inclusion redundant. This forces
the modules to operate as truly complete definitions by declaring their dependencies
correctly.

Make sure you do your best to write tests for all of the behavior you're defining!

###### E2E Specs

    Note: while currently optional, this is likely to become mandatory in the
    future. Make sure you are familiar with the workings of E2E specs.

Modules may optionally include End to Engd specs, which are executed in the context
of a browser with the live backend. Files with the extension `.e2e.spec.js` will
be run in this way.

###### Templates
Templates are used for reusable snippets of HTML. JADE is used as an alternative
to writing HTML. Templates can be saved in a module with the extension `.html.jade`.

When referencing the templates in your javascript, the `app/` is dropped.

##### `src/common/`
Non-application-specific javascript is stored in `src/common/`. As a rule, any
javascript that is a candidate for extraction as a module or use in other projects
should be put in this directory. If the module is application specific (a good red
flag is dependencies on other modules) it should instead go to [`src/app/`](#srcapp).

As with application javascript files, specs live alongside their implementation
in this folder - again, with the extension `.spec.js`.

##### `src/stylus/`
*coming soon*

##### `src/assets/`
*coming soon*
