'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _runtime = require('hbsfy/runtime');

var _runtime2 = _interopRequireDefault(_runtime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var initHandlebarsHelpers = function initHandlebarsHelpers() {
    if ('component' in _runtime2.default.helpers) {
        return;
    }

    // The component helper gives us the ability to create a component with child components.
    // An example component would look like
    // <div id="app">
    //    {{{component 'Header'}}}
    //    {{{component 'Body'}}}
    // </div>
    _runtime2.default.registerHelper('component', function (name, data) {
        var divName = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        divName = 'handlebar-component-' + divName;

        // Make sure we don't load up multiple copies of the child component
        var componentLoaded = data.data.root.component._componentIds.indexOf(divName) !== -1;
        if (!componentLoaded) {
            var component = new HandlebarsComponent.components[name](divName);
            data.data.root.component.components.push(component);
        }

        // Returns a placeholder div to render child component
        return '<div id="' + divName + '" data-component="' + name + '"></div>';
    });
};

var domElement = function domElement(identifier) {
    if ((typeof identifier === 'undefined' ? 'undefined' : _typeof(identifier)) === 'object') {
        return identifier;
    }

    return document.getElementById(identifier);
};

var HandlebarsComponent = function () {
    function HandlebarsComponent() {
        _classCallCheck(this, HandlebarsComponent);
    }

    _createClass(HandlebarsComponent, [{
        key: 'init',
        value: function init(el) {
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
    }, {
        key: 'setDispatch',
        value: function setDispatch(dispatch) {
            this.dispatch = dispatch;
        }
    }, {
        key: 'setState',
        value: function setState(state) {
            this.state = _underscore2.default.extend(this.state, state);
        }
    }, {
        key: 'getState',
        value: function getState() {
            return this.state;
        }
    }, {
        key: 'getInitialState',
        value: function getInitialState() {
            return {};
        }
    }, {
        key: 'getDefaultProps',
        value: function getDefaultProps() {
            return {};
        }
    }, {
        key: 'handleChange',
        value: function handleChange(nextProps) {
            var dispatch = this.dispatch;

            if (this.shouldComponentUpdate(nextProps, this.getState()) || this.forceUpdate) {
                this.componentWillReceiveProps(nextProps);
                this.componentWillUpdate(nextProps, this.getState());
                this.render();
                this.componentDidUpdate();
                this.cleanup();
            }

            _underscore2.default.each(this.components, function (component) {
                component.setDispatch(dispatch);
                component.handleChange(nextProps);
            });
        }
    }, {
        key: 'changesIn',
        value: function changesIn(properties, props) {
            var keysChanged = _underscore2.default.map(this.props, function (value, key) {
                if (!_underscore2.default.isEqual(value, props[key])) {
                    return key;
                }

                return null;
            });

            return _underscore2.default.intersection(keysChanged, properties).length > 0;
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(props, state) {
            if (this.properties) {
                return this.changesIn(this.properties, props);
            }

            if (!_underscore2.default.isEqual(this.props, props)) {
                return true;
            }

            return false;
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            this.props = nextProps;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {}
    }, {
        key: 'bindActions',
        value: function bindActions(el) {
            var obj = this;
            el = el || domElement(this.el);
            if (!el) {
                return;
            }

            _underscore2.default.each(el.children, function (child) {
                var data = {};

                _underscore2.default.each(child.attributes, function (attribute) {
                    if (attribute.nodeName.search('data-') !== -1) {
                        var modNodeName = attribute.nodeName.replace('data-', '').replace(/-([a-z])/gi, function ($0, $1) {
                            return $1.toUpperCase();
                        });

                        data[modNodeName] = attribute.nodeValue;
                    }
                });

                // Here, we're only tracking onclick. Eventually, we may want to track
                // more
                if (data.onclick) {
                    child.onclick = function (e) {
                        obj[data.onclick](e, data);
                    };
                }

                obj.bindActions(child);
            });
        }
    }, {
        key: 'toHtml',
        value: function toHtml() {
            var renderData = {
                component: this,
                props: this.props,
                state: this.getState()
            };

            return this.view(_underscore2.default.extend(renderData));
        }
    }, {
        key: 'render',
        value: function render() {
            var el = domElement(this.el);
            el.innerHTML = this.toHtml();

            this.bindActions(el);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            // called after render
        }
    }, {
        key: 'cleanup',
        value: function cleanup() {
            this.forceUpdate = false;
        }
    }]);

    return HandlebarsComponent;
}();

// The component needs a list of child components that are to be rendered dynamically


HandlebarsComponent.components = {};

exports.default = HandlebarsComponent;