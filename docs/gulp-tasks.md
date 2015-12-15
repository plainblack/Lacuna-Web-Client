# Gulp Tasks

In this project, [Gulp](http://gulpjs.com/) is used to manage building the code. Gulp is a build tool similar to ant or make. Gulp tasks are run in the form `gulp <task-name>` and are documented below.

## build

> `gulp build` **OR** `gulp`

Runs the entire process of pulling all the JavaScript/CSS together and creates minified versions of them. This is the default task, meaning that running just `gulp` in the command line will run this task.

## dev

> `gulp dev`

This puts all the JavaScript and CSS together and starts a web server to run the web client. It also watches for changes to the code and restarts when required.

## serve

> `gulp serve`

This just runs the server for running the client in a browser.

## clear

> `gulp clear`

This deletes temporary files and files from the build.
