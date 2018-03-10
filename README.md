# cluedo-brainyfools

Do you want to play ?

[Click here](http://cluedo-brainyfools.herokuapp.com/)


# Contributing guidelines

Welcome buddy, We are happy to see you here. We request you to read all guides before contributing.

For styling guide [click here](../../wiki/Style)

## Table of Contents

* [Prerequisites](#Prerequisites)
* [Project Skeleton](#Project-Skeleton)
* [Setup for development](#setup-for-development)
* [Contribution](#contribution)

<h4 id="Prerequisites"> Prerequisites </h4>

> _You just need to be aware of using things like_

* Node
* ExpressJs
* AJAX
* Mocha
* Chai
* Supertest

<h4 id="Project-Skeleton"> Project Skeleton </h4>

```
Cluedo/
  ├─ logs/
  |   └─ *.log
  ├─ public/
  │   ├─ css/
  │   ├─ images/
  │   ├─ js/
  │   ├─ svg/
  │   ├─ *.html
  ├─ src/
  │   ├─ utils/
  │   ├─ routes/
  │   └─ models/
  ├─ templates/
  ├─ test/
  │   ├─ handler/
  │   ├─ integration/
  │   └─ models/
  │   ├─ utils/
  |
  ├─ app.js
  ├─ server.js
  ├─ .gitignore
  ├─ .eslintrc
  ├─ .npmrc
  ├─ .eslintignore
  ├─ README.md
  ├─ .editorconfig
  └─ package.json
```
#### Setup for development ####
 To contribute for this project you need to do the following things.
1. clone the repository
  ```
  $ git clone https://github.com/step-tw/cluedo-brainyfools.git
  ```
2. Run executable file from your project root directory

  ```bash
  $ sh bin/setup.sh
  ```
3. Run tools file from your project root directory to install testing tools globally
  ```bash
  $ sh bin/tools.sh
  ```
4. To start the application run npm start
  ```
  npm start
  ```

#### Contribution ####

After preparing development environment, select an issue that you want to work on and assign it to yourself.

As a pair follow ` TDD ` write tests to cover every line of code you added.
