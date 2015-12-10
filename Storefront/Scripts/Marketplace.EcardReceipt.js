"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = "receiveEcard";

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: { receiptId: '',
            apiRoot: '' }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        main();

        function main() {

            //show spinner.  somewhere.

            $.ajax({
                url: options.apiRoot + '/api/v1/resources/ecards/' + options.receiptId + '/view?callback=?',
                dataType: 'jsonp'
            })
            .done(function (response) {
                if (response.results) {

                    //options.target.append("<div>You got ecard " + ecard.title + "</div");
                    buildOutCardDisplay(response.results.mediaItem, response.results.personalMessage);
                }
                else {
                    return;
                }
            })
            .fail(function (xhr, ajaxOptions, thrownError) {
                /*alert(xhr.status); alert(thrownError);*/
            });

        }

        function buildOutCardDisplay(ecard, msg) {

            var doFlash = false;
            var html = "";


            if (!!document.createElement('canvas').getContext && ecard.extension.html5Source !== null) {

                html += "<iframe class='html5Frame' width='580px' height='400px' scrolling='no' src='" + ecard.extension.html5Source + "'>";
                html += "</iframe>";

            }

            else if (ecard.sourceUrl !== null) {
                doFlash = true;

                html += "<div id='flashContentALT'>";
                html += "<a title='" + ecard.title + "' href='" + ecard.targetUrl + "'>";
                // need resource for alternate image rather than relying on the source imgage used for moble.
                html += "<img title='" + ecard.title + "' src='" + ecard.extension.imageSourceOutsideLarge + "' alt='" + ecard.title + "' class='cardImg'/>";
                html += "</a>";
                html += "</div>";
            }

            options.target.hideSpinner();
            options.target.append(html);

            if (doFlash) {// have to apply after HTML has been added to DOM
                var Myflash = new CDC.Video("", "flashContentALT", "MyEcardsButton", true,
                                    580, 400, filePath + ecard.sourceUrl,
                                    580, 400, filePath + ecard.sourceUrl,
                                    false);
                Myflash.render();
            }

            var $msgHeader = $("<div class='msgHeader'>Your friend included a personal message to you:</div>");
            var $msgBody = $("<div  class='msgBody'>" + msg + "</div>");

            var disclaimer = "<b>DISCLAIMER:</b><p>Comments and views expressed in the personal message feature are those of the individual sending the personal message and do not necessarily reflect those of the Centers for Disease Control and Prevention (CDC), the Department of Health and Human Services (DHHS) or the Federal government. CDC/DHHS does not control or guarantee the accuracy or relevance of the information sent in a personal message, nor does CDC/DHHS endorse any content or links provided therein. </p><p>To report abuse please send an email to <a href='mailto:cdcinfo@cdc.gov'>cdcinfo@cdc.gov</a>.</p>";

            var $msgDisclaimer = $("<div  class='msgDisclaimer'>" + disclaimer + "</div>");

            options.target.append($msgHeader);
            options.target.append($msgBody);
            options.target.append($msgDisclaimer);

        }

    };

})(jQuery);