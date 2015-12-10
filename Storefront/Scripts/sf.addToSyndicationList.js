"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = "addToSyndicationList";

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            apiRoot: '',
            mediaId: '',
            listGuid: '',
            context: {}
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        return main();

        function main() {

            var data = {
                media: [{ mediaId: options.mediaId}],
                lastUpdatedUserEmailAddress: options.context.UserInfo.User.email
            };

            $.ajax({
                type: "POST",
                url: "Secure.aspx/AddMediaToSyndicationList",
                data: "{data: '" + JSON.stringify(data) + "', apiUrl: '" + options.apiRoot + "/api/v1/resources/syndicationlists/" + options.listGuid + "/media'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    var obj = (typeof response.d) == 'string' ? eval('(' + response.d + ')') : response.d;

                    if (obj.meta.status === 200) {
                        options.context.SelectedList.selectedMediaIds.push(options.mediaId);

                        // remove spinner
                        // options.target.removeAttr('class').addClass('icn-checkbox');

                        //handleComplete();
                    }

                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.debug(xhr.status);
                    console.debug(thrownError);
                    console.debug(xhr.responseText);
                    alert(xhr.status);
                    alert(thrownError);
                }
            });


            return options.target;
        }
    };

})(jQuery);