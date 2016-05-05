'use strict';

import _ from 'underscore';

let domElement = function(identifier) {
    if (typeof identifier === 'object') {
        return identifier;
    }

    return document.getElementById(identifier);
};

class HandlebarsComponent
{
    init(el)
    {
        this._componentIds = [];
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
        let willUpdate = this.shouldComponentUpdate(nextProps, this.getState()) || this.forceUpdate;

        if (willUpdate) {
            this.componentWillReceiveProps(nextProps);
            this.componentWillUpdate(nextProps, this.getState());
            this.render();
            this.cleanup();
        }

        _.each(this.components, function (component) {
            component.setDispatch(dispatch);
            component.handleChange(nextProps);
        });

        if (willUpdate) {
            this.componentDidUpdate();
        }
    }

    changesIn(properties, props)
    {
        var oldProps = this.props;
        var found = _.find(properties, function (property) {
            return !_.isEqual(props[property], oldProps[property]);
        });

        return found ? true : false;
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
            var actionableProperties = [ 'onclick', 'onsubmit' ];
            _.each(actionableProperties, function (property) {
                if (data[property]) {
                    child[property] = function(e) {
                        obj[data[property]](e, data);

                        return false;
                    };
                }
            });

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

export default HandlebarsComponent;
