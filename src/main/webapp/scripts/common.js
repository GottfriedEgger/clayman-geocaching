/*global jQuery */

Array.prototype.contains = function contains(string) {
    var i;
    for (i = 0; i < this.length; i+=1) {
        if (this[i] === string) {
            return true;
        }
    }

    return false;
};

function showWarningDialog(contentKey, parameters) {
    var $dialog = jQuery('#warningDialogPlaceholder'),
        $content = $dialog.find('.pui-dialog-content'),
        $title = $dialog.find('.pui-dialog-title'),
        dialogContent = jQuery.i18n.prop(contentKey, parameters),
        dialogTitle = jQuery.i18n.prop('map.warning.dialog.title');

    $title.html(dialogTitle);
    $content.html('<p>' + dialogContent + '</p>');
    $dialog.puidialog('show');
}

function getUrlParams(){
    var splitedUrl = window.location.href.split('?'),
        urlParams=[],
        i,
        keyValue,
        params=[];

    if(splitedUrl.length > 1){
        urlParams = splitedUrl[1].split('&');
    }

    for(i = 0; i < urlParams.length; i++){
        keyValue = urlParams[i].split("=");
        params.push(keyValue[0]);
        params[keyValue[0]] = keyValue[1];
    }

    return params;
}

function addAutoCompleteListener(map, searchFieldId){
    var inputAddress,
        autoComplete;

    inputAddress = document.getElementById(searchFieldId);
    autoComplete = new google.maps.places.Autocomplete(inputAddress);
    autoComplete.bindTo('bounds', map);

    google.maps.event.addListener(autoComplete, 'place_changed', placeChangedListener);

    return autoComplete;
}

function changeFavicon(faviconFileName) {
    var $oldLink = jQuery('#myFavicon'),
        $head = jQuery('head');

    $oldLink.remove();
    $head.append('<link rel="shortcut icon" id="myFavicon" href="images/icons/' + faviconFileName + '">');
}