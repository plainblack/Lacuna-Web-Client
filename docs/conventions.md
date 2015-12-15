# Window Conventions

Every single window in the game (Stats or Mail, for example) are implemented in a certain way. We'll use the 'About' window as an example.

## Actions

**AboutActions** - [app/js/actions/window/about.js](https://github.com/plainblack/Lacuna-Web-Client/blob/master/app/js/actions/window/about.js)

All interactions (show, hide, load) are defined here.

## Stores

To start with, you'll need a 'window store' which contains a boolean value for whether the window should be rendered on the screen. Anything else, is optional. For the About window, we need to load the credits from the server, therefore, we need to define an RPC store for that.

**AboutWindowStore** - [app/js/stores/window/about.js](https://github.com/plainblack/Lacuna-Web-Client/blob/master/app/js/stores/window/about.js)

This store is simply for storing a Boolean value which indicates weather the window should be shown on screen or not.

**CreditsRPCStore** - [app/js/stores/rpc/stats/credits.js](https://github.com/plainblack/Lacuna-Web-Client/blob/master/app/js/stores/rpc/stats/credits.js)

This store is responsible for getting and storing the credits.

## Components

**AboutWindow** - [app/js/components/window/about.jsx](https://github.com/plainblack/Lacuna-Web-Client/blob/master/app/js/components/window/about.jsx)

The component ties everything together. It listens to the stores and updates when data is passed down. It calls actions to tell the stores that something needs to happen.

To illustrate how this all fits together, here's an example: when the about window component first renders it calls the action to load the credits, the store listens to this call and responds by getting the credits from the server and passing them back to the component.
