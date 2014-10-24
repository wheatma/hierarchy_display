/*
Author: wheatma

Version: 1.0
 */
;
(function($) {
    (function(pluginName) {
        var settings = defaults = {
            width: 1000,
            height: 1000,
            default_value: '',
            data_info_format: null,
            max_leaf_length: 10,
            column_width: null,
            leaf_click_callback: null,
            node_click_callback: null,
            async: false,
            url: '',
            value: [],
            ext: null,
            list_html: null
        };

        var encodeContainer = document.createElement('span');
        var htmlEncode = function(str) {
            encodeContainer.innerHTML = '';
            encodeContainer.appendChild(document.createTextNode(str));
            return encodeContainer.innerHTML;
        };

        var get_li_html = function(value, options) {
            if (options.list_html && typeof options.list_html == 'function') {
                return options.list_html(value);
            }
            var li_text = value.text;
            var right_html = '<i class="icon-chevron-right"></i>';
            var is_leaf = (value.is_leaf && value.is_leaf == true) ? 1 : 0;
            if (is_leaf) {
                var data_info = (options.data_info_format && typeof options.data_info_format == 'function') ? options.data_info_format(value) : value.data_info;
                right_html = '<span class="pull-right">' + data_info + '</span>';
                var show_text = format_text_length(value.text, options.max_leaf_length, '...');
                li_text = '<span class="leaf-text" title="' + value.text + '">' + show_text + '</span>';
            }
            var li_html = '<li><a href="javascript:;" _id="' + value.id + '" _is_leaf="' + is_leaf + '"> ' + right_html + li_text + '</a></li>';
            return li_html;
        };

        var get_display_div = function() {
            return '<div class="hierarchy-display"></div>';
        };

        var get_ul_html = function(options) {
            var style = options.column_width ? 'style="width:' + options.column_width + 'px;"' : '';
            return '<ul class="nav nav-list hierarchy-display-nav" ' + style + '></ul>';
        };

        var get_sub_value = function(id, value) {
            return value[id]['sub_value'] || [];
        };

        var get_li_value = function(id, value) {
            var ids = id.split(',');
            ids.pop();
            var parent_id = ids.join(',');
            var is_leaf = value[parent_id] ? value[parent_id]['sub_value'][id]['is_leaf'] : false;
            if (is_leaf) {
                return value[parent_id]['sub_value'][id];
            }
            return value[id] || [];
        };

        var set_sub_value = function(id, value) {
            options.value[id] = value;
        };

        var ajax_request = function(url, callback, method, data, params, error) {

        };

        var get_inner_width = function($o) {
            var inner_widht = 0;
            $o.find('.hierarchy-display').each(function() {
                inner_widht += get_real_width($(this));
            });
            return inner_widht;
        };

        var get_real_width = function($o) {
            return $o.width() + parseInt($o.css('margin-right'), 10) + parseInt($o.css('margin-left'), 10) + 2;
        };

        var format_text_length = function(text, max_length, ext) {
            var show_text = '';
            var max_length = max_length || 25;
            if (text.length > max_length) {
                show_text = text.substring(0, max_length);
                if (ext) {
                    show_text = show_text + ext;
                }
            } else {
                show_text = text;
            }
            return htmlEncode(show_text);
        };

        $.fn[pluginName] = function(options) {
            options = $.extend(true, defaults, options);

            return this.each(function() {

                var elem = this,
                    $elem = $(this);

                elem.func = {
                    //初始化入口
                    init: function(options) {
                        var _self = this;
                        if (options.value.length == 0) {
                            return false;
                        }

                        $elem.css({
                            width: options.width + 'px',
                            height: options.height + 'px',
                            'overflow-x': 'auto'
                        });

                        $elem_container = $('<div class="hierarchy-display-container"/>').width(options.width);

                        $elem.append($elem_container);

                        //生成第一级
                        _self.add(options.value["0"]['sub_value'], options);

                        $elem.delegate('li', 'click', function() {
                            var $li = $(this);
                            var $a = $li.find('a');
                            var $container = $li.parent().parent();
                            var is_leaf = parseInt($a.attr('_is_leaf'), 10);
                            var id = $a.attr('_id');
                            var li_value = get_li_value(id, options.value);
                            //叶子节点点击事件
                            if (is_leaf) {
                                if (options.leaf_click_callback && typeof options.leaf_click_callback == 'function') {
                                    options.leaf_click_callback(li_value);
                                }
                                return;
                            }
                            $container.find('li.active').removeClass('active').end().nextAll('div').remove();
                            //非叶子节点点击事件
                            //$container.addClass('hierarchy-display-affix');
                            if (li_value.length == 0) {
                                if (options.async == true && options.url != '') {
                                    $.ajax({
                                        url: options.url,
                                        type: 'get',
                                        dataType: 'json',
                                        data: {
                                            id: id
                                        },
                                        success: function(data, status) {
                                            li_value = data.ret_msg || [];
                                            if (li_value) {
                                                set_sub_value(id, li_value);
                                                if (!li_value.is_leaf || li_value.is_leaf != true) {
                                                    $li.addClass('active');
                                                }
                                                _self.add(li_value['sub_value'], options);
                                            }
                                        },
                                        error: function(data, status) {

                                        }
                                    });
                                }
                            } else {
                                if (!li_value.is_leaf || li_value.is_leaf != true) {
                                    $li.addClass('active');
                                }

                                if (li_value['sub_value'] && li_value['sub_value'] != []) {
                                    _self.add(li_value['sub_value'], options);
                                }
                            }
                            //$elem.scrollLeft($elem_container.width()).scrollTop(0);
                            if (options.node_click_callback && typeof options.node_click_callback == 'function') {
                                options.node_click_callback(li_value);
                            }
                            return;
                        });

                        $elem.scroll(function() {
                            var top = $elem.scrollTop();
                            $elem.find('.hierarchy-display-affix').each(function() {
                                var _self = $(this);
                                _self.css('top', top);
                            });
                        });

                        if (options.ext && typeof options.ext == 'function') {
                            options.ext.call(elem);
                        }

                        setTimeout(function() {
                            if (options.default_value && options.default_value != '') {
                                elem.func.set_default(options.default_value, options);
                            }
                        }, 10);
                    },

                    //生成下一级别
                    add: function(value, options, container) {
                        var div_html = get_display_div();
                        var ul_html = get_ul_html(options);
                        var $ul = $(ul_html);
                        var $div = $(div_html);
                        $div.css('height', options.height - 5).append($ul);
                        var li_html = '';
                        $.each(value, function(i, o) {
                            li_html += get_li_html(o, options);
                        });
                        $ul.append(li_html);
                        var $elem_container = $elem.find('.hierarchy-display-container');
                        $elem_container.append($div);
                        //20是滚动条的宽度和高度
                        if ($ul.height() + 20 > options.height) {
                            $div.width($div.width() + 20);
                        }
                        var inner_width = get_inner_width($elem_container);
                        if (inner_width < $elem.width()) {
                            inner_width = $elem.width();
                        }
                        $elem_container.width(inner_width);
                    },

                    //设置默认
                    set_default: function(id, options) {
                        var levels = id.split(',');
                        var tmp_level = '';
                        $.each(levels, function(i, o) {
                            if (tmp_level == '') {
                                tmp_level = o;
                            } else {
                                tmp_level += ',' + o;
                            }
                            $elem.find('a[_id="' + tmp_level + '"]').trigger('click');
                        });
                    },
                    //重置
                    reset: function() {
                        $elem.html('');
                        return this;
                    }
                };

                elem.func.init(options);

                return elem.func;
            });
        };

        $.fn[pluginName].defaults = defaults;
    })('hierarchy_display');
})(jQuery);