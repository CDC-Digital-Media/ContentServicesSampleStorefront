"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'mediaListItem';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            mediaItem: '',
            deleteHandler: '',
            previewHandler: '',
            embedHandler: '',
            context: {},
            dateFormatter: function() {},
            htmlDecoder: function() {},
            removeFromList: function() {},
            apiRoot: ''
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        function handlePreview(mediaId) {
            var func = options.previewHandler;
            if (typeof func === 'function') {
                func(mediaId, false);
                return false;
            }
        }

        function handleEmbed(mediaId) {
            var func = options.embedHandler;
            if (typeof func === 'function') {
                func(mediaId, true);
                return false;
            }
        }

        function main() {
            var $item = $("<div>");
            var obj = options.mediaItem;
            if (obj.id === undefined) { obj.id = obj.mediaId; }

            $item.load("templates/MediaListItem.htm", function () {

                // apply content to the template
                $item.find(".mediaListItem .title").html(options.htmlDecoder(obj.title));
                $item.find(".mediaListItem .mediaListThumb")
                    .html('<img src="' + options.apiRoot + '/api/v1/resources/media/' + obj.id + '/thumbnail" alt="' + obj.title + '" />')
                    .click(function() {
                        handlePreview(obj.id);
                    });

                $item.find(".mediaListItem .description").html(options.htmlDecoder(obj.description));
                $item.find(".mediaListItem .lastupdated").append(options.dateFormatter(obj.dateModified));


                $item.find(".mediaList-getcode a").click(function() {
                    handleEmbed(obj.id);
                });

                $item.find(".btn-delete").parents(".mediaList-action").click(function() {
                        
                    $(this).parents('.mediaListItem').slideUp(400, function () {
                        //options.removeFromList(options.context.SelectedList.id, obj.id, options.deleteHandler);
                        //options.removeFromList(obj.id);
                        $(this).removeFromSyndicationList({apiRoot: options.apiRoot, mediaId: obj.id, listGuid: options.context.SelectedList.id, context: options.context});
                    });
                });

            });
            $(options.target).append($item);

        }

        main();

    };

})(jQuery);