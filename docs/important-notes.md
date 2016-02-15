# Important Notes

## Removal of YUI

The original client was implemented using Yahoo's user interface library  [YUI2](http://yui.github.io/yui2/docs/yui_2.9.0/docs/) which has been [depreciated since 2011](http://yuiblog.com/blog/2011/04/13/announcing-yui-2-9-0/). Since April 2015 there has been an ongoing effort to eradicate the old (buggy) YUI code.

## jQuery Shim

Do **not** `require('jquery')` - instead `require('js/shims/jquery')`. `js/shims/jquery` is responsible for combining Semantic UI's jQuery plugins and other plugins all together into one object.

## Code Style

- Follow ESLint.
- camelCase for file names. (`longFileName.js`)
- No `index.js` or `index.jsx` files.
- As always: **when in Rome, do as the Romans do.**

You can run `gulp lint` to make sure everything passes. However, it would be much more effective to get ESLint integrated with your editor so that you get live feedback. [Here are some options](http://eslint.org/docs/user-guide/integrations).
