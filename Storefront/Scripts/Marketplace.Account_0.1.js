"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'account';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            showNewMsg: false,
            context: '',
            postProcess: '',
            mediaHandler: ''
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        var valueSetData, typeAheadArray = [], mapped = {};
        var $regForm;
        var userInfo;

        function handlePostProcess(){
            var func = options.postProcess;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function main() {
            userInfo = options.context.UserInfo;

            $(options.target).empty();
            var $account = $("<div>");
            $account.load("templates/Account.htm", function(){
               setupTabs();
               showMyContent();

                if(!options.showNewMsg){
                    $('.alert-success').hide();
                }

               handlePostProcess();
            });



            $(options.target).append($account);
        }

        function setupTabs() {
            var $ul  = $(options.target).find("ul.nav-tabs");
                       
            $ul.find(".myContent").click(function () {
                $ul.find("li").removeClass("active");
                $(this).parent().addClass("active");
                showMyContent();
            });

            $ul.find(".myOrganizations").click(function () {
                $ul.find("li").removeClass("active");
                $(this).parent().addClass("active");
                showMyOrganizations();
            });

            $ul.find(".myAccount").click(function () {
                $ul.find("li").removeClass("active");
                $(this).parent().addClass("active");
                showMyAccount();
            });
        }

        function showMyContent(){

            $(options.target).find(".userName").text(userInfo.User.firstName + " " + userInfo.User.middleName + " " + userInfo.User.lastName);

            $(options.target).find(".contentDetail, .orgDetail, .contactDetail").hide();
            $(options.target).find(".contentDetail").show();

            if (options.context.SelectedList === undefined) { return; }
            $(options.target).find(".selectedMedia").showSpinner().retrieveSyndicationList({ context: options.context, apiRoot: APIRoot, embedHandler: options.mediaHandler});
            $(options.target).find(".currentSyndList").text(options.context.SelectedList.name);
        
        }
        var showMyOrganizations = function() {
            $(options.target).find(".contentDetail, .orgDetail, .contactDetail").hide();
            $(options.target).find(".orgDetail").show();

            $(".orgTable").show();
            $(".orgName").text(options.context.UserInfo.User.organizations[0].name);
            $(".orgDomains").html($.map(options.context.UserInfo.User.organizations[0].website, function (website) { return website.url; }).join("<br/>"));
            $(".orgNew").hide();

            setupOrgGrid();

            $(".btnAddOrg").click(function(){
                $(".orgTable").hide();
                $(".orgNew").show().organization({ cancelHandler : showMyOrganizations });
            });
               
        
        };

        function showMyAccount(){
            $(options.target).find(".contentDetail, .orgDetail, .contactDetail").hide();

            var $contactDetail = $(options.target).find(".contactDetail");
            $contactDetail.show();
            $contactDetail.find(".firstName").text(userInfo.User.firstName);
            $contactDetail.find(".middleInit").text(userInfo.User.middleName);
            $contactDetail.find(".lastName").text(userInfo.User.lastName);
            $contactDetail.find(".emailAddress").text(userInfo.User.email);
        }


        function setupOrgGrid(){
            $(options.target).find(".icon-user").unbind("click");
            $(options.target).find(".icon-user").click(function(){
                
                $(options.target).find('.orgTable').hide();
                $(options.target).find('.orgUsers').orgUsers({
                    returnHandler: function(){
                        $(options.target).find('.orgTable').show();
                        $(options.target).find('.orgUsers').hide();
                    }
                });
            });

            $(options.target).find(".icon-pencil").unbind("click");
            $(options.target).find(".icon-pencil").click(function(){

            });

            $(options.target).find(".icon-trash").unbind("click");
            $(options.target).find(".icon-trash").click(function(){
                return confirm('Are you sure you want to delete this Organization?');
            });
        }


        main();

    };

})(jQuery);