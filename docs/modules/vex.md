# Vex

`require('js/vex');`

Vex is a module for displaying pretty-looking `alert`, `confirm` and `prompt` boxes. This module is a wrapper around the Vex API to make things even easier.

# Methods

## `alert(message)`

- **message** (string): the message you want displayed in the box

```javascript
vex.alert('Hello! I am a fancy-looking alert box!');
```

## `confirm`

- **message** (string): the message you want displayed in the box
- **yesCallback** (function): this callback that will be called when 'Ok' is clicked
- **noCallback** (optional function): this callback that will be called when 'Cancel' is clicked

```javascript
vex.confirm(
    'Do you wish to save your changes before exit?',
    function() {
        console.log('The user said yes!');
    },
    function() {
        console.log('The user said no!');
    }
);
```

## `prompt`

- **message** (string): the message you want displayed in the box
- **placeholder** (string): the placeholder in the text entry field
- **callback** (function): function called with the value the user entered

```javascript
vex.prompt(
    'What is your name?',
    'Bill',
    function(name) {
        console.log('Your name is ' + name + '!');
    }
)
```
