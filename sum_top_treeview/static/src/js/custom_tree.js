/*odoo.define('my_module.custom_list_view', function (require) {
    "use strict";

    var core = require('web.core');
    var ListView = require('web.ListView');
    var ListRenderer = require('web.ListRenderer');
    var viewRegistry = require('web.view_registry');

    var CustomListRenderer = ListRenderer.extend({
        /!**
         * @override
         * @private
         * @returns {Promise}
         *!/

        init: function (parent, state, params) {
            console.log("CustomListRenderer: init");
            debugger;
            this._super.apply(this, arguments);
        },
        _renderView: function () {
            console.log("CustomListRenderer: _renderView");
            var self = this;
            return this._super.apply(this, arguments).then(function () {
                self._addSummaryRow();
                return Promise.resolve();
            });
        },
        _renderBodyCell: function (record, node, index, options) {
            var $cell = this._super.apply(this, arguments);

            // Kiểm tra xem cột có thuộc tính sum không
            console.log("CustomListRenderer: _renderBodyCell");
            return $cell;
        },

        /!**
         * Thêm hàng tổng hợp ở đầu tbody
         * @private
         *!/
        _addSummaryRow: function () {
            // Lấy thông tin về các trường có thuộc tính sum từ arch
            var fieldsWithSum = [];
            _.each(this.arch.children, function (node) {
                if (node.tag === 'field' && node.attrs.sum) {
                    fieldsWithSum.push({
                        fieldName: node.attrs.name,
                        label: node.attrs.sum
                    });
                }
            });

            if (fieldsWithSum.length === 0) {
                return; // Không có trường nào cần tổng hợp
            }

            var $table = this.$el.find('table');
            var $tbody = $table.find('tbody');

            // Tạo hàng tổng hợp
            var $summaryRow = $('<tr>').addClass('o_custom_summary_row');

            // Thêm các ô vào hàng tổng hợp
            _.each(this.columns, function (column) {
                var $cell = $('<td>');
                var fieldWithSum = _.find(fieldsWithSum, function (field) {
                    return field.fieldName === column.attrs.name;
                });

                if (fieldWithSum) {
                    // Lấy giá trị tổng hợp từ model
                    var sumValue = self._getSumValue(fieldWithSum.fieldName);
                    var formattedValue = self._formatMonetary(sumValue, column);
                    $cell.text(fieldWithSum.label + ': ' + (formattedValue || '0'));
                    $cell.addClass('o_list_number');
                }

                $summaryRow.append($cell);
            });

            // Chèn hàng tổng hợp vào đầu tbody
            $tbody.prepend($summaryRow);
        },

        /!**
         * Lấy giá trị tổng từ model
         * @private
         * @param {String} fieldName - Tên trường cần tính tổng
         * @returns {Number} - Giá trị tổng
         *!/
        _getSumValue: function (fieldName) {
            var sum = 0;
            this.state.data.forEach(function (record) {
                var value = record.data[fieldName];
                if (!isNaN(value)) {
                    sum += value;
                }
            });
            return sum;
        },

        /!**
         * Định dạng giá trị tiền tệ
         * @private
         * @param {Number} value - Giá trị cần định dạng
         * @param {Object} column - Thông tin cột
         * @returns {String} - Giá trị đã định dạng
         *!/
        _formatMonetary: function (value, column) {
            if (column.attrs.widget === 'monetary' || column.attrs.widget === 'float') {
                return this._getFormatter(column.attrs.widget)(value);
            }
            return value;
        },

        /!**
         * Lấy hàm định dạng phù hợp với widget
         * @private
         * @param {String} widget - Loại widget
         * @returns {Function} - Hàm định dạng
         *!/
        _getFormatter: function (widget) {
            var formatters = {
                monetary: core.format_value,
                float: core.format_value,
            };
            return formatters[widget] || function (val) {
                return val;
            };
        }
    });

    var CustomListView = ListView.extend({
        config: _.extend({}, ListView.prototype.config, {
            Renderer: CustomListRenderer,
        }),
    });

    viewRegistry.add('custom_list1', CustomListView);

    return {
        CustomListRenderer: CustomListRenderer,
        CustomListView: CustomListView,
    };
});*/
/*odoo.define('survey.question_page_one2many1212', function (require){
"use strict";

var Context = require('web.Context');
var FieldOne2Many = require('web.relational_fields').FieldOne2Many;
var FieldRegistry = require('web.field_registry');
var ListRenderer = require('web.ListRenderer');
var config = require('web.config');

var SectionListRenderer = ListRenderer.extend({
    init: function (parent, state, params) {
        this.sectionFieldName = "is_page";
        console.log("SectionListRenderer: init");
        this._super.apply(this, arguments);
    },
    _checkIfRecordIsSection: function (id){
        var record = this._findRecordById(id);
        return record && record.data[this.sectionFieldName];
    },
    _findRecordById: function (id){
        return _.find(this.state.data, function (record){
            return record.id === id;
        });
    },
    /!**
     * Allows to hide specific field in case the record is a section
     * and, in this case, makes the 'title' field take the space of all the other
     * fields
     * @private
     * @override
     * @param {*} record
     * @param {*} node
     * @param {*} index
     * @param {*} options
     *!/
    _renderBodyCell: function (record, node, index, options){
        var $cell = this._super.apply(this, arguments);

        var isSection = record.data[this.sectionFieldName];

        if (isSection){
            if (node.attrs.widget === "handle" || node.attrs.name === "random_questions_count"){
                return $cell;
            } else if (node.attrs.name === "title"){
                var nbrColumns = this._getNumberOfCols();
                if (this.handleField){
                    nbrColumns--;
                }
                if (this.addTrashIcon){
                    nbrColumns--;
                }
                if (record.data.questions_selection === "random"){
                    nbrColumns--;
                }
                $cell.attr('colspan', nbrColumns);
            } else {
                $cell.removeClass('o_invisible_modifier');
                return $cell.addClass('o_hidden');
            }
        }
        return $cell;
    },
    /!**
     * Adds specific classes to rows that are sections
     * to apply custom css on them
     * @private
     * @override
     * @param {*} record
     * @param {*} index
     *!/
    _renderRow: function (record, index){
        var $row = this._super.apply(this, arguments);
        if (record.data[this.sectionFieldName]) {
            $row.addClass("o_is_section");
        }
        return $row;
    },
    /!**
     * Adding this class after the view is rendered allows
     * us to limit the custom css scope to this particular case
     * and no other
     * @private
     * @override
     *!/
    _renderView: function (){
        var def = this._super.apply(this, arguments);
        var self = this;
        return def.then(function () {
            self.$('table.o_list_table').addClass('o_section_list_view');
        });
    },
    // Handlers
    /!**
     * Overridden to allow different behaviours depending on
     * the row the user clicked on.
     * If the row is a section: edit inline
     * else use a normal modal
     * @private
     * @override
     * @param {*} ev
     *!/
    _onRowClicked: function (ev){
        var parent = this.getParent();
        var recordId = $(ev.currentTarget).data('id');
        var is_section = this._checkIfRecordIsSection(recordId);
        if (is_section && parent.mode === "edit"){
            this.editable = "bottom";
        } else {
            this.editable = null;
        }
        this._super.apply(this, arguments);
    },
    /!**
     * Overridden to allow different behaviours depending on
     * the cell the user clicked on.
     * If the cell is part of a section: edit inline
     * else use a normal edit modal
     * @private
     * @override
     * @param {*} ev
     *!/
    _onCellClick: function (ev){
        var parent = this.getParent();
        var recordId = $(ev.currentTarget.parentElement).data('id');
        var is_section = this._checkIfRecordIsSection(recordId);
        if (is_section && parent.mode === "edit"){
            this.editable = "bottom";
        } else {
            this.editable = null;
            this.unselectRow();
        }
        this._super.apply(this, arguments);
    },
    /!**
     * In this case, navigating in the list caused issues.
     * For example, editing a section then pressing enter would trigger
     * the inline edition of the next element in the list. Which is not desired
     * if the next element ends up being a question and not a section
     * @override
     * @param {*} ev
     *!/
    _onNavigationMove: function (ev){
        this.unselectRow();
    },
});

var SectionFieldOne2Many = FieldOne2Many.extend({
    init: function (parent, name, record, options){
        this._super.apply(this, arguments);
        this.sectionFieldName = "is_page";
        console.log("SectionFieldOne2Many: init");
        this.rendered = false;
    },
    /!**
     * Overridden to use our custom renderer
     * @private
     * @override
     *!/
    _getRenderer: function (){
        if (this.view.arch.tag === 'tree'){
            return SectionListRenderer;
        }
        return this._super.apply(this, arguments);
    },
    /!**
     * Overridden to allow different behaviours depending on
     * the object we want to add. Adding a section would be done inline
     * while adding a question would render a modal.
     * @private
     * @override
     * @param {*} ev
     *!/
    _onAddRecord: function (ev) {
        this.editable = null;
        if (!config.device.isMobile){
            var context_str = ev.data.context && ev.data.context[0];
            var context = new Context(context_str).eval();
            if (context['default_' + this.sectionFieldName]){
                this.editable = "bottom";
            }
        }
        this._super.apply(this, arguments);
    },
});

FieldRegistry.add('custom_list1', SectionFieldOne2Many);
});*/
/*
odoo.define('survey.question_page_one2many1212', function (require){
"use strict";

var Context = require('web.Context');
var FieldOne2Many = require('web.relational_fields').FieldOne2Many;
var FieldRegistry = require('web.field_registry');
var ListRenderer = require('web.ListRenderer');
var config = require('web.config');
var core = require('web.core');

var SectionListRenderer = ListRenderer.extend({
    init: function (parent, state, params) {
        this.sectionFieldName = "is_page";
        console.log("SectionListRenderer: init");
        this._super.apply(this, arguments);
    },
    _checkIfRecordIsSection: function (id){
        var record = this._findRecordById(id);
        return record && record.data[this.sectionFieldName];
    },
    _findRecordById: function (id){
        return _.find(this.state.data, function (record){
            return record.id === id;
        });
    },
    /!**
     * Allows to hide specific field in case the record is a section
     * and, in this case, makes the 'title' field take the space of all the other
     * fields
     * @private
     * @override
     * @param {*} record
     * @param {*} node
     * @param {*} index
     * @param {*} options
     *!/
    _renderBodyCell: function (record, node, index, options){
        var $cell = this._super.apply(this, arguments);

        var isSection = record.data[this.sectionFieldName];

        if (isSection){
            if (node.attrs.widget === "handle" || node.attrs.name === "random_questions_count"){
                return $cell;
            } else if (node.attrs.name === "title"){
                var nbrColumns = this._getNumberOfCols();
                if (this.handleField){
                    nbrColumns--;
                }
                if (this.addTrashIcon){
                    nbrColumns--;
                }
                if (record.data.questions_selection === "random"){
                    nbrColumns--;
                }
                $cell.attr('colspan', nbrColumns);
            } else {
                $cell.removeClass('o_invisible_modifier');
                return $cell.addClass('o_hidden');
            }
        }
        return $cell;
    },
    /!**
     * Adds specific classes to rows that are sections
     * to apply custom css on them
     * @private
     * @override
     * @param {*} record
     * @param {*} index
     *!/
    _renderRow: function (record, index){
        var $row = this._super.apply(this, arguments);
        if (record.data[this.sectionFieldName]) {
            $row.addClass("o_is_section");
        }
        return $row;
    },
    /!**
     * Adding this class after the view is rendered allows
     * us to limit the custom css scope to this particular case
     * and no other
     * @private
     * @override
     *!/
    _renderView: function (){
        var def = this._super.apply(this, arguments);
        var self = this;
        return def.then(function () {
            self.$('table.o_list_table').addClass('o_section_list_view');
            self._addSummaryRow();
        });
    },

    /!**
     * Thêm hàng tổng hợp sau khi view được render
     * @private
     *!/
    _addSummaryRow: function () {
        // Lấy thông tin về các trường có thuộc tính sum từ arch
        var fieldsWithSum = [];
        _.each(this.arch.children, function (node) {
            if (node.tag === 'field' && node.attrs.sum) {
                fieldsWithSum.push({
                    fieldName: node.attrs.name,
                    label: node.attrs.sum
                });
            }
        });

        if (fieldsWithSum.length === 0) {
            return; // Không có trường nào cần tổng hợp
        }

        var $table = this.$('table');
        var $tbody = $table.find('tbody');

        // Tạo hàng tổng hợp
        var $summaryRow = $('<tr>').addClass('o_custom_summary_row');
        var self = this;

        // Thêm các ô vào hàng tổng hợp
        _.each(this.columns, function (column) {
            var $cell = $('<td>');
            var fieldWithSum = _.find(fieldsWithSum, function (field) {
                return field.fieldName === column.attrs.name;
            });

            if (fieldWithSum) {
                // Lấy giá trị tổng hợp từ model
                var sumValue = self._getSumValue(fieldWithSum.fieldName);
                var formattedValue = self._formatMonetary(sumValue, column);
                $cell.text(fieldWithSum.label + ': ' + (formattedValue || '0'));
                $cell.addClass('o_list_number');
            }

            $summaryRow.append($cell);
        });

        // Thêm vào đầu tbody
        $tbody.prepend($summaryRow);
    },

    /!**
     * Lấy giá trị tổng từ các bản ghi hiện có
     * @private
     * @param {String} fieldName - Tên trường cần tính tổng
     * @returns {Number} - Giá trị tổng
     *!/
    _getSumValue: function (fieldName) {
        var sum = 0;
        _.each(this.state.data, function (record) {
            // Bỏ qua các record là section
            if (!record.data.is_page) {
                var value = record.data[fieldName];
                if (!isNaN(parseFloat(value))) {
                    sum += parseFloat(value);
                }
            }
        });
        return sum;
    },

    /!**
     * Định dạng giá trị tiền tệ
     * @private
     * @param {Number} value - Giá trị cần định dạng
     * @param {Object} column - Thông tin cột
     * @returns {String} - Giá trị đã định dạng
     *!/
    _formatMonetary: function (value, column) {
        if (column.attrs.widget === "monetary" || column.attrs.widget === "float") {
            return this._getFormatter(column.attrs.widget)(value);
        }
        return value;
    },

    /!**
     * Lấy hàm định dạng phù hợp với widget
     * @private
     * @param {String} widget - Loại widget
     * @returns {Function} - Hàm định dạng
     *!/
    _getFormatter: function (widget) {
        var formatters = {
            monetary: core.format_value,
            float: core.format_value,
        };
        return formatters[widget] || function (val) { return val; };
    },

    // Handlers
    /!**
     * Overridden to allow different behaviours depending on
     * the row the user clicked on.
     * If the row is a section: edit inline
     * else use a normal modal
     * @private
     * @override
     * @param {*} ev
     *!/
    _onRowClicked: function (ev){
        // Kiểm tra xem hàng được nhấp có phải là hàng tổng hay không
        if ($(ev.currentTarget).hasClass('o_custom_summary_row')) {
            return; // Không làm gì nếu là hàng tổng
        }

        var parent = this.getParent();
        var recordId = $(ev.currentTarget).data('id');
        var is_section = this._checkIfRecordIsSection(recordId);
        if (is_section && parent.mode === "edit"){
            this.editable = "bottom";
        } else {
            this.editable = null;
        }
        this._super.apply(this, arguments);
    },
    /!**
     * Overridden to allow different behaviours depending on
     * the cell the user clicked on.
     * If the cell is part of a section: edit inline
     * else use a normal edit modal
     * @private
     * @override
     * @param {*} ev
     *!/
    _onCellClick: function (ev){
        // Kiểm tra xem ô được nhấp có thuộc hàng tổng hay không
        if ($(ev.currentTarget).closest('tr').hasClass('o_custom_summary_row')) {
            return; // Không làm gì nếu là hàng tổng
        }

        var parent = this.getParent();
        var recordId = $(ev.currentTarget.parentElement).data('id');
        var is_section = this._checkIfRecordIsSection(recordId);
        if (is_section && parent.mode === "edit"){
            this.editable = "bottom";
        } else {
            this.editable = null;
            this.unselectRow();
        }
        this._super.apply(this, arguments);
    },
    /!**
     * In this case, navigating in the list caused issues.
     * For example, editing a section then pressing enter would trigger
     * the inline edition of the next element in the list. Which is not desired
     * if the next element ends up being a question and not a section
     * @override
     * @param {*} ev
     *!/
    _onNavigationMove: function (ev){
        this.unselectRow();
    },
});

var SectionFieldOne2Many = FieldOne2Many.extend({
    init: function (parent, name, record, options){
        this._super.apply(this, arguments);
        this.sectionFieldName = "is_page";
        console.log("SectionFieldOne2Many: init");
        this.rendered = false;
    },
    /!**
     * Overridden to use our custom renderer
     * @private
     * @override
     *!/
    _getRenderer: function (){
        if (this.view.arch.tag === 'tree'){
            return SectionListRenderer;
        }
        return this._super.apply(this, arguments);
    },
    /!**
     * Overridden to allow different behaviours depending on
     * the object we want to add. Adding a section would be done inline
     * while adding a question would render a modal.
     * @private
     * @override
     * @param {*} ev
     *!/
    _onAddRecord: function (ev) {
        this.editable = null;
        if (!config.device.isMobile){
            var context_str = ev.data.context && ev.data.context[0];
            var context = new Context(context_str).eval();
            if (context['default_' + this.sectionFieldName]){
                this.editable = "bottom";
            }
        }
        this._super.apply(this, arguments);
    },
});

FieldRegistry.add('custom_list1', SectionFieldOne2Many);
});*/
odoo.define('izi_stock_report.list_custom', function (require) {
    "use strict";

    var Context = require('web.Context');
    var FieldOne2Many = require('web.relational_fields').FieldOne2Many;
    var FieldRegistry = require('web.field_registry');
    var ListRenderer = require('web.ListRenderer');
    var config = require('web.config');
    var core = require('web.core');

    var SectionListRenderer = ListRenderer.extend({
        init: function (parent, state, params) {
            this.sectionFieldName = "is_page";
            console.log("SectionListRenderer: init");
            this._super.apply(this, arguments);
        },
        _checkIfRecordIsSection: function (id) {
            var record = this._findRecordById(id);
            return record && record.data[this.sectionFieldName];
        },
        _findRecordById: function (id) {
            return _.find(this.state.data, function (record) {
                return record.id === id;
            });
        },
        /**
         * Adds specific classes to rows that are sections
         * to apply custom css on them
         * @private
         * @override
         * @param {*} record
         * @param {*} index
         */
        _renderRow: function (record, index) {
            var $row = this._super.apply(this, arguments);
            if (record.data[this.sectionFieldName]) {
                $row.addClass("o_is_section");
            }
            return $row;
        },
        /**
         * Adding this class after the view is rendered allows
         * us to limit the custom css scope to this particular case
         * and no other
         * @private
         * @override
         */
        _renderView: function () {
            var def = this._super.apply(this, arguments);
            var self = this;
            return def.then(function () {
                self.$('table.o_list_table').addClass('o_section_list_view');
                self._addSummaryRow();
            });
        },

        /**
         * Thêm hàng tổng hợp sau khi view được render
         * @private
         */
        _addSummaryRow: function () {
            // Lấy thông tin về các trường có thuộc tính sum từ arch
            var fieldsWithSum = [];
            _.each(this.arch.children, function (node) {
                if (node.tag === 'field' && node.attrs.sum) {
                    fieldsWithSum.push({
                        fieldName: node.attrs.name,
                        label: node.attrs.sum
                    });
                }
            });

            if (fieldsWithSum.length === 0) {
                return; // Không có trường nào cần tổng hợp
            }

            var $table = this.$('table');
            var $tbody = $table.find('tbody');

            // Tạo hàng tổng hợp
            var $summaryRow = $('<tr>').addClass('o_custom_summary_row');
            var self = this;

            // Thêm các ô vào hàng tổng hợp
            _.each(this.columns, function (column) {
                var $cell = $('<td>');
                var fieldWithSum = _.find(fieldsWithSum, function (field) {
                    return field.fieldName === column.attrs.name;
                });

                if (fieldWithSum) {
                    // Lấy giá trị tổng hợp từ model
                    var sumValue = self._getSumValue(fieldWithSum.fieldName);
                    var formattedValue = self._formatMonetary(sumValue, column);
                    $cell.text(fieldWithSum.label + ': ' + (formattedValue || '0'));
                    $cell.addClass('o_list_number');
                }

                $summaryRow.append($cell);
            });

            // Thêm vào đầu tbody
            $tbody.prepend($summaryRow);
        },

        /**
         * Lấy giá trị tổng từ các bản ghi hiện có
         * @private
         * @param {String} fieldName - Tên trường cần tính tổng
         * @returns {Number} - Giá trị tổng
         */
        _getSumValue: function (fieldName) {
            var sum = 0;
            _.each(this.state.data, function (record) {
                // Bỏ qua các record là section
                if (!record.data.is_page) {
                    var value = record.data[fieldName];
                    if (!isNaN(parseFloat(value))) {
                        sum += parseFloat(value);
                    }
                }
            });
            return sum;
        },

        /**
         * Định dạng giá trị tiền tệ
         * @private
         * @param {Number} value - Giá trị cần định dạng
         * @param {Object} column - Thông tin cột
         * @returns {String} - Giá trị đã định dạng
         */
        _formatMonetary: function (value, column) {
            if (column.attrs.widget === "monetary" || column.attrs.widget === "float") {
                return this._getFormatter(column.attrs.widget)(value);
            }
            // Áp dụng định dạng phân cách cho tất cả các giá trị số
            return this._formatNumberWithSeparator(value);
        },

        /**
         * Định dạng số với dấu phân cách hàng nghìn (13823400000 -> 13.823.400.000)
         * @private
         * @param {Number} value - Giá trị cần định dạng
         * @returns {String} - Giá trị đã định dạng với dấu phân cách
         */
        /**
         * Định dạng số với dấu phân cách hàng nghìn (13823400000 -> 13.823.400.000)
         * @private
         * @param {Number} value - Giá trị cần định dạng
         * @returns {String} - Giá trị đã định dạng với dấu phân cách
         */
        _formatNumberWithSeparator: function (value) {
            if (value === null || value === undefined || value === '') return '';

            // Chuyển đổi thành số
            var num = parseFloat(value);
            if (isNaN(num)) return value.toString();

            // Xử lý số âm
            var sign = num < 0 ? '-' : '';
            var absValue = Math.abs(num);

            // Xử lý phần nguyên và phần thập phân
            var parts = absValue.toString().split('.');
            var integerPart = parts[0];
            var decimalPart = parts.length > 1 ? ',' + parts[1] : '';

            // Thêm dấu phân cách hàng nghìn (chấm)
            var formattedInteger = '';
            for (var i = integerPart.length; i > 0; i -= 3) {
                var start = Math.max(0, i - 3);
                var chunk = integerPart.substring(start, i);
                formattedInteger = chunk + (formattedInteger ? '.' + formattedInteger : '');
            }

            return sign + formattedInteger + decimalPart;
        },

        /**
         * Lấy hàm định dạng phù hợp với widget
         * @private
         * @param {String} widget - Loại widget
         * @returns {Function} - Hàm định dạng
         */
        _getFormatter: function (widget) {
            var self = this;
            var formatters = {
                monetary: function (value) {
                    // Định dạng số trước khi áp dụng core.format_value
                    var formattedValue = self._formatNumberWithSeparator(value);
                    // Áp dụng thêm định dạng tiền tệ nếu cần
                    return formattedValue;
                },
                float: function (value) {
                    return self._formatNumberWithSeparator(value);
                }
            };
            return formatters[widget] || function (val) {
                return self._formatNumberWithSeparator(val);
            };
        },

        // Handlers
        /**
         * Overridden to allow different behaviours depending on
         * the row the user clicked on.
         * If the row is a section: edit inline
         * else use a normal modal
         * @private
         * @override
         * @param {*} ev
         */
        _onRowClicked: function (ev) {
            // Kiểm tra xem hàng được nhấp có phải là hàng tổng hay không
            if ($(ev.currentTarget).hasClass('o_custom_summary_row')) {
                return; // Không làm gì nếu là hàng tổng
            }

            var parent = this.getParent();
            var recordId = $(ev.currentTarget).data('id');
            var is_section = this._checkIfRecordIsSection(recordId);
            if (is_section && parent.mode === "edit") {
                this.editable = "bottom";
            } else {
                this.editable = null;
            }
            this._super.apply(this, arguments);
        },
        /**
         * Overridden to allow different behaviours depending on
         * the cell the user clicked on.
         * If the cell is part of a section: edit inline
         * else use a normal edit modal
         * @private
         * @override
         * @param {*} ev
         */
        _onCellClick: function (ev) {
            // Kiểm tra xem ô được nhấp có thuộc hàng tổng hay không
            if ($(ev.currentTarget).closest('tr').hasClass('o_custom_summary_row')) {
                return; // Không làm gì nếu là hàng tổng
            }

            var parent = this.getParent();
            var recordId = $(ev.currentTarget.parentElement).data('id');
            var is_section = this._checkIfRecordIsSection(recordId);
            if (is_section && parent.mode === "edit") {
                this.editable = "bottom";
            } else {
                this.editable = null;
                this.unselectRow();
            }
            this._super.apply(this, arguments);
        },
        /**
         * In this case, navigating in the list caused issues.
         * For example, editing a section then pressing enter would trigger
         * the inline edition of the next element in the list. Which is not desired
         * if the next element ends up being a question and not a section
         * @override
         * @param {*} ev
         */
        _onNavigationMove: function (ev) {
            this.unselectRow();
        },
    });

    var SectionFieldOne2Many = FieldOne2Many.extend({
        init: function (parent, name, record, options) {
            this._super.apply(this, arguments);
            this.sectionFieldName = "is_page";
            console.log("SectionFieldOne2Many: init");
            this.rendered = false;
        },
        /**
         * Overridden to use our custom renderer
         * @private
         * @override
         */
        _getRenderer: function () {
            if (this.view.arch.tag === 'tree') {
                return SectionListRenderer;
            }
            return this._super.apply(this, arguments);
        },
        /**
         * Overridden to allow different behaviours depending on
         * the object we want to add. Adding a section would be done inline
         * while adding a question would render a modal.
         * @private
         * @override
         * @param {*} ev
         */
        _onAddRecord: function (ev) {
            this.editable = null;
            if (!config.device.isMobile) {
                var context_str = ev.data.context && ev.data.context[0];
                var context = new Context(context_str).eval();
                if (context['default_' + this.sectionFieldName]) {
                    this.editable = "bottom";
                }
            }
            this._super.apply(this, arguments);
        },
    });

    FieldRegistry.add('sum_top_tree', SectionFieldOne2Many);
});