"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'languagePulldown';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            selectedValue: '',
            selectHandler: ''
        }
    };

    // funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        main();

        function main() {
            
            $(options.target).empty();

            $.ajax({
                url: APIRoot + '/api/v1/resources/languages.json?ttl=900&callback=?',
                dataType: 'jsonp'
            })
            .done(function (response) {

                $(response.results).each(function () {

                    if(options.selectedValue == this.name) {
                        $(options.target).parents(".btn-group").find(".btn").html(this.name + " <span class='caret'></span>");
                    }

                    var $li = $("<li>");
                    var $a = $("<a href='#'>" + this.name + "</a>");
                    $li.append($a);
                    options.target.append($li);
                });

                $(options.target).find("a").click(function (e) {
                    $(e.target).parents(".btn-group").find(".btn").html($(e.target).text() + " <span class='caret'></span>");

                    var func = options.selectHandler;
                    if (typeof func === 'function') {
                        func($(e.target).text());
                    }

                });
            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
        }

    };

})(jQuery);
