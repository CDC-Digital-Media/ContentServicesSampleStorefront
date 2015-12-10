"use strict"; //ignore jslint

(function ($) {
    var PLUGIN_NAME = 'organization';

    // plugin signature ///////////////////////
    $[PLUGIN_NAME] = {
        defaults: {
            organizationId: '',
            cancelHandler: '',
            completeHandler: '',
            showRequired: true
        }
    };

    // main funtion //////////////////////////
    $.fn[PLUGIN_NAME] = function (options) {

        $[PLUGIN_NAME].defaults.target = this;
        options = $.extend({}, $[PLUGIN_NAME].defaults, options);

        var valueSetData, typeAheadArray = [], mapped = {};
        var $org;
        var padChar = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";


        function handleCancel() {
            var func = options.cancelHandler;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function handleComplete() {
            var func = options.completeHandler;
            if (typeof func === 'function') {
                func();
                return false;
            }
        }

        function main() {
            $(options.target).empty();
            $org = $("<div>");
            $org.load("templates/Organization.htm", function () {
                setupOrganization();
                if(!options.showRequired){
                    $(options.target).find(".requiredNote").hide();
                }
                $org.show();
            });
            $(options.target).append($org);
            $org.hide();
        }

        function setupOrganization() {

            //setup typeahead and a-z list.
            getOrganizations();

            //setup location fields
            $(options.target).find('.location').attr('disabled','disabled');
            var locs = $(options.target).find('.location');
                                    
            // set defaults -
            getPlaces('', $(locs[0]), 6255149); //6295630 - root
            getPlaces(6255149, $(locs[1]), 6252001); //6255149 - North America
            getPlaces(6252001, $(locs[2])); //6252001 - USA

            $('.location').change(function(){
                var placeID = $(this).find(':selected')[0].value;
                var $locFields = $('.location');
                var idx = $locFields.index($(this));

                if(placeID !== ''){
                    idx += 1;
                    if(idx < $locFields.length){
                        getPlaces($(this).find(':selected')[0].value, $($('.location')[idx]));
                    }
                }

                $('.location:gt('+ (idx) +')').each(function(){
                    $(this).attr('disabled','disabled').children('option:not(:first)').remove();
                });
            });
            

            $('#orgType').orgTypePulldown({});
            $('#orgType').change(function() {
                 var type = $(this).find(':selected')[0].value;
                 if(type === 'Other') {
                    $('#txtTypeOther').parents('.control-group').show();
                 }
                 else {
                    $('#txtTypeOther').parents('.control-group').hide();
                 }
            });

            if(options.organizationId !== '') {showEdit();}

            $('.chooseOrg .btnCancel').click(function() {
                $("#txtOrg").val('').focus();
                handleCancel();
            });

            $('.btnAddNewOrg').click(function () {
                $("#orgName").val($("#txtOrg").val());
                $("#txtOrg").val('');
                $('.chooseOrg').hide();
                $('.newOrg').show();
            });

            $('.btnCancelNewOrg').click(function () {
                $('.chooseOrg').show();
                $('.newOrg').hide();
            });

            $('.orgSelected .btnCancel').click(function() {
                $("#txtOrg").val('').focus();
                orgCleared();
            });

            // setup domain rows and add new domain link
            $('.newOrg .addDomain').unbind("click");
            $('.newOrg .addDomain').click(function () {
                var $domRow = $('.domainRow').first().clone();
                $domRow.find('.control-label').text("");
                $domRow.find('.txtDomain').val('');
                $domRow.find('.controls').append($("<button type='button' class='close' onclick='$(this).parents(\".domainRow\").remove();$(\".domainRowAdd\").show();'>&times;</button>"));
                $('.newOrg .domainRowAdd').before($domRow);
                
                if($('.domainRow').length>=5){
                    $(".domainRowAdd").hide();
                }
                              
                applyWatermark();
                $('.txtDomain').last().focus();

                return false;
            });

            // domain help icon.
            $(".domainHelp").BSPopoverExtender({
                $contentSource : $(".domainHelpContent"),
                cssClass: 'help-registrationDomain'
            });

            applyWatermark();
        }

        function showEdit(){
            $('.chooseOrg').hide();
            $('.newOrg').show();
        }


        function getPlaces(gid, $o, selectedId)
        {
            var url = APIRoot +"/api/v1/resources/locations/"+ gid + "?max=0";
            $.ajax({ url: url, dataType: 'jsonp' })
            .done(function (response) {

                var $locFields = $('.location');
                var idx = $locFields.index($o);
                var $locRows = $('.location').parents('.control-group');

                if(response.results.length>0){
                    $o.children('option:not(:first)').remove();
                    $(response.results).each(function() {
                        var place = $(this)[0];
                        var $option = $("<option value='" + place.GeoNameId + "'>"+ place.Name + "</option>");
                        if(place.GeoNameId === selectedId) {
                            $option.attr("selected", true);
                        }
                        $o.append($option);
                    });
                    $o.removeAttr('disabled').addClass('active');
                    $locRows.each(function() {$(this).show(); });
                }
                else {
                    $($locRows.get().reverse()).each(function(index){
                        if(index >= idx){
                            $(this).hide();
                        }
                    });
                }
                                
            })
            .fail(function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status); alert(thrownError);
            });
        }

        function getOrganizations() {

            $("#txtOrg").attr('disabled','disabled');

            var url = APIRoot + '/api/v1/resources/organizations?max=0&ttl=900&callback=?';

            $.ajax({ url: url, dataType: 'jsonp' })
                .done(function (response) {

                    valueSetData = doDataMapping(response.results);

                    // type-ahead
                    $.each(valueSetData, function (i, item) {
                        mapped[item.name] = item.id;
                        //typeAheadArray.push(item.name + padChar + item.webSite + padChar + item.description);
                        typeAheadArray.push(item.name + padChar + item.description);
                    });
                        
                    setupTypeAhead($("#txtOrg"));
                    setupAtoZ();
                    handleComplete();
                })
                .fail(function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status); alert(thrownError);
                });



        }

        var orgSelected = function (orgName) {

            $('.chooseOrg .cmdButtons').hide();

            var $orgSelected = $('.orgSelected');
            $orgSelected.find('.orgName').text(orgName);


            var id = $("#txtOrg").attr("orgId");

            var url = APIRoot + "/api/v1/resources/organizations/" + id + "?&ttl=900&callback=?";
            
            $.ajax({
                url : url,
                dataType : 'jsonp'
            }).done(function(response) {
                if (response.meta.status === 200) {

                    $orgSelected.find(".orgType").text(response.results[0].type !== null ? response.results[0].type : "");
                    $orgSelected.find(".orgCountry").text(response.results[0].country !== null ? response.results[0].country : "");
                    $orgSelected.find(".orgState").text(response.results[0].stateProvince !== null ? response.results[0].stateProvince : "");
                    $orgSelected.find(".orgCounty").text(response.results[0].county !== null ? response.results[0].county : "");

                    var domains = [];
                    $.each(response.results[0].website, function () {
                        var domain = $(this)[0];
                        //if (domain.isDefault) {
                            //orgStr = appendIfNotNull(orgStr, domain.url, padChar);
                        //}
                        domains.push(domain.url);
                    });

                    var domain = domains.length > 0 ? domains.join("<br/>") : "";
                    $orgSelected.find(".orgDomain").html(domain);
                }
                else
                {
//                  var messages = "";
                    if (response.meta.message.length === 1) {
                        //messages = obj.meta.message[0].userMessage;
                        console.debug(response.meta.message[0].userMessage);
                        console.debug(response.meta.message[0].developerMessage);
                    }
                    else {
//                      messages = "<ul>";
                        $(response.meta.message).each(function() {
//                                messages = messages + "<li>" + $(this)[0].userMessage + "</li>";
                            console.debug($(this)[0].userMessage);
                            console.debug($(this)[0].developerMessage);
                        });
//                      messages = messages + "</ul>";
                    }

                }

            }).fail(function(xhr, ajaxOptions, thrownError) {
                console.debug(xhr.status);
                console.debug(thrownError);
                console.debug(xhr.responseText);
            });
            
            $orgSelected.find(".orgType").text(id);






            $orgSelected.show();
            $('.orgSelected .cmdButtons').show();
            
        };

        var orgCleared = function (orgName) {

            $('.chooseOrg .cmdButtons').show();

            var $orgSelected = $('.orgSelected');
            $orgSelected.find('.orgName').text('');
            $orgSelected.hide();
            $('.orgSelected .cmdButtons').hide();
            
        };


        function doDataMapping(response) {
            var data = $.map(response, function (item) {
                item.name = $('<div/>').html(item.name).text();
                return item;
            });
            return data;
        }

        function setupTypeAhead($field) {
            $field.typeahead({
                source: typeAheadArray,
                items: 10,
                updater: function (org) {
                    if (org === '') { return ''; }

                    var orgName = org.split(padChar)[0];

                    var id = mapped[orgName];
                    $field.attr("orgId", id);
                    orgSelected(orgName);
                    return orgName;
                }
            });
            $field.removeAttr('disabled');
        }

        var setupAtoZ = function() {
            if($("#atozList").length === 0) {
                var $listNav = $("<div id='atozList-nav'>");
                var $ul = $("<ul id='atozList'>");
                $.each(valueSetData, function (i, item) {
                    var $li = $("<li value='" + item.id + "'></li>");
                    var $a = $("<a href='#'>" + item.name + "</a>");

                    $li.append($a);
                    $a.click(function () {
                        orgSelected(item.name);
                        $(".modal-registration .close").click();
                    });

                    var $spCity = $("<span class='city'>" + item.webSite + "</span>");
                    var $spState = $("<span class='state'>" + item.description + "</span>");

                    $li.append($spCity);
                    $li.append($spState);

                    $ul.append($li);
                });

                $("#atozModal .modal-body")
                    .append($listNav)
                    .append($ul);
                $('#atozList').listnav({ initLetter: 'a', showCounts: false });
            }
        };


        this.getOrg = function() {

            var isDefault = "true"; //only first one true for now
            var domains = [];
            $(".txtDomain").each(function() {
                domains.push({ isDefault: isDefault, url: $(this).val() });
                isDefault = "false";
            });

            if($("#txtOrg").is(":visible")){
                return { id : $("#txtOrg").attr("orgId") };
            }
            else {

                return {
                    type: $('#orgType').val(),
                    typeOther: $('#txtTypeOther').val(),
                    name: $('#orgName').val(),
                    stateProvince: $('#selectState option:selected').text(),
                    county: $('#selectRegion option:selected').text(),
                    country: $('#selectCountry option:selected').text(),
                    address: '',
                    addressContinued: '',
                    city: '',
                    postalCode: 0,
                    phone: 0,
                    fax: 0,
                    email: 'test@test.com',
                    website: domains,
                    locationId: $('.location').last().val()
                };

            }
        };

        this.validateOrg = function(){

            var isValid = true;
            var orgMsg = '';
            if($('.chooseOrg').is(':visible') && $("#txtOrg").attr("orgId") === undefined) {
                orgMsg += 'You must select an existing Organization or create a new one. <br>'; isValid = false;

                if(orgMsg !== ''){
                    $('.existingOrganizationValidation').show().find('.msg').html(orgMsg);
                    $('.existingOrganizationValidation').focus();
                    $('html, body').animate({
                        scrollTop: $('.existingOrganizationValidation').offset().top
                    }, 0);
                }
                else {
                    $('.existingOrganizationValidation').hide();
                }

            }
            else if($('.newOrg').is(':visible')) {

                var errors = [];

                if($('#orgName').val() === '') {
                    errors.push('Organization Name is a required field.');
                }
                if($('#orgType').val() === ''){
                    errors.push('Organization Type is a required field.');
                }
                if($('#orgType').val()=='Other'){
                    if($('#txtTypeOther').val() === ''){
                        errors.push("If 'Other' is chosen as the Organization Type, you must include a description.");
                    }
                }
                if($('#selectContinent:visible').length> 0 && $('#selectContinent:visible').val() === ''){
                    errors.push('Continent is a required field.');
                }
                if($('#selectCountry:visible').length> 0 && $('#selectCountry:visible').val() === ''){
                    errors.push('Country is a required field.');
                }
                if($('#selectState:visible').length> 0 && $('#selectState:visible').val() === ''){
                    errors.push('State/Province is a required field.');
                }
                if($('#selectRegion:visible').length> 0 && $('#selectRegion:visible').val() === ''){
                    errors.push('Region is a required field.');
                }
                if($('#selectCity:visible').length> 0 && $('#selectCity:visible').val() === ''){
                    errors.push('City is a required field.');
                }
                
                var domainEntered = false;
                $(".txtDomain").each(function(){
                    var domain = $(this).val();
                    if(domain !== '') {
                        domainEntered = true;
                        if(!validateDomain(domain, $(this))) {
                            errors.push("'" + domain + "' is not in a valid domain format.");
                        }
                    }
                });

                if(!domainEntered){
                    errors.push('At least one Web Site Domain must be entered for the organization.');
                }

                if(errors.length > 0) {
                    orgMsg += errors.join('<br>'); isValid = false;
                }
             
             
                if(orgMsg !== '') {
                    $('.newOrganizationValidation').show().find('.msg').html(orgMsg);
                    $('.newOrganizationValidation').focus();
                    $('html, body').animate({
                        scrollTop: $('.newOrganizationValidation').offset().top
                    }, 0);
                }else {
                    $('.newOrganizationValidation').hide();
                }
                            
            }

            return isValid;
        };

        main();

        return this;
    };

})(jQuery);