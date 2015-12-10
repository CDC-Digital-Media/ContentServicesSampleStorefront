"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = "retrieveSyndicationList";

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: { context: '', apiRoot: '', embedHandler: '' }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        return main();

        function main() {

            //TODO:  Handle if options.context.SelectedList is already populated

            $.ajax({
                url: options.apiRoot + '/api/v1/resources/media/?pagenum=1&max=0&syndicationlistid=' + options.context.SelectedList.id,
                dataType: 'json'
            })
            .done(function (response) {
                var obj = (typeof response.d) == 'string' ? eval('(' + response.d + ')') : response.d;
//                var ids = [];
//                $(response.results.media).each(function () {
//                    ids.push(this.mediaId);
//                });

//                //handleComplete(ids);
//                console.log(ids);

                $(options.target).empty();

                if (response.results.length === 0) {
                    $('.account .noContent').show();
                }
                else
                {
                    $('.account .noContent').hide();

                    //var pagingData = response.meta.pagination;

                    var $pagination = $("<div class='pagination pull-right'></div>");
                    $(options.target).append($pagination);

                    var $resultsDiv =  $("<div style='clear:both;'></div>");
                    $(options.target).append($resultsDiv);

                    $(response.results).each(function() {
                        $resultsDiv.mediaListItem({
                            mediaItem: this,
                            //deleteHandler: function() {getSelectedMedia(dataUrl); },
                            previewHandler: options.previewHandler,
                            embedHandler: options.embedHandler,
                            apiRoot: options.apiRoot,
                            context: options.context
                        });
                        options.context.SelectedList.selectedMediaIds.push(this.mediaId);
                    });
                  
                    //TODO:  Paging
                    //setupPaging(pagingData);
                    $(options.target).hideSpinner();
                }

            })
            .fail(function (xhr, ajaxOptions, thrownError) {
                console.debug(xhr.status);
                console.debug(thrownError);
                console.debug(xhr.responseText);
                alert(xhr.status);
                alert(thrownError);
            });

            return options.target;
        }
    };

})(jQuery);