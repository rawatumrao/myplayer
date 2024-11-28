# Playwright tests for the New Registration Project

## Overview

This project is aimed at testing the Bitmovin player in the core product. It is
built using the [Playwright test library]()https://playwright.dev/ with 
dditional coding as needed. 

### Folder Structure

```bash
├───node_modules
├───playwright-report
├───src
│   ├───applicationDriver
│   │   ├───constants
│   │   └───pageObjects
│   └───utilities
├───test-results
└───tests
```

## Getting Started

In order to get started, you will need to have Node.js, Typescript, npm, 
playwright and other libraries installed.

### Pre-requisites
- Git - Git can be installed a few ways depending on your system. This 
[page](https://git-scm.com/download) has the downloadable files, or you can 
research the method best suited for your machine
- VS Code - [Download](https://code.visualstudio.com/download) the appropriate 
package for your machinenpm install eslint --save-dev
- Node.js - [Download](https://nodejs.org/en/download) the appropriate library for 
your system and install (NPM comes with it). Mac users can use `brew install node`
- Source - This project is out on [Bitbucket](https://bitbucket.org/globalmeet-webcasts-plus/registration-20/src/master/)

### Notes on VS Code
[This page](https://playwright.dev/docs/getting-started-vscode) has instructions
on setting up to run playwright in VS Code. You may also want to install the 
eslint extension as well.

### Setting up the tests
#### Open in VS CODE
You will want to open the `bitmovin-player/playwright-tests` folder in VS Code.

#### Installing Dependencies
Run `npm install` from either the command line/terminal window in that project, 
or from the terminal within VS Code when the project is open.

Additionally, you may need to install the browsers that Playwright uses. if so, 
in the terminal window on VS Code or the terminal/command window on the system, 
while in the `registration-20/plywright-tests` folder, run `npx playwright 
install`.

#### Environment Variables
Given that we want to run this test suite against different environments, and 
that we do not want to store sensitive information in the code repository, we 
need to create `.env` files to contain that information and have it available 
for use at run time. The file is tiggered via an environment variable.

The `.env` file is named based on the environment in question. In the root of 
this test project create a file (or files) such as `env.local`, `env.alpha`, 
`env.stage`, etc. 

Inside the `.env` file you will want to store the variables called by the test 
script such as:
```bash
BASE_URL="https://registration-demo-config-ui-678fd3e249e4.herokuapp.com/
USERNAME="USERNAME"
PASSWORD="PASSWORD"
```
The `src/utilities/globalSetup.ts` script will execute at runtime and key on 
another environment variable, `TEST_ENV`, that can be passed in with the test 
command or set on the system.
```bash
# Command line example
TEST_ENV=prod npx playwright test
```

The value of the `TEST_ENV` variable needs to match the suffix of the `.env` 
file. As an example, if you have a `.env.uat` file that you want to use, the 
`TEST_ENV` variable would be `uat`.

Alternatively, you can pass in the variables on the command line. Each of the 
variables used in the script must be specified [the variables below are just
examples]:
```bash
# Command line example
BASE_URL=https://www.sample.com USERNAME=username PASSWORD=password npx playwright test
```

## Writing the tests
The tests rely on an abstraction class to deal with the UI under test. Rather 
than have the tests call the application directly, they call the objects that 
are created to operate on the page or API enfpoints. Typically, this is 
called the Page Object Model. However, since we are doing more than just 
testing the pages, we refer to this as the Application Driver `src/applicationDriver`.

The application driver folder should contain the objects and data needed for 
the tests to work with the application. They may use other pieces of code to 
assist in this effort. That code is stored inside the `src` folder. As an 
example, the `src/utilities` folder contains classes for scanning a page for 
accessibility issues and outputting the results to HTML.

I prefer not to comment the test and page object code and use very explicit 
naming of the functions, unless I am making a questionable or uncertain choice. 
In those cases, I try to explain why I did what I did.

### The test
Test are contained in a spec file. The format of the filename is `*.spec.ts` 
where the `*` references the page or area that spec file is focused on. 

The [Playwright documentation](https://playwright.dev/docs/writing-tests) on 
tests shows the tests calling the pages directly. This is fine for small test 
suites. For what we are proposing, you will want to follow the Page Object 
Model mentioned previously. 

Playwright offers before and after hooks so that you can set up the test or 
state of the application with what it needs to operate. It is common to 
instantiate the application driver objects in a beforeall (or occasionally 
beforeeach) so that they are available.

#### UI Tests
The UI tests will walk through the application as a user (albeit faster) to 
verify that the application does what it needs. You do not need to test the 
presence of a control (e.g. an input field) as the test for that is in its use. 

You will want to validate that the data entered persists and that the proper 
data is displayed.

## Beyond Functional Testing
In addition to the standard functional testing this suite can be extended to 
perform other types of testing such as Accessibility (already in place using 
aXe), page performance (using something like Lighthouse), security, 
data-driven, or destructive testing.

## Tagging the tests
The tests themselves need to be bucketed according to use. Playwright offers a 
tagging method whereby you put some sort of @ tag into the description of 
either the test or test.describe block. Currently we have these:

- `@acceptance`
- `@regression`
- `@accessibility`

We will definitely add a `@smoke` tag once we have enough tests to make that a 
separate tag from `@accessibility`. As an example, when writing a test you 
would do something like this:

```javascript
test("A sample test that we want to run in smoke, acceptance, and regression: @smoke @acceptance @regression")
```

Then, when running the tests from a command line, you would issue this command:
```bash
npx playwright test --grep @acceptance
```

On Powershell (Windows...) you will want to put quotes around the tag:
```bash
npx playwright test --grep "@acceptance"
```

### Running the tags locally on a windows machine
Windows and NPM do not play well together. If you wish to test the `npm run test:ci`
command on a windows machine, you need to alter the npm config. Open up a 
command window and run this:
```bash
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```
If you need to revert the change, run this:
```bash
npm config delete script-shell
```