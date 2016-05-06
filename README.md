# handlebars-redux

handlebars-redux is a framework to connect a handlebars component to the redux lifecycle. An example application using handlebars-redux can be found [here](https://github.com/researchsquare/handlebars-redux-example). This package is composed of:

## `connect`

This method takes a store parameter (created when you call `createStore` from `redux`) and a `HandlebarsComponent`. All state changes are passed through this root component to all child components.

## `registerComponents`

This expects two parameters. First, this needs to be provided the Handlebars runtime (tested w/ `handlebars/runtime` and `hbsfy/runtime`). Second, this expects a list of components that are referenced by the root component.

## `HandlebarsComponent`

Extend this class to enable managing state changes. At a minimum, this class should look something like...

```
'use strict';

import template from './../templates/template.hbs';
import { HandlebarsComponent } from 'handlebars-redux';

class Component extends HandlebarsComponent
{
    constructor(el)
    {
        super();
        this.view = template;
        this.init(el);
    }
}

export default Component;
```

The information specified in your reducer will be passed into this component and can be accessed in the `.hbs` template file as `{{props.somePieceOfState}}`. These components roughly follow the react lifecycle.
