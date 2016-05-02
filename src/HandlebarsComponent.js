'use strict';

import _ from 'underscore';
import Handlebars from 'hbsfy/runtime';

let initHandlebarsHelpers = function() {
    if ('component' in Handlebars.helpers) {
        return;
    }

    // The component helper gives us the ability to create a component with child components.
    // An example component would look like
    // <div id="app">
    //    {{{component 'Header'}}}
    //    {{{component 'Body'}}}
    // </div>
    Handlebars.registerHelper('component', function(name, data) {
        let divName = name.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
        divName = `handlebar-component-${divName}`;

        // Make sure we don't load up multiple copies of the child component
        let componentLoaded = data.data.root.component._componentIds.indexOf(divName) !== -1;
        if (!componentLoaded) {
            var component = new HandlebarsComponent.components[name](divName);
            data.data.root.component.components.push(component);
        }

        // Returns a placeholder div to render child component
        return `<div id="${divName}" data-component="${name}"></div>`;
    });
}

let domElement = function(identifier) {
    if (typeof identifier === 'object') {
        return identifier;
    }

    return document.getElementById(identifier);
}

class HandlebarsComponent
{
    init(el)
    {
        this._componentIds = [];
        initHandlebarsHelpers();
        this.el = el || null;
        this.components = [];
        this.dispatch = null;
        this.state = this.getInitialState();
        this.props = this.getDefaultProps();
        this.cache = null;
        this.view = this.view || null;
        this.forceUpdate = true;
    }

    setDispatch(dispatch)
    {
        this.dispatch = dispatch;
    }

    setState(state)
    {
        this.state = _.extend(this.state, state);
    }

    getState()
    {
        return this.state;
    }

    getInitialState()
    {
        return {};
    }

    getDefaultProps()
    {
        return {};
    }

    handleChange(nextProps)
    {
        let dispatch = this.dispatch;

        if (this.shouldComponentUpdate(nextProps, this.getState()) || this.forceUpdate) {
            this.componentWillReceiveProps(nextProps);
            this.componentWillUpdate(nextProps, this.getState());
            this.render();
            this.componentDidUpdate();
            this.cleanup();
        }

        _.each(this.components, function (component) {
            component.setDispatch(dispatch);
            component.handleChange(nextProps);
        });
    }

    changesIn(properties, props)
    {
        var keysChanged = _.map(this.props, function (value, key) {
            if (!_.isEqual(value, props[key])) {
                return key;
            }

            return null;
        });

        return _.intersection(keysChanged, properties).length > 0;
    }

    shouldComponentUpdate(props, state)
    {
        if (this.properties) {
            return this.changesIn(this.properties, props);
        }

        if (!_.isEqual(this.props, props)) {
            return true;
        }

        return false;
    }

    componentWillUpdate(nextProps, nextState)
    {
        this.props = nextProps;
    }

    componentWillReceiveProps(props)
    {
    }

    bindActions(el)
    {
        let obj = this;
        el = el || domElement(this.el);
        if (!el) {
            return;
        }

        _.each(el.children, function (child) {
            var data = {};

            _.each(child.attributes, function (attribute) {
                if (attribute.nodeName.search('data-') !== -1) {
                    var modNodeName = attribute.nodeName
                        .replace('data-', '')
                        .replace( /-([a-z])/gi, function ( $0, $1 ) { return $1.toUpperCase(); } );

                    data[modNodeName] = attribute.nodeValue;
                }
            });

            // Here, we're only tracking onclick. Eventually, we may want to track
            // more
            if (data.onclick) {
                child.onclick = function(e) {
                    obj[data.onclick](e, data);
                };
            }

            obj.bindActions(child);
        });
    }

    toHtml()
    {
        var renderData = {
            component: this,
            props: this.props,
            state: this.getState()
        };

        return this.view(_.extend(renderData));
    }

    render()
    {
        var el = domElement(this.el);
        el.innerHTML = this.toHtml();

        this.bindActions(el);
    }

    componentDidUpdate()
    {
        // called after render
    }

    cleanup()
    {
        this.forceUpdate = false;
    }
}

// The component needs a list of child components that are to be rendered dynamically
HandlebarsComponent.components = {};

export default HandlebarsComponent;
