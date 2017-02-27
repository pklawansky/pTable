(function (pTable, $, undefined) {

    //***Defining global variables

    var searchForm, table, options;

    //***Defining functions

    var getSortKey = function () {
        return searchForm.find("#SortExpression");
    };

    var getSortDir = function () {
        return searchForm.find("#SortDirection");
    };

    var getCurrentHeading = function () {
        return table.find("th.sortHead[data-key='" + getSortKey().val() + "']");
    };

    var getPaginationRow = function () {
        return table.find("tr.paginationRow");
    };

    var getPageSizeSelect = function () {
        return getPaginationRow().find(".pageSizeSelect");
    };

    var getPageSize = function () {
        return parseFloat(searchForm.find("#PageSize").val());
    };

    var setPageSizeForm = function (pageSize) {
        searchForm.find("#PageSize").val(pageSize);
    };

    var setPageNumber = function (pageNumber) {
        searchForm.find("#PageNumber").val(pageNumber);
    };

    var getPageNumber = function (pageNumber) {
        return parseFloat(searchForm.find("#PageNumber").val());
    };

    var getTableRowCount = function () {
        return parseFloat(table.data("rowcount"));
    };

    var search = function () {
        searchForm.submit();
    };

    var getPageNumberLinks = function () {
        return getPaginationRow().find(".paginationNumberLink");
    };

    var setupSorting = function () {

        var sortKey = getSortKey();
        var sortDir = getSortDir();
        var headings = table.find("th.sortHead");

        //if these don't exist won't work anyway
        if (sortKey.length == 0 || sortDir.length == 0 || headings.length == 0) {
            return;
        }

        var currentHeading = getCurrentHeading();

        if (currentHeading.length > 0) {
            var arrow = sortDir.val() == "Ascending" ? "&#x25B2;" : "&#x25BC;";
            currentHeading.append(arrow);
        }

        //setup click event
        headings.click(function () {
            var heading = $(this);
            var headingKey = heading.data("key");
            var currentSortKey = getSortKey();
            var currentSortDir = getSortDir();

            //alternate sort dir
            if (headingKey == currentSortKey.val()) {
                if (currentSortDir.val() == "Ascending") {
                    currentSortDir.val("Descending");
                }
                else {
                    currentSortDir.val("Ascending");
                }
            }
                //change sort key
            else {
                currentSortKey.val(headingKey);
            }

            search();
        });
    };

    var setupPagination = function () {

        var colcount = table.find("th").length;

        var pagesize = getPageSize();

        var pageSizes = [20, 50, 100, 200, 500];

        if (options != undefined && options != null && options.pageSizes != undefined && options.pageSizes != null) {
            pageSizes = options.pageSizes;
        }

        var count = getTableRowCount();
        var pagenumber = getPageNumber();

        var firstpagenumber = 1;
        var lastpagenumber = Math.ceil(count / pagesize);

        var minpagenumber = pagenumber - 5;
        var maxpagenumber = pagenumber + 5;

        while (minpagenumber < 1) {
            minpagenumber++;
            maxpagenumber++;
        }

        while (maxpagenumber > lastpagenumber) {
            maxpagenumber--;
            if (minpagenumber > firstpagenumber) {
                minpagenumber--;
            }
        }

        var pageNumbers = new Array();
        for (var iter = minpagenumber; iter <= maxpagenumber; iter++) {
            pageNumbers.push(iter);
        }

        var newrowhtml = '<tr class="paginationRow">';
        newrowhtml += '<td colspan="' + colcount + '">';
        newrowhtml += '<span>Page Size: </span><select class="pageSizeSelect">';

        $.each(pageSizes, function (idx, val) {
            newrowhtml += '<option value="' + val + '" ' + (pagesize == val ? 'selected' : '') + '>' + val + '</option>';
        });

        newrowhtml += '</select> | Page Number: ';

        if (pagenumber > firstpagenumber) {
            newrowhtml += ' <a href="#" class="paginationNumberLink" data-no="' + (pagenumber - 1).toString() + '">&lt;</a> ';
        }

        if (pagenumber != firstpagenumber && pageNumbers.indexOf(firstpagenumber) == -1) {
            newrowhtml += ' <a href="#" class="paginationNumberLink" data-no="' + firstpagenumber.toString() + '">' + firstpagenumber.toString() + '</a> ... ';
        }

        $.each(pageNumbers, function (idx, val) {
            if (val == pagenumber) {
                newrowhtml += ' ' + val.toString() + ' ';
            }
            else {
                newrowhtml += ' <a href="#" class="paginationNumberLink" data-no="' + val.toString() + '">' + val.toString() + '</a> ';
            }

        });

        if (pagenumber != lastpagenumber && pageNumbers.indexOf(lastpagenumber) == -1) {
            newrowhtml += ' ... <a href="#" class="paginationNumberLink" data-no="' + lastpagenumber.toString() + '">' + lastpagenumber.toString() + '</a> ';
        }

        if (pagenumber < lastpagenumber) {
            newrowhtml += ' <a href="#" class="paginationNumberLink" data-no="' + (pagenumber + 1).toString() + '">&gt;</a> ';
        }

        newrowhtml += '| Total rows: ' + count;


        newrowhtml += '</td>';
        newrowhtml += '</tr>';

        table.append(newrowhtml);

        getPageSizeSelect().change(function () {
            var newval = $(this).val();
            setPageSizeForm(newval);
            setPageNumber(1);
            search();
        });

        getPageNumberLinks().click(function (event) {
            event.preventDefault();
            var page = parseFloat($(this).data("no").toString().trim());
            setPageNumber(page);
            search();
        });

        searchForm.find("input, select, textarea").change(function () {
            setPageNumber(1);
        });
    };

    /**
* sorting - form needs SortExpression (query column name), SortDirection (Ascending, Descending). table needs th with class sortHead and data-key of value equal to SortExpression
* @namespace pTable.js
* @method sorting
* @param {Object} _searchForm - form used to search table
* @param {Object} _table - table with sortable headings
* @return {void} no return
*/
    pTable.sorting = function (_searchForm, _table) {
        searchForm = _searchForm;
        table = _table;
        setupSorting();
    };

    /**
* pagination - form needs SortExpression (query column name), SortDirection (Ascending, Descending). table needs th with class sortHead and data-key of value equal to SortExpression, table must have data-rowcount with total results without pagination
* @namespace pTable.js
* @method pagination
* @param {Object} _searchForm - form used to search table
* @param {Object} _table - table with sortable headings
* @param {Object} _options - json object with options for pageSizes (Array)
* @return {void} no return
*/
    pTable.pagination = function (_searchForm, _table, _options) {
        searchForm = _searchForm;
        table = _table;
        options = _options;
        setupPagination();
    };

    /**
* sortingPagination - form needs SortExpression (query column name), SortDirection (Ascending, Descending). table needs th with class sortHead and data-key of value equal to SortExpression, table must have data-rowcount with total results without pagination
* @namespace pTable.js
* @method sortingPagination
* @param {Object} _searchForm - form used to search table
* @param {Object} _table - table with sortable headings
* @param {Object} _options - json object with options for pageSizes (Array)
* @return {void} no return
*/
    pTable.sortingPagination = function (_searchForm, _table, _options) {
        searchForm = _searchForm;
        table = _table;
        options = _options;
        setupSorting();
        setupPagination();
    };

}(window.pTable = window.pTable || {}, jQuery));
