"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'orgUsers';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            returnHandler : ''
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        function handleReturn() {
            var func = options.returnHandler;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function main() {
            $(options.target).empty();

            $(options.target).load("templates/OrgUsers.htm", function () {
                $(options.target).find('.btnReturn').click(function( ){
                    handleReturn();
                });

                $(options.target).show();
            });

        }
       
        main();

    };

})(jQuery);