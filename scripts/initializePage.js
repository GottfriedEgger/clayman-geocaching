window.onresize = function(event){
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
    name:'messages',
    path: 'bundle/',
    mode:'both'
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
    setI18nProperties(language);

    var browserLang = jQuery.i18n.browserLang();

    jQuery('[data-i18nKey]').each(function(){
        var $translationNode = jQuery(this);
        var key = $translationNode.attr('data-i18nKey');
        $translationNode.text(jQuery.i18n.prop(key));
    });

    jQuery('button[title*="i18n."]').each(function(){
        var $translationNode = jQuery(this);
        var title = $translationNode.attr('title');
        var key = title.substring(title.indexOf('.') + 1);
        $translationNode.attr('title', jQuery.i18n.prop(key));
    });
}

function setMapDivHeight(){
    var docHeight = jQuery(document).height();
    var mainTitleHeight = jQuery("#mainTitle").outerHeight(true);
    var tabNavigationHeight = jQuery("ul.tabNavigation").outerHeight(true);
    var footerHeight = jQuery("#footer").outerHeight(true);


    var mapHeight = docHeight - mainTitleHeight - tabNavigationHeight - footerHeight - 66;

    jQuery("#map").height(mapHeight);
}

function placeSlider(){
    var $map = jQuery("#map");
    var top = $map.position().top;
    var left = $map.position().left -1;
    var height = $map.height();

    var $mapCommands = jQuery("#mapCommands");
    $mapCommands.css({	top: top + 'px',
        left: left + 'px',
        height: height + 'px',
        visibility: 'visible'});

    jQuery("#slider").click(function(){
        jQuery(this).toggleClass("sliderOpen");

        var $mapCommandsContent = jQuery("#mapCommandsContent");
        var $mapCommandsContentWrapper = jQuery('#mapCommandsContentWrapper');

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

function bindHandlers(){
    jQuery("#addressSearchTxt").keypress(function(event) {
        if ( event.which == 13 ) {
            jQuery("#addressSearchBtn").trigger('click');
            event.preventDefault();
        }
    });
}