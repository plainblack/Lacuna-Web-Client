'use strict';

var React = require('react');
var Reflux = require('reflux');
var _ = require('lodash');

var NotesActions = require('js/actions/window/notes');

var NotesWindowStore = require('js/stores/window/notes');
var NotesRPCStore = require('js/stores/rpc/body/notes');

var Panel = require('js/components/panel');

var NotesWindow = React.createClass({
    mixins: [
        Reflux.connect(NotesWindowStore, 'show'),
        Reflux.connect(NotesRPCStore, 'notes')
    ],
    handleClose: function() {
        var value = _.trim(this.refs.notes.getDOMNode().value);

        NotesActions.save(value);
        NotesActions.hide();

        // Reset notes
        this.setState({notes: NotesRPCStore.getInitialState()});
    },
    componentDidUpdate: function() {
        if (this.state.notes === this.getInitialState().notes) {
            NotesActions.load();
        }
    },
    handleChange: function(e) {
        this.setState({notes: e.target.value});
    },
    render: function() {
        return (
            <Panel show={this.state.show} onClose={this.handleClose} title="Notes">
                <div className="ui attached info message">
                    <i className="info icon"></i>
                    Closing this window will save your notes.
                </div>
                <form className="ui form">
                    <div className="field">
                        <textarea
                            ref="notes"
                            value={this.state.notes}
                            onChange={this.handleChange}
                            style={{
                                height: '450px'
                            }}>
                        </textarea>
                    </div>
                </form>
            </Panel>
        );
    }
});

module.exports = NotesWindow;
