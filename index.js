export default AutoGrid;

/**
 * AutoGrid - responsive, adaptive automatic layout that just works for you. Everything you have to
 * do is to create AutoGrid instance with argument of container element, and AutoGrid will align
 * the best layout for you.
 * NOTE. AutoGrid will turn container's position to relative.
 * @author Nikita Savchenko aka ZitRo (zitros.lab@gmail.com) (github.com/ZitRos)
 * @version 1.2.0
 * @param {HTMLElement} container - Block that contains blocks to align.
 * @param {Object} [setup] - Configuration of the grid.
 * @param {number = 400} [setup.targetCellWidth] - Target width of the grid column in pixels.
 * @param {number = 1} [setup.cellWidth] - Relative cell with to the target width.
 */

function AutoGrid (container, setup = {}) {

    if (!(container instanceof HTMLElement))
        throw new Error(`container (${container}) is not HTML element.`);

    container.style.position = "relative";

    this.CELL_WIDTH = (setup.targetCellWidth || 400) * (setup.cellWidth || 1);
    this.container = container;
    this.width = container.offsetWidth;
    this.COLUMNS = getColumnsNumber(this.width, this.CELL_WIDTH);

    /**
     * This array holds sorted grid elements. Container is a wrapper for the element.
     * @type {{ element: HTMLElement, container: HTMLElement, [width]: number=1 }[]}
     */
    this.children = [];

    /**
     * Holds the grid update timeout to prevent frequent grid updating.
     * @type {number}
     */
    this.GRID_UPDATE_TICK = 0;

    [].slice.call(container.childNodes).forEach((e) => {
        if (!(e instanceof HTMLElement)) {
            container.removeChild(e);
            return;
        }
        this.applyChild(e);
    });

    let resizeTimer = 0; // not to perform resize too frequently
    this.windowResizeHandler = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this.updateSizes(), 200);
    };
    window.addEventListener("resize", this.windowResizeHandler);

    if (!this.supported())
        return;

    /**
     * @type {MutationObserver}
     * @private
     */
    this._observer = new MutationObserver((mutations) => mutations.forEach(() => {
        this.updateGrid();
    }));

    this._observer.observe(container, { childList: true, subtree: true });

}

function getColumnsNumber (width, cellWidth = 400) {
    return Math.max(1, Math.round(width / cellWidth));
}

/**
 * Returns if AutoGrid is supported by the browser.
 * @returns {boolean}
 */
AutoGrid.prototype.supported = function () {
    return !!MutationObserver;
};

/**
 * Returns element attached to the grid or null if no such element were attached.
 * @private
 * @returns {*} - AutoGrid.children
 */
AutoGrid.prototype.getChild = function (element) {

    let el = null;

    this.children.forEach(c => {
        if (c.element !== element)
            return;
        el = c;
    });

    return el;

};

/**
 * Removes all children.
 */
AutoGrid.prototype.clear = function () {
    this.children = this.children.filter(({ container }) => {
        if (container.parentNode)
            container.parentNode.removeChild(container);
        return false;
    });
};

/**
 * This function disables AutoGrid automatic layout.
 */
AutoGrid.prototype.disable = function () {

    if (!this.windowResizeHandler) return;

    window.removeEventListener("resize", this.windowResizeHandler);
    this.windowResizeHandler = null;
    this.container = null;

    if (this._observer)
        this._observer.disconnect();

};

/**
 * Returns if child element applied to this grid is still applied to it.
 * @param element
 * @returns {boolean}
 */
AutoGrid.prototype.childExists = function (element) {

    return !!this.children.filter((e) => element === e.element).length;

};

/**
 * @param {HTMLElement} element
 * @param {*} [options] - Additional options like { width: 2 }.
 */
AutoGrid.prototype.applyChild = function (element, options) {

    if (this.childExists(element)) return;

    let container = document.createElement("div"),
        obj = {
            element: element,
            container: container,
            width: 1
        };

    container.className = "AutoGrid-container";
    container.style.position = "absolute";
    container.appendChild(element);
    Object.assign(obj, options || {});

    this.children.push(obj);

    this.updateGrid();

};

/**
 * @param {HTMLElement} element
 * @param {HTMLElement} newElement
 * @param {boolean=true} keepOptions - if it is needed to keep the same options of the element
 *                                     to be replaced.
 * @returns {boolean} success of the operation
 */
AutoGrid.prototype.replaceChild = function (element, newElement, keepOptions = true) {

    let child = this.getChild(element);

    if (!child || !child.element.parentNode)
        return false;

    child.element.parentNode.replaceChild(newElement, child.element);
    child.element = newElement;

    if (!keepOptions) {
        this.children[this.children.indexOf(child.element)] = {
            element: newElement,
            container: child.container,
            width: 1
        };
    }

    return true;
    
};

