# Important Notes

## Code Style

- Follow ESLint.
- camelCase for file names. (`longFileName.js`)
- No `index.js` or `index.jsx` files.
- As always: **when in Rome, do as the Romans do.**

You can run `gulp lint` to make sure everything passes. However, it would be much more effective to get ESLint integrated with your editor so that you get live feedback. [Here are some options](http://eslint.org/docs/user-guide/integrations).

## Dependency Versions

The client here has a fair few dependencies. Usually, we're using the latest version of each dependency. However, there are two exceptions to this rule. The reasons for this are mostly "they put out breaking changes and we haven't adapted yet". The two dependencies in question are:

- Semantic UI version `1.12.x` - [docs](http://1.semantic-ui.com/)
- Lodash version `3.x.x` - [docs](https://github.com/lodash/lodash/tree/3.10.1/doc)

If you're looking for docs for those libraries, make sure to use the ones above rather than whatever Googling "xyz library docs" gets you.

## Removal of YUI

The original client was implemented using Yahoo's user interface library  [YUI2](http://yui.github.io/yui2/docs/yui_2.9.0/docs/) which has been [depreciated since 2011](http://yuiblog.com/blog/2011/04/13/announcing-yui-2-9-0/). Since April 2015 there has been an ongoing effort to eradicate the old (buggy) YUI code.

## jQuery Shim

Do **not** `require('jquery')` - instead `require('js/shims/jquery')`. `js/shims/jquery` is responsible for combining Semantic UI's jQuery plugins and other plugins all together into one object.
