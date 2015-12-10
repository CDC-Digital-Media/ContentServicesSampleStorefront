"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'topicNav';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            navDataUrl: '',
            navigationHandler: '',
            selectedValue: '',
            insertAfter: -1
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        if (options.navigateUrl === '')
            options.navigateUrl = window.location.pathname;

        // build stuff here
        $.getJSON(options.navDataUrl)
                .success(function (response) {
                    if(response.results){
                        main(response.results);
                    }
                })
                .error(function (xhr, ajaxOptions, thrownError) { alert(xhr.status); alert(thrownError); });

        function handleNavigationClick(event, catId, navPosition, title) {
            var func = options.navigationHandler;
            if (typeof func === 'function') {
                    func(catId, title, navPosition);
            }
        }

        function buildSubItemList(parent, $liParent) {
            var $ul = $("<ul>");
            $ul.addClass("nav collapse");
            $ul.addClass($ul.uid());

            $(parent.items).each(function () {


                        var $itm = $(this)[0];
                        var $li = $("<li class='navLI"+ parent.id + "_" + $itm.id + "'>");
                        var $a = $("<a href='#'>" + $itm.name + "</a>");

                        $a.click(function(e){
                            handleNavigationClick(e, $itm.id, parent.id + "_" + $itm.id, $itm.name);
                        });
                        $li.append($a);

                        if(this.items.length>0){
                            buildSubItemList($itm, $li);
                        }
                        $ul.append($li);

                });
            $liParent.append($ul);
            $liParent.find('.nav-expand, .nav-collapse').click(function(){toggle($(this), $ul);});

            $liParent.attr('data-target', '.'+ $ul.uid());

        }


        var toggle = function($o, $ul){
            if($o.hasClass('nav-expand')){
                $o.removeClass("nav-expand").addClass("nav-collapse");
                $ul.collapse('show');
            }
            else if($o.hasClass('nav-collapse')){
                $o.removeClass("nav-collapse").addClass("nav-expand");
                $ul.collapse('hide');
            }
        };

        function setSelected(navPosition){
            
            $(options.target).find('li').removeClass('active');

            var $root;

            if ($(".navLI"+navPosition).parents("[class*='navLI']").length>0) {
                $root = $(".navLI"+navPosition).parents("[class*='navLI']").first();
                $root.find("ul")
                     .removeClass("in collapse")
                     .collapse('show');
            }
                                        
            $(".navLI"+navPosition).addClass('active');
        }

        function main(items){

            $(options.target).find("[class*='navLI']").remove();

            var buffer = [];
            $(items).each(function () {
            
                    var $itm = $(this)[0];
                    var $li = $("<li class='navLI" + $itm.id + "'>");
                    var $a = $("<a href='#'>" + $itm.name + "</a>");

                    if(this.items.length>0){
                        var $toggle = $("<div class='pull-right nav-expand'></div>");
                        $li.append($toggle);
                    }

                    $a.click(function(e){handleNavigationClick(e, $itm.id, $itm.id, $itm.name); });
                    $li.append($a);

                    if(this.items.length>0) {
                        buildSubItemList($itm, $li);
                    }
                    buffer.push($li);
                //}
            });

            if(options.insertAfter === -1) {
                $(options.target).prepend(buffer);
            }
            else{
                $($(options.target).find("li")[options.insertAfter]).after(buffer);
            }
            
            setSelected(options.selectedValue);
        }

    };

})(jQuery);