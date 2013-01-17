/*global jQuery */

function setMapDivHeight(){
    var docHeight = jQuery(document).height(),
        mainTitleHeight = jQuery("#mainTitle").outerHeight(true),
        tabNavigationHeight = jQuery("ul.tabNavigation").outerHeight(true),
        footerHeight = jQuery("#footer").outerHeight(true),
        mapHeight = docHeight - mainTitleHeight - tabNavigationHeight - footerHeight - 66;

    jQuery("#map").height(mapHeight);
}

function placeSlider(){
    var $map = jQuery("#map"),
        top = $map.position().top,
        left = $map.position().left - 1,
        height = $map.height(),
        $mapCommands = jQuery("#mapCommands");

    $mapCommands.css({	top: top + 'px',
        left: left + 'px',
        height: height + 'px',
        visibility: 'visible'});

    jQuery("#slider").click(function (){
        jQuery(this).toggleClass("sliderOpen");

        var $mapCommandsContent = jQuery("#mapCommandsContent"),
            $mapCommandsContentWrapper = jQuery('#mapCommandsContentWrapper');

        $mapCommandsContent.toggleClass('paddingLeft10');

        if($mapCommandsContentWrapper.width() > 0){
            $mapCommandsContentWrapper.animate({width: '0px'});
            $mapCommandsContentWrapper.css('visibility', 'hidden');
        }else{
            $mapCommandsContentWrapper.animate({width: '390px'});
            $mapCommandsContentWrapper.css('visibility', 'visible');
        }
    });
}

window.onresize = function(){
    setMapDivHeight();
    placeSlider();
};

jQuery(function() {
    var tabContainers = jQuery('div.tabs > div');

    jQuery('div.tabs ul.tabNavigation a').click(function() {
        tabContainers.hide().filter(this.hash).show();

        jQuery('div.tabs ul.tabNavigation a').removeClass('selected');
        jQuery(this).addClass('selected');

        return false;
    }).filter(':first').click();
});

jQuery.i18n.properties({
    name: 'messages',
    path: 'bundle/',
    mode: 'both'
});

function setI18nProperties(language){
    if(!language){
        language = 'de';
    }

    jQuery.i18n.properties({
        name: 'messages',
        path: 'bundle/',
        mode: 'both',
        language: language
    });
}

function translatePage(language){
    if(!language){
        language = jQuery.i18n.browserLang();
    }

    setI18nProperties(language);

    jQuery('[data-i18n-key]').each(function(){
        var $translationNode = jQuery(this),
            key = $translationNode.attr('data-i18n-key');

        $translationNode.text(jQuery.i18n.prop(key));
    });

    jQuery('[data-i18n-title-key]').each(function(){
        var $translationNode = jQuery(this),
            key = $translationNode.attr('data-i18n-title-key');

        $translationNode.attr('title', jQuery.i18n.prop(key));
    });

    jQuery('[data-i18n-placeholder-key]').each(function(){
        var $translationNode = jQuery(this),
            key = $translationNode.attr('data-i18n-placeholder-key');

        $translationNode.attr('placeholder', jQuery.i18n.prop(key));
    });
}

function bindEnterActions(){
    var enterActionAttrName = 'data-enter-action-button-id',
        buttonId;

    jQuery('[' + enterActionAttrName + ']').each(function(){
        jQuery(this).keypress(function(event){
            if (event.which === 13 ){
                buttonId = jQuery(this).attr(enterActionAttrName);
                jQuery('#' + buttonId).trigger('click');
                event.preventDefault();
            }
        });
    });
}

function bindWarningDialog(){
    jQuery('#warningDialogPlaceholder').puidialog({
        showEffect: 'fade',
        hideEffect: 'fade',
        modal: true,
        resizable: false,
        buttons: [{
            text: 'OK',
            icon: 'ui-icon-check',
            click: function() {
                jQuery('#warningDialogPlaceholder').puidialog('hide');
            }
        }]
    });
}

function initPage(){
    jQuery("#tabs").tabs();

    translatePage();

    setMapDivHeight();

    jQuery(function($){
        $.mask.definitions.D ='[nNeEsSwW]';
        $("#coordCH").mask("999999 / 999999");
    });

    placeSlider();

    bindEnterActions();

    bindWarningDialog();
}

jQuery(document).ready(function() {
        initPage();
});