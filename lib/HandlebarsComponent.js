'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
            var willUpdate = this.shouldComponentUpdate(nextProps, this.getState()) || this.forceUpdate;

            if (willUpdate) {
                this.componentWillReceiveProps(nextProps);
                this.componentWillUpdate(nextProps, this.getState());
                this.render();
                this.cleanup();
            }

            _underscore2.default.each(this.components, function (component) {
                component.setDispatch(dispatch);
                component.handleChange(nextProps);
            });

            if (willUpdate) {
                this.componentDidUpdate();
            }
        }
    }, {
        key: 'changesIn',
        value: function changesIn(properties, props) {
            var oldProps = this.props;
            var found = _underscore2.default.find(properties, function (property) {
                return !_underscore2.default.isEqual(props[property], oldProps[property]);
            });

            return found ? true : false;
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
                var actionableProperties = ['onclick', 'onsubmit'];
                _underscore2.default.each(actionableProperties, function (property) {
                    if (data[property]) {
                        child[property] = function (e) {
                            obj[data[property]](e, data);

                            return false;
                        };
                    }
                });

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

exports.default = HandlebarsComponent;