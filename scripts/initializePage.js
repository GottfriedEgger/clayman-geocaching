/*global jQuery */

function setMapDivHeight(){
    var docHeight = jQuery(document).height(),
        mainTitleHeight = jQuery("#mainTitle").outerHeight(true),
        tabNavigationHeight = jQuery("ul.tabNavigation").outerHeight(true),
        footerHeight = jQuery("#footer").outerHeight(true),
        mapHeight = docHeight - mainTitleHeight - tabNavigationHeight - footerHeight - 66;

    jQuery('.map').each(function () {
        jQuery(this).height(mapHeight)
    });
}

function placeSlider(){

    jQuery('.mapCommandsPanel').each(function(){
        var $commandPanelContentWrapper = jQuery(this).children('.mapCommandsContentWrapper');
        var $commandPanelContent = jQuery($commandPanelContentWrapper.children());
        var $slider = jQuery(this).children('.slider');
        var $map = jQuery(this).next();
        var top = $map.position().top,
        left = $map.position().left - 1,
            height = $map.height();

        jQuery(this).css({	top: top + 'px',
        left: left + 'px',
        height: height + 'px',
        visibility: 'visible'});

        $slider.click(function(){
            $slider.toggleClass("sliderOpen");

            $commandPanelContent.toggleClass('paddingLeft10');

            if($commandPanelContentWrapper.width() > 0){
                $commandPanelContentWrapper.animate({width: '0px'});
                $commandPanelContentWrapper.css('visibility', 'hidden');
            }else{
                $commandPanelContentWrapper.animate({width: '390px'});
                $commandPanelContentWrapper.css('visibility', 'visible');
            }
        });

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

function initTabs(){
    var $tabs = jQuery("#tabs");

    $tabs.tabs();

    $tabs.bind('tabsshow', function(event, ui) {

        if (ui.panel.id == "tatortTabContent") {
            tatortTabSelected();
        }

        placeSlider();
    });

}

function initializePage(){

    initTabs();

    loadGeocachingMap();

    initTatort();

    translatePage();

    setMapDivHeight();

    placeSlider();

    bindEnterActions();

    bindWarningDialog();

    if(getUrlParams()['game']){
        jQuery("#tabs").tabs('select', 2);
    }

}

jQuery(document).ready(function() {
    initializePage();
});