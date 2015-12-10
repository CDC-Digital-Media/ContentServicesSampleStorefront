"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'csRatings';

    var PARM_MEDIA_GUID = "id";
    
     //get the current location pathname...
     var page_name = location.pathname.substr(location.pathname.lastIndexOf("/")+1,location.pathname.length).toLowerCase();

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            className: 'cs-ratings',
            maxRating: 5,
            ratingCount: 0,
            averageRating: 0,
            selectedRating: 0,
            instruction: 'Select 1 to 5 stars to rate this product',
            appID: 'a527f0a4-8909-41c4-bed7-e50765520062',
            restfulServiceUrl: 'http://nchm-dvss1-tools.cdc.gov/RatingFeedbackService.svc/rest/',
            itemUrl: '',
            ratingMechanismId: 1
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function(options) {
    
        // generate or get user identifier.
        var UUID;
        var ratings;
        if ($.cookie('UUIDForCSRating') == null) {
            UUID = Math.uuid();
            ratings = [];
            var jsn = "{ 'uuid':'" + UUID + "', 'ratings':[] }";
            $.cookie('UUIDForCSRating', jsn, { expires: 15 });
        }
        else {
            var o = eval('(' + $.cookie('UUIDForCSRating') + ')');
            UUID = o.uuid;
            ratings = o.ratings;
        }
         
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        if($(this).attr("ItemUrl")) {options.itemUrl = $(this).attr("ItemUrl"); }

//        // get any existing data for URL
//        if(options.itemUrl){
//                $.getJSON(
//                    options.restfulServiceUrl + 'GetFeedbackSummarybyUrl?method=?',
//                    {
//                        url: options.itemUrl,
//                        feedbackmechanismid: 1,
//                        applicationid: options.appID
//                    })
//                .success(function (response) {
//                    debugger;
//                    $target.parent().find(".ratingBlock[ItemUrl='" + response.URL + "']").each(function () {

//                        var o = $(this);
//                        o.attr("RatingCount", response.FeedbackCount);
//                        if(response.FeedbackCount){options.ratingCount = response.FeedbackCount}

//                        o.attr("AverageRating", response.AverageValue);
//                        if(response.AverageValue){options.averageRating = eval(response.AverageValue).toFixed(2);}

//                        // apply any available cookie-stored rating data
//                        $.each(ratings, function () {
//                            if (this.url == response.URL) {
//                                o.attr("SelectedRating", this.rating);
//                                options.selectedRating =  this.rating;
//                            }
//                        });
//
//                        initialize();
//                    })
//                })
//                .error(function (xhr, ajaxOptions, thrownError) {
//                    alert(xhr.status);
//                    alert(thrownError);
//                });
//        }

        

        // setup scope variables based on attributes coming from the parent container
        if($(this).attr("RatingCount")){options.ratingCount = $(this).attr("RatingCount");}
        if($(this).attr("AverageRating")){options.averageRating = eval($(this).attr("AverageRating")).toFixed(2);}
        if($(this).attr("SelectedRating")){options.selectedRating = $(this).attr("SelectedRating");}
        

        var rootDiv = $("<div class='"+ options.className +"'>");
        $(this).append(rootDiv);
      
         
        var initialize = function(){
            if(!validateOptions()){return;}
            buildInlineRating();
        };

        // method to validate inputs
        var validateOptions = function(){
            if(!(
                (parseFloat(options.maxRating) == parseInt(options.maxRating))
                && !isNaN(options.maxRating)
                )){
                alert("maxRating value for the rating plugin must be an integer value.");
                return false;
            }
            if(!(
                (parseFloat(options.ratingMechanismId) == parseInt(options.ratingMechanismId))
                && !isNaN(options.ratingMechanismId)
                && options.ratingMechanismId !== 0
                )){
                alert("ratingMechanismId value for the rating plugin must be an integer value.");
                return false;
            }
            if(options.itemUrl === ''){
                alert("itemUrl must be passed in order to store the rating data.");
            }

            return true;
        };

        var buildInlineRating = function()
        {
             
            var ratingContainer = $("<span class='ratingContainer'/>");
            rootDiv.append(ratingContainer);

            rootDiv.append("<span class='rateCount'>(" + options.ratingCount + ")</span>");
            buildRatingView(ratingContainer);

        };

        var buildRatingView = function(containerReference){
            $(containerReference).empty();
            // if rating has been selected, build out rating view with selected value ////////////////////////////////////////////////
 
            var _roundedAverageRating = Math.round(options.averageRating)-1;
            var _roundedSelectedRating = Math.round(options.selectedRating)-1;

            
            if(options.selectedRating > 0){

                var ratingString = "<span class='selectedRatingSpan' title='"+ getOutcomeMsgTxt().replace(/&nbsp;/gi,'') +"'>";

                for (var i = 0; i < options.maxRating; i++){
                    ratingString += "<span class='ratingItem ";
                    ratingString += i <= _roundedAverageRating ? "defaultOn" : "defaultOff";
                    ratingString += "'/>";
                }
                ratingString += "</span>";

                containerReference.append(ratingString);

                setOutcomeMsg();

                return;
            }

            // else build out static/active versions of rating view //////////////////////////////////////////////////////////////////

            var staticRatingSpan = $("<span class='staticRatingSpan' />");
            var activeRatingSpan = $("<span class='activeRatingSpan' />");
            containerReference.append(staticRatingSpan);
            containerReference.append(activeRatingSpan);
            
            for (var i = 0; i < options.maxRating; i++){
                // static view anchors
                var itmString = "<a href='#' class='ratingItem ";
                itmString += i <= _roundedAverageRating ? 'defaultOn' : 'defaultOff';
                itmString += "'/>";

                staticRatingSpan.append($(itmString));
                
                // active view anchors
                var activeRatingItem = $("<a href='#' class='ratingItem activeOff' ratingValue='"+ (i+1) +"' title='Select rating "+ (i+1) +" out of "+ options.maxRating +"'/>");
                
                activeRatingItem.hover(function(over){SetSelected(this);});
                activeRatingItem.focus(function(){SetSelected(this);});
                activeRatingItem.click(function(){ratingValueSelected(this, containerReference); return false;});

                activeRatingSpan.append(activeRatingItem);
            }
            
            setOutcomeMsg();
            
            //show default view and add hover and tab behaviors
            //SwitchToDefaultView();

            staticRatingSpan.find("a").focus(function(){
                SwitchToActiveView();
                activeRatingSpan.find("a").first().focus();
            });

            // if blur event fires on rating anchor and a sibling does not have focus then reset
            activeRatingSpan.find("a").blur(function(){
                siblingHasFocus = false;
                activeRatingSpan.find("a").each(function(){
                    if(this == document.activeElement){siblingHasFocus = true; return false;}
                });
                if(!siblingHasFocus){SwitchToDefaultView();}
            });

            containerReference.hover(
                function() {SwitchToActiveView();},
                function() {SwitchToDefaultView();}
            );

            function SwitchToDefaultView(){staticRatingSpan.show(); activeRatingSpan.hide();}
            function SwitchToActiveView(){staticRatingSpan.hide(); activeRatingSpan.show();}

            function setOutcomeMsg(){
                if(rootDiv.find('.outcomeMsg').length === 0){rootDiv.append("<div class='outcomeMsg' />");}
                rootDiv.find('.outcomeMsg').html(getOutcomeMsgTxt());
            }

            function getOutcomeMsgTxt() {
                if(options.averageRating === 0) {return ""; }
                var strMsg = "Average: " + eval(options.averageRating).toFixed(1) + "";
                strMsg += options.selectedRating > 0 ? " &nbsp;&nbsp;&nbsp;&nbsp; Your Rating: " + eval(options.selectedRating).toFixed(1) : "";
                return strMsg;
            }

            function SetSelected(obj){
                var o = $(obj);
                o.prevAll().removeClass().addClass('ratingItem activeOn');
                o.nextAll().removeClass().addClass('ratingItem activeOff');
                o.removeClass().addClass('ratingItem activeOn');
            }

            SwitchToDefaultView();

        };
    
        var ratingValueSelected = function(selectedObj, containerReference)
        {
            options.selectedRating =  $(selectedObj).attr('ratingValue');
            submitRating();
        };

        var submitRating = function(){
            //RecordFeedbackforUrl?url={url}&feedbackvalue={feedbackvalue}&comment={comment}&feedbackmechanismid={feedbackmechanismid}&feedbackvalueid={feedbackvalueid}&applicationid={applicationid}&userid={userid}
            $.getJSON(
                    options.restfulServiceUrl + 'RecordFeedbackforUrl?method=?',
                    {
                        url: options.itemUrl,
                        feedbackvalue: options.selectedRating,
                        comment: '',
                        feedbackmechanismid: options.ratingMechanismId.toString(),
                        feedbackvalueid: '',
                        applicationid: options.appID,
                        userid: UUID
                    }
                )
            .success(function (response)
                    {
                        if (response.AverageValue !== null)
                        {
                            options.averageRating = eval(response.AverageValue).toFixed(1);
                        }
                        options.ratingCount = response.FeedbackCount;
                        buildRatingView(rootDiv.find('.ratingContainer'));
                        rootDiv.find(".rateCount").replaceWith("<span class='rateCount'>("+ options.ratingCount +")</span>");
                    }
                )
            .error(function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            });

            if ($.cookie('UUIDForCSRating') !== null) {

                var o = eval('(' + $.cookie('UUIDForCSRating') + ')');
                var ratings = o.ratings;
                var jsn = "{ 'uuid':'" + UUID + "', 'ratings':[";

                for (var i = 0; i < ratings.length; i++){
                    jsn += "{'url':'"+ ratings[i].url +"', 'rating':'"+ ratings[i].rating +"'},";
                }

                jsn += "{'url':'"+ options.itemUrl +"', 'rating':'"+ options.selectedRating +"'}";

                jsn += "] }";

                $.cookie('UUIDForCSRating', jsn, { expires: 30 });
            }

        };

        initialize();

    };

})(jQuery);





