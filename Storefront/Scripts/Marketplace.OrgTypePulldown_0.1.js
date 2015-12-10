"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'orgTypePulldown';

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
                url: APIRoot + '/api/v1/resources/organizationtypes.json?ttl=900&callback=?',
                dataType: 'jsonp'
            })
            .done(function (response) {

                $(options.target).children().remove();
                $(options.target).append($("<option value='' >Choose an Organization Type</option>"));

                $(response.results).each(function () {

                    if(options.selectedValue == $(this)[0].type) {
                        $(options.target).append($("<option value='" + $(this)[0].type + "' selected='true'>" + $(this)[0].description + "</option>"));
                    }
                    else{
                        $(options.target).append($("<option value='" + $(this)[0].type + "'>" + $(this)[0].description + "</option>"));
                    }
                });

            })
            .fail(function (xhr, ajaxOptions, thrownError) { /*alert(xhr.status); alert(thrownError);*/ });
        }

    };

})(jQuery);
