# beta.prx.org Listener App

    Note: This repository houses only the web listener
    frontend component of PRX.org. In order to use it,
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

The quickest way to get started is to check out the repository and execute it
against our live v4 backend, in just a few commands. You will need to have
NodeJS, NPM, and Pow installed.

```shell
git clone git://github.com/PRX/beta.prx.org.git beta.prx.org
cd beta.prx.org
echo 8080 > ~/.pow/beta.prx
npm install -g yarn@1.3.2
yarn install --ignore-engines
npm run devServer
```

After executing the above, opening a web browser to `http://beta.prx.dev/` should display your own version of the page. Any changes you make to the files in the `src/` directory will automatically be reflected on the page - either by updating it in place or by automatically forcing the page to refresh.

## Architecture
Version 4 of PRX.org is implemented as a constellation of applications – currently a *CMS API* which is executed by the server and implemented using Ruby on Rails, a *frontend* which is executed by web browsers and implemented using AngularJS, an *Identification Service* supporting user registration and sign-in, and several other small server-side applications which may react to events occurring throughout the system, provide a public HTTP API, or both.

### General Principles
The application is built in javascript using AngularJS and Stylus (a CSS-like language which compiles to CSS).

#### Compiled
Because of the nature of optimizations which need to take place when serving rich web applications, this project has a build process which performs these optimizations before and during deployment.

Most of this process is handled by Gulp. During development, gulp continuously `build`s the project and runs the tests to ensure that they continue to pass. On the integration server, after these tests have passed, those assets are further compressed and optimized (`compile`d) and the same tests are executed against the new assets. During deployment, assets are `compile`d and tested on the deployment server. Deployments fail if these tests do not pass.

#### Dependencies
Dependencies on libraries are handled using `npm` and dependencies on browser packages are handled using `bower`. NPM will automatically invoke bower correctly as part of the `npm install` process.

#### Testing
This project should be well unit tested. There are (fairly low) code coverage requirements on the suites that will cause them to fail integration if they are not met. Tests are written with Jasmine.

End to End tests are useful but because they are coupled to both the frontend and backend simultaneously they can largely be ignored for the time being. A solution is being devised that will more fully work to continuously integrate this process.

##### PRX CI
Tests are automatically run by PRX CI (AWS CodeBuild), via the buildspec.yml file.

#### Deploying
Deployment is handled by PRX CI and Docker. So you better make sure this works for you:

```
docker-compose -f docker-compose-ci.yml build
docker-compose -f docker-compose-ci.yml test
```

### Project Layout
The project is broken into several directories. Everything that is automatically generated as part of the build process (mentioned above) is ignored by git and therefore never checked into source control. For this reason, I will refer to directories that are not visible in the Github source tree, but will be automatically generated as part of the `npm install` or `npm run-script devServer` processes.

#### `config/`
All configuration details are stored in this folder, including

File               | Description
-----------------: | :--------------------------------
`build.json`         | Most of the details about which files are used by which build target
`deploy.rb`          | Used by Capistrano for deployment
`flags.*.json`       | `build` and `compile` time flags which are automatically inserted into the code. Useful for situations where it is important to optimize varying behavior out before deploying.
`karma.conf.js`      | Used by `karma` to run unit tests.
`protractor.conf.js` | Used by `protractor` to run end to end tests.

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

#### `public/` and `bin/`
Files here are automatically generated and any changes made to them will be lost. You should make changes in the `src/` directory, where they will be automatically picked up and updated where appropriate.

Files generated by the `build` process are put in the `public/` directory. When you access the server started by `npm run-script devServer`, the files you are using are served from this directory. While this script is running, any changes made will automatically be reflected in the `public/` directory.

Files generated by the `compile` process are put in the `bin/` directory. These are further compressed and minified versions of the files put in the `public/` directory, and may use different versions of vendor assets.

#### `vendor/` and `node_modules/`

Files managed by `bower` and `npm`, respectively, live here. *Changes made to these files directly will be lost.* The packages and versions of those packages that will be put in these folders are specified by `bower.json` and `package.json`, respectively.

#### `lib/`

Files that exist to support the build and deploy processes live here.

