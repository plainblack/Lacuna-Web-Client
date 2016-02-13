# Tabber

`require('js/components/tabber')`

`Tabber` is a wrapper around [react-tabs](https://github.com/rackt/react-tabs) with a few tweaks made to suit the purposes of the client. Therefore, anything on covered in this document is likely explained in the [react-tabs documentation](https://github.com/rackt/react-tabs#example).

Using `Tabber` is exactly the same as using `react-tabs` except for:
- The `onSelect` prop takes an object. The keys to that object are the indexes of tabs. The values are callbacks that are called when the tabs are clicked on.

# Example

```javascript
var Tabber = require('js/components/tabber');
var Tabs   = Tabber.Tabs;
var Tab    = Tabber.Tab;

var TabberExample = React.createClass({
    render: function() {
        return (
            <Tabs>
                <Tab title="Tab 1" onSelect={function() {
                    alert('You selected Tab 1');
                }}>
                    This is the content for Tab 1.
                </Tab>

                <Tab title="Tab 2" onSelect={function() {
                    alert('You selected Tab 2');
                }}>
                    This is the content for Tab 2.
                </Tab>
            </Tabs>
        );
    }
});
```
