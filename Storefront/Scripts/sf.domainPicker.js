"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'domainPicker';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            selectHandler: '',
            postProcess: '',
            context: {}
        }
    };

    // function ////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        var handleSelect = function() {
            var func = options.selectHandler;
            if (typeof func === 'function') {
                func();
                return false;
            }
        };


        function main() {

            function populateSyndicationListDropdown() {
                $(options.target).find('ul.syndicationlist').empty();
                $(options.context.UserInfo.syndicationLists).each(function (index, list){
                    var $link = $('<a href="#"><span class="domainName">' + list.listName + '</span></a>');
                    var $li = $('<li></li>');
                    $li.append($link);

                    $(options.target).find('ul').append($li);
                    
                   $link.click(function(){
                        $(options.target).find('span.userDomain').text(list.listName);
                        $(this).closest('li').hide();
                        $(options.target).find('span.domainName').not(this).closest("li").show();

                        options.context.setSelectedList(list.listName, list.syndicationListId);
                    });

                });
            }

            if (options.context.SelectedList === undefined) {
                return options.target;
            }

            if(options.context.SelectedList.name === '' && options.context.UserInfo.syndicationLists.length>0){// set default to first list item
                var list = options.context.UserInfo.syndicationLists[0];
                options.context.setSelectedList(list.listName, list.syndicationListId, "");
                $(options.target).find('span.userDomain').text(options.context.SelectedList.name);
            }

            $(options.target).empty();

            switch (true) {
                case (options.context.UserInfo.syndicationLists.length === 0):
                    
                    break;

                case (options.context.UserInfo.syndicationLists.length === 1):
                    var $lbl = $('<a class="btn btn-link nolink btnDomainpicker" href="#"></a>');
                    $lbl.text(options.context.SelectedList.name);
                    $(options.target).append($lbl);

                    break;
                case (options.context.UserInfo.syndicationLists.length > 1):
                    var $button = $('<button type="button" class="domainpicker btn btn-link btn-small btnUserDomain dropdown-toggle" data-toggle="dropdown">');
                    var $globe = $('<i class="icon-globe"></i>');
                    var $span = $('<span class="userDomain">'+ options.context.SelectedList.name +'</span>');
                    var $down = $('<i class="icon-angle-down"></i>');
                                     
                    $button.append($globe);
                    $button.append($span);
                    $button.append($down);
                    
                    var $ul = $('<ul class="dropdown-menu syndicationlist">');
                    $(options.target).append($button);
                    $(options.target).append($ul);
                    $(options.target).parents(".btn-group").find(".btnUserDomain").append("<span class='caret'></span>");

                    populateSyndicationListDropdown();
                    break;
            }

            return options.target;
            
        }

        return main();

    };

})(jQuery);
