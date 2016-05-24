'use strict';

import _ from 'underscore';
import { deepCopy } from 'node-deepcopy';

export function registerComponents(Handlebars, components) {
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
    Handlebars.registerHelper('component', function(name, data) {
        let divName = null;

        if (data.hash.id) {
            divName = data.hash.id;
        } else {
            divName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            divName = `handlebar-component-${divName}`;
        }

        // Make sure we don't load up multiple copies of the child component
        let componentLoaded = data.data.root.component._componentIds.indexOf(divName) !== -1;
        if (!componentLoaded) {
            var component = new components[name](divName);
            data.data.root.component.components.push(component);
        }

        // Returns a placeholder div to render child component
        return `<div id="${divName}" data-component="${name}"></div>`;
    });
}

export function connect(store, component) {
    let unsubscribe = null;

    let dispatch = function(action) {
        store.dispatch(action);
    };

    let handleStateChange = function() {
        component.setDispatch(dispatch);
        component.handleChange(deepCopy(store.getState()));
    };

    let trySubscribe = function(stateChangeHandler) {
        if (!unsubscribe) {
            unsubscribe = store.subscribe(handleStateChange);
            handleStateChange();
        }
    };

    trySubscribe();
}