/**
 * @param {HTMLElement} element
 * @param {*} options - Additional options like { width: 2 }.
 * @returns {boolean} - Success of update (if the element is found).
 */
AutoGrid.prototype.updateChild = function (element, options) {

    let updated = this.getChild(element);

    if (updated) {
        Object.assign(updated, options);
        this.updateGrid();
    }

    return !!updated;

};

/**
 * Call this function if any of the grid elements was updated. You don't need to call updateSizes
 * after.
 * This function may be called a lot of times once, it won't trigger the actual update. It will be
 * triggered by the next frame.
 */
AutoGrid.prototype.updateGrid = function () {
    
    if (this.GRID_UPDATE_TICK)
        return;
    this.GRID_UPDATE_TICK = setTimeout(() => {
        this.GRID_UPDATE_TICK = 0;
        this._updateGrid();
    }, 1);
    
};

/**
 * This is a private updateGrid function for immediate grid update.
 * @private
 */
AutoGrid.prototype._updateGrid = function () {

    let i, columnWidth = Math.floor(this.width / this.COLUMNS),
        columnHeights = (() => {
            let arr = [], i;
            for (i = 0; i < this.COLUMNS; i++)
                arr.push(0);
            return arr;
        })();

    /**
     * WIDTH = 3
     * C1 C2 C3 C4 C5
     * ## ## ## ## ##
     * ## ##    ##
     * ##       ##
     * (______) ##
     *
     * This function returns sorted array of column indices to fill the grid.
     */
    function getNextColumnIndices (colSpan) {
        let iArr = Array.from({ length: columnHeights.length }, (v, k) => k).sort((i1, i2) => {
                if (columnHeights[i1] === columnHeights[i2])
                    return 0;
                return columnHeights[i1] > columnHeights[i2] ? 1 : -1;
            }), rArr;
        for (let i = colSpan; i <= iArr.length; i++) {
            rArr = iArr.slice(0, i).sort();
            let c = 1, u;
            for (u = 1; u < rArr.length; u++)
                if (rArr[u - 1] + 1 === rArr[u]) {
                    if (++c === colSpan) {
                        u++;
                        break;
                    }
                } else {
                    c = 1;
                }
            if (c === colSpan) {
                rArr = rArr.slice(u - colSpan, u);
                break;
            }
        }
        return rArr ? rArr : Array.from({ length: columnHeights.length }, (v, k) => k);
    }

    for (i = 0; i < this.children.length; i++) {

        let block = this.children[i];
        let colSpan = Math.min(block.width || 1, this.COLUMNS),
            colIndices = getNextColumnIndices(colSpan),
            minTop = Math.max.apply(Math, colIndices.map(i => columnHeights[i])),
            left = colIndices[0] * columnWidth + "px",
            top = minTop + "px";

        if (!block.container.parentNode) {
            block.container.style.left = left;
            block.container.style.top = top;
            block.container.style.width = columnWidth * colSpan + "px";
            this.container.appendChild(block.container);
        } else {
            if (block.container.style.left !== left)
                block.container.style.left = left;
            if (block.container.style.top !== top)
                block.container.style.top = top;
            if (block.container.style.width !== (columnWidth * colSpan) + "px")
                block.container.style.width = (columnWidth * colSpan) + "px";
        }

        colIndices.forEach(index => {
            columnHeights[index] = minTop + block.container.offsetHeight;
        });

        // Adding/updating of nodes may cause scrollbar to appear. This changes the width of the
        // container. To prevent inset containers from flowing we need to recalculate sizes as
        // soon as we noticed size change. This won't take a lot of resources as not many cards
        // needed to trigger scrollbar appear.
        if (this.width !== this.container.offsetWidth) {
            this.updateSizes();
            return;
        }

    }

    this.container.style.height = columnHeights.reduce((a, b) => Math.max(a, b)) + "px";

    // Yet another check required in case the height of the block is reduced and scrollbar
    // disappears.
    if (this.width !== this.container.offsetWidth) {
        this.updateSizes();
        return;
    }

};

/**
 * Call this function if the layout was updated and AutoGrid for some reasons were not able to
 * detect this update.
 */
AutoGrid.prototype.updateSizes = function () {

    if (this.width === this.container.offsetWidth) return;

    this.width = this.container.offsetWidth;
    this.COLUMNS = getColumnsNumber(this.width, this.CELL_WIDTH);

    this.updateGrid();

};