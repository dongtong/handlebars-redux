'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.registerComponents = registerComponents;
exports.connect = connect;

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _nodeDeepcopy = require('node-deepcopy');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function registerComponents(Handlebars, components) {
    if ('component' in Handlebars.helpers) {
        return;
    }

    // The component helper gives us the ability to create a component with child components.
    // An example component would look like
    // <div id="app">
    //    {{{component 'Header'}}}
    //    {{{component 'Body'}}}
    //    {{{component 'ContentWithId' id='content-with-id'}}}
    // </div>
    Handlebars.registerHelper('component', function (name, data) {
        var divName = null;

        if (data.hash.id) {
            divName = data.hash.id;
        } else {
            divName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            divName = 'handlebar-component-' + divName;
        }

        // Make sure we don't load up multiple copies of the child component
        var componentLoaded = data.data.root.component._componentIds.indexOf(divName) !== -1;
        if (!componentLoaded) {
            var component = new components[name](divName);
            data.data.root.component.components.push(component);
        }

        // Returns a placeholder div to render child component
        return '<div id="' + divName + '" data-component="' + name + '"></div>';
    });
}

function connect(store, component) {
    var unsubscribe = null;

    var dispatch = function dispatch(action) {
        store.dispatch(action);
    };

    var handleStateChange = function handleStateChange() {
        component.setDispatch(dispatch);
        component.handleChange((0, _nodeDeepcopy.deepCopy)(store.getState()));
    };

    var trySubscribe = function trySubscribe(stateChangeHandler) {
        if (!unsubscribe) {
            unsubscribe = store.subscribe(handleStateChange);
            handleStateChange();
        }
    };

    trySubscribe();
}