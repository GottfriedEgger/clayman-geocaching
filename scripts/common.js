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

    for(i = 0; i< urlParams.length; i++){
        keyValue = urlParams[i].split("=");
        params.push(keyValue[0]);
        params[keyValue[0]] = keyValue[1];
    }

    return params;
}

function addAutocompleteListener(map, searchFieldId){
    var inputAddress,
        autocomplete;

    inputAddress = document.getElementById(searchFieldId);
    autocomplete = new google.maps.places.Autocomplete(inputAddress);
    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(autocomplete, 'place_changed', placeChangedListener);
}