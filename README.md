# AutoGrid

The vanilla JavaScript ES6 minimalistic adaptive layout module for your content. The solution which
"just works" --- enable the AutoGrid and go further.

Preview
-------

The sample of how the AutoGrid automatic layout works:

![Preview](https://cloud.githubusercontent.com/assets/4989256/14505269/1aa25c46-01c1-11e6-8841-da808192ea99.png)

Features
--------

+ Automatic layout for desktop and mobile devices (3 columns for 1366x768, 5 columns for 1920x1080);
+ Very simple usage and binding;
+ Fast layout;
+ Cards width customizable size;
+ The only thing you need is to style the grid with CSS.

Installation
------------

You can just take ready-to-use `index.js` file from this repository.
But the better way would be to clone this repository as a git submodule into your project:

```bash
cd your/project/directory
git submodule add https://github.com/ZitRos/AutoGrid.git source/client/js/AutoGrid
```

**NOTE:** `your/project/directory` is the directory **of your project**, `source/js/AutoGrid`
is the sub-directory **in your project** where this repository will be cloned.

Usage
-----

Define an empty container in which auto-aligned cards will be placed: 
```html
<div id="theGrid"></div>
```

In client-side JavaScript, you need to require AutoGrid module. See the example below:
 
```js
import AutoGrid from "./AutoGrid"; // navigate the directory you cloned AutoGrid to

let container = document.getElementById("theGrid"), // your container goes here
    grid = new AutoGrid(container);
    
for (let i = 1; i < 5; i++) { // cards add demo
    let div = document.createElement("DIV");
    div.innerHTML = `<h3>Card #${ i }</h3><p>This is a sample card!</p>`;
    grid.applyChild(div); // applying childs to the grid
}
```

This will result with the next HTML on which you can apply any styles you want:
```html
<div id="theGrid">
    <div class="AutoGrid-container">
        <div>
            <h3>Card #1</h3>
            <p>This is a sample card!</p>
        </div>
    </div>
    <div class="AutoGrid-container">
        <div>
            <h3>Card #2</h3>
            <p>This is a sample card!</p>
        </div>
    </div>
    <div class="AutoGrid-container">
        <div>
            <h3>Card #3</h3>
            <p>This is a sample card!</p>
        </div>
    </div>
    <div class="AutoGrid-container">
        <div>
            <h3>Card #4</h3>
            <p>This is a sample card!</p>
        </div>
    </div>
</div>
```

**NOTE:** You can animate AutoGrid blocks (`.AutoGrid-container` class), but **do not** add `height`
property transition, this may have unexpected result due to AutoGrid size update. Do not add any
margin or padding to this class as well, style the nested container instead.
Styling sample (SCSS):

```css
.AutoGrid-container {
    transition: left .3s ease, top .3s ease, width .3s ease;
}
```

API
---

+ [AutoGrid(container)](#autogridcontainer)
    + [applyChild(element, [options])](#applychildelement-options)
    + [childExists(element)](#childexistselement)
    + [clear()](#clear)
    + [disable()](#disable)
    + [updateChild(element, options)](#updatechildelement-options)
    + [updateGrid()](#updategrid)
    + [updateSizes()](#updatesizes)
    
##### AutoGrid(container)
Constructor. `container` is the block nesting the grid elements. Note that `container`'s `position`
style will turn to `relative` after constructor is initialized.

##### applyChild(element, options)
Applies `element` to the grid. Note that the element will not be applied to `container` directly,
but to the `.AutoGrid-container` block which is a child of `container`. `options` here is the
optional argument having the next specification:

```js
{
    width: 2 // [default = 1] The width of a card.
}
```

##### childExists(element)
Returns `Boolean` value if the `element` are applied to the grid.

##### clear()
Removes any children of the grid.

##### disable()
Removes any event listeners attached by the `AutoGrid`.

##### updateChild(element, options)
Updates child's `options`. For the `options` specification, see applyChild function.

##### updateGrid()
Call this function if any of the grid elements was updated. You don't need to call updateSizes
after.

##### updateSizes()
Call this function if the layout was updated and AutoGrid for some reasons were not able to detect
this update.

Development
-----------

Feel free to open pull requests and create issues or feature requests.