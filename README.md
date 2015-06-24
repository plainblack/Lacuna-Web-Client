# Lacuna-Web-Client

The files contained herein are the front end code that make up the game called "The Lacuna Expanse". This code is distributed under the terms set forth in the `LICENSE` file. For more information about The Lacuna Expanse visit [The Lacuna Expanse](http://www.lacunaexpanse.com/). For more information about The Lacuna Expanse Developers Program visit
[Lacuna Developers](http://www.lacunaexpanse.com/developers).

[![Code Climate](https://codeclimate.com/github/plainblack/Lacuna-Web-Client/badges/gpa.svg)](https://codeclimate.com/github/plainblack/Lacuna-Web-Client)
[![Dependency Status](https://david-dm.org/plainblack/Lacuna-Web-Client.svg)](https://david-dm.org/plainblack/Lacuna-Web-Client)
[![devDependency Status](https://david-dm.org/plainblack/Lacuna-Web-Client/dev-status.svg)](https://david-dm.org/plainblack/Lacuna-Web-Client#info=devDependencies)
![Lacuna-Web-Client size](https://reposs.herokuapp.com/?path=plainblack/Lacuna-Web-Client)

# Hacking

Lacuna-Web-Client requires [Node.js](https://nodejs.org) to hack on. For
installing, see [their installation guide](https://github.com/joyent/node/wiki/Installation).

Setting up and running everything should look something like this:

```bash
git clone https://github.com/<your-username>/Lacuna-Web-Client
cd Lacuna-Web-Client
npm install gulp -g # installs the build tool, gulp. This should be a once-off.
npm install # installs the dependencies for building and running the code.
gulp dev # compiles js/css and launches dev server.
```

## Note

I ([1vasari](https://github.com/1vasari)) have a personal list which I'm working from at the moment. This is because issues are not switched on for this repo. It can be found [here](https://www.wunderlist.com/list/158378421). If you have any requests for the client it would most likely be best to send them to me via Lacuna Expanse's mail system - my empire name is `1vasari`.

# Development

The following are some notes and conventions about the changes that are happening here. The client is slowly being transitioned over to some new libraries and a new structure. They are as follows:

- [Semantic UI](https://semantic-ui.com)
    - This is the CSS framework that makes everything look pretty.
    - Semantic UI also has a JavaScript component that is jQuery-based.
- [React](https://facebook.github.io/react/)
    - React is described as the V in MVC. It's only responsible for managing what the page looks like.
- [Reflux](https://github.com/spoike/refluxjs#refluxjs)
    - Reflux is an implementation of Facebook's Flux structure which is used in conjunction with React.
- [Lodash](https://lodash.com/docs)
    - Lodash is just a general purpose utility library.
- [Gulp](https://gulpjs.com/)
    - Gulp is the build tool. Think of it like `make` or `ant`.
- [Browserify](https://browserify.org/)
    - Browserify is the tool that gets all the dependencies and all the files in the project and smashes it all together into one file.

## Conventions

### Actions

See [Actions](https://github.com/spoike/refluxjs#creating-actions).

There are several ways to define a set of actions. In this project, the following is used:

```javascript
var Reflux = require('reflux');

var StatusActions = Reflux.createActions([
    'foo',
    'bar',
    'baz'
]);
```

### Stores

See [Stores](https://github.com/spoike/refluxjs#creating-data-stores).

There are several ways to define a stores and listen to actions. In this project, the following is used:

```javascript
var Reflux = require('reflux');

var StatusStore = Reflux.createStore({
    listenables: SomeActions, // See above

    getInitialState: function() {
        return '';
    },

    onFoo: function() {
        this.trigger('Foo was clicked.');
    },

    onBar: function() {
        this.trigger('Bar was clicked.');
    },

    onBaz: function() {
        this.trigger('Baz was clicked');
    }
});
```

### Components

See [React Components](https://github.com/spoike/refluxjs#react-component-example).

There are several ways to define React Components. In this project, the following is used:

```javascript
var React = require('react');
var Reflux = require('reflux');

var Demo = React.createClass({
    mixins: [
        Reflux.connect(StatusStore, 'status')
    ]
    render: function() {
        return (
            <div>
                <button type="button" onClick={StatusActions.foo}>Foo</button>
                <button type="button" onClick={StatusActions.bar}>Bar</button>
                <button type="button" onClick={StatusActions.baz}>Baz</button>
                <br />
                <p>
                    {this.state.status}
                </p>
            </div>
        );
    }
})
```

### Windows

Every single window in the game (Stats or Mail, for example) need several things. We'll use the "About" window as an example.

### Actions

AboutActions: `app/js/actions/window/about.js`

All interactions (show, hide, load) are called from here. This is pretty simple.

### Stores

Each window should have both of these stores (or more, depending on the data the window needs from the server).

AboutWindowStore: `app/js/stores/window/about.js`

This store is simply for storing a Boolean value which indicates weather the window should be shown or not.

CreditsRPCStore: `app/js/stores/rpc/stats/credits.js`

This store is responsible for storing the data that comes from the server. It's then used by the component to show interesting things to the user.

### Components

AboutWindow: `app/js/components/window/about.jsx`

There's nothing fancy here. It's just a React component that uses some data.

### Server Calls

I've implemented a new module for sending requests to the game. It's usage and documentation is below.

```javascript
var Reflux = require('reflux');

var server = require('js/server');

var SomeStore = Reflux.createStore({

    // NOTE: store setup not shown for simplicity.

    onSomeAction: function() {

        server.call({

            // Self-explanitory
            module: 'stats',

            // Self-explanitory
            method: 'credits',

            // Self-explanitory
            params: [],

            // This option determines weather the session id should be auto-magically added into the
            // params. It's default is `true` so it should almost never be needed.
            addSession: false,

            // This function gets called when a request succeeds and is passed the resulting data.
            // In the case of a store, unless you want to modify the data, simply give it
            // `this.trigger` and send the data on its merry way to the component.
            success: this.trigger,

            // Errors are shown to the user every time they occur. Therefore, this callback is only
            // required for component-specific error handling or whatever.
            error: function() {
                // Perform magic tricks here.
            }
        });
    }
});
```


## Extra Notes

- Do **not** `require('jquery')`! Instead `require('js/hacks/jquery')`. We have to do this because we need to manually attach the Semantic UI JS code to the jQuery object. The details aren't really important, just remember to require the right one. :grinning:

# Gulp Tasks

In this project, Gulp is used to manage building the code. All the tasks that can be run are documented below. **Note:** *there are several undocumented tasks. This is intentional as they are small parts of a larger task.*

## build

> `gulp build`

Runs the entire process of pulling all the JavaScript/CSS together and creates minified versions of them. This is also the default task, meaning that running just `gulp` in the command line will run this task.

## dev

> `gulp dev`

This puts all the JavaScript and CSS together and starts a web server to run the web client. Open up a browser to the [US1 mirror page](http://us1.lacunaexpanse.com/local.html) and you should see the it working. It also watches for changes to the code and restarts when it sees anything changed.

## serve

> `gulp serve`

This just runs the server for running the client in a browser.
