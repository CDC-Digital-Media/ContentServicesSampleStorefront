"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'mediaPulldown';

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

            $.ajax({
                url: APIRoot + '/api/v1/resources/mediatypes.json?ttl=900&callback=?',
                dataType: 'jsonp'
            })
            .done(function (response) {

                var items = response.results.sort(function(a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });

                $(items).each(function () {

                    if(options.selectedValue === this.name){
                        $(options.target).parents(".btn-group").find(".btn").html(this.name + " <span class='caret'></span>");
                    }

                    var $li = $("<li>");
                    var $a  = $("<a mediaType='" + this.name + "' href='#'>"+ this.description +"</a>");
                    $li.append($a);
                    options.target.append($li);
                });

                $(options.target).find("a").click(function (e) {
                    $(e.target).parents(".btn-group").find(".btn").html($(e.target).text() + " <span class='caret'></span>");

                    var func = options.selectHandler;
                    if (typeof func === 'function') {
                        func($(e.target).attr("mediaType"), $(e.target).text());
                    }

                });
            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
        }

    };

})(jQuery);
