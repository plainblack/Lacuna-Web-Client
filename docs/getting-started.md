# Getting Started

You have two ways of working with this code.
- [Use Docker](using-docker.md) and download a pre-built image
- Installing node and building it yourself

Docker is of use if all you are doing is hacking the existing Javascript and you want a quick
and easy installation.

Otherwise you will have to set up your own node development environment as follows.

1. [Download and install](https://nodejs.org/en/download/) [Node.js](https://nodejs.org) version `4.x.x` or `5.x.x`
2. Install [Gulp](http://gulpjs.com/) and [Bower](http://bower.io) globally: `[sudo] npm install -g gulp bower`
3. Fork this repository
4. Clone your fork to your machine: `git clone https://github.com/<your-username>/Lacuna-Web-Client`
5. Enter your fork: `cd Lacuna-Web-Client`
6. Install dependencies: `npm install && bower install`
7. Get going: `gulp dev`

# Next Steps

If you...

- haven't worked with React and Reflux before, try [Concepts](concepts.md)
- haven't used Gulp before, try [Gulp Tasks](gulp-tasks.md)
- haven't looked at any code yet, try [Conventions](conventions.md)
- are experiencing difficulties, try [Important Notes](important-notes.md)
- have no idea what to do now, [file an issue](https://github.com/plainblack/Lacuna-Web-Client/issues)
