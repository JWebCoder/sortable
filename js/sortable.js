/*jslint browser:true */
/*jslint node: true */
/*global j */
"use strict";
j.sortable = {
    init: function () {
        var touchDevice;
        this.selector = 'table[data-sortable]';
        touchDevice = 'touchstart' in document.documentElement;
        this.clickEvent = touchDevice ? 'touchstart' : 'click';
        this.numberRegExp = /^-?[£$¤]?[\d,.]+%?$/;
    },
    setTables: function (selector) {
        var table, tables, results, index, len;
        if (selector !== undefined) {
            tables = j.selectByQuery(selector);
        } else {
            tables = j.selectByQuery(this.selector);
        }
        results = [];
        j.forEach(tables, function (table) {
            results.push(this.setTable(table));
        }, this);
        return results;
    },
    
    setTable: function (table) {
        var indexTh, th, ths, len, header;
        if ((table.tHead === null) || (table.tHead.rows.length !== 1)) {
            return;
        }
        if (table.getAttribute('data-sortable-initialized') === 'true') {
            return;
        }
        table.setAttribute('data-sortable-initialized', 'true');
        ths = j.selectByTag("th", table);
        for (indexTh = 0, len = ths.length; indexTh < len; indexTh += 1) {
            th = ths[indexTh];
            if (th.getAttribute('data-sortable') !== 'false') {
                this.setupClickableTH(table, th, indexTh);
            }
        }
        return table;
    },
    
    setupClickableTH: function (table, th, i) {
        var type, self;
        self = this;
        type = this.getColumnType(table, i);
        j.addEvent(th, this.clickEvent, function (e) {
            var newSortedDirection,
                row,
                rowArray,
                sorted,
                sortedDirection,
                tBody,
                ths,
                index,
                len,
                tBodyRows,
                results,
                defaultSort;
            sorted = this.getAttribute('data-sorted') === 'true';
            defaultSort = this.getAttribute('data-default-direction');
            sortedDirection = this.getAttribute('data-sorted-direction');
            if (sorted) {
                newSortedDirection = sortedDirection === 'ascending' ? 'descending' : 'ascending';
            } else {
                if (defaultSort !== null) {
                    newSortedDirection = defaultSort;
                } else {
                    newSortedDirection = type.defaultSortDirection;
                }
            }
            ths = j.selectByQuery('th', this.parentNode);
            for (index = 0, len = ths.length; index < len; index += 1) {
                th = ths[index];
                th.setAttribute('data-sorted', 'false');
                th.removeAttribute('data-sorted-direction');
            }
            this.setAttribute('data-sorted', 'true');
            this.setAttribute('data-sorted-direction', newSortedDirection);
            tBody = table.tBodies[0];
            rowArray = [];
            tBodyRows = tBody.rows;
            for (index = 0, len = tBodyRows.length; index < len; index += 1) {
                row = tBodyRows[index];
                rowArray.push([self.getNodeValue(row.cells[i]), row]);
            }
            if (sorted) {
                rowArray.reverse();
            } else {
                rowArray.sort(type.compare);
                if (newSortedDirection !== type.defaultSortDirection) {
                    rowArray.reverse();
                }
            }
            results = [];
            for (index = 0, len = rowArray.length; index < len; index += 1) {
                results.push(tBody.appendChild(rowArray[index][1]));
            }
            return results;
        });
        if (th.getAttribute("data-sortable-default") === "") {
            j.triggerEvent(th, "click");
        }
    },
    
    getColumnType: function (table, i) {
        var row, text, index, len, tBodyRows;
        tBodyRows = table.tBodies[0].rows;
        for (index = 0, len = tBodyRows.length; index < len; index += 1) {
            row = tBodyRows[index];
            text = this.getNodeValue(row.cells[i]);
            if (text !== '') {
                if (text.match(this.numberRegExp)) {
                    return this.types.numeric;
                }
                if (!isNaN(Date.parse(text))) {
                    return this.types.date;
                }
            }
        }
        return this.types.alpha;
    },
    
    getNodeValue: function (node) {
        if (!node) {
            return '';
        }
        if (node.getAttribute('data-value') !== null) {
            return node.getAttribute('data-value');
        }
        if (typeof node.innerText !== 'undefined') {
            return j.trim(node.innerText);
        }
        return j.trim(node.textContent);
    },
    
    types: {
        numeric: {
            defaultSortDirection: 'descending',
            compare: function (a, b) {
                var aa, bb;
                aa = parseFloat(a[0].replace(/[^0-9.-]/g, ''), 10);
                bb = parseFloat(b[0].replace(/[^0-9.-]/g, ''), 10);
                if (isNaN(aa)) {
                    aa = 0;
                }
                if (isNaN(bb)) {
                    bb = 0;
                }
                return bb - aa;
            }
        },
        alpha: {
            defaultSortDirection: 'ascending',
            compare: function (a, b) {
                return a[0].localeCompare(b[0]);
            }
        },
        date: {
            defaultSortDirection: 'ascending',
            compare: function (a, b) {
                var aa, bb;
                aa = Date.parse(a[0]);
                bb = Date.parse(b[0]);
                if (isNaN(aa)) {
                    aa = 0;
                }
                if (isNaN(bb)) {
                    bb = 0;
                }
                return aa - bb;
            }
        }
    }
};

j.sortable.init();