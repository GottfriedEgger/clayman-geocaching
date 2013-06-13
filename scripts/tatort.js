/*global jQuery, google */

var tatortMap;
var tatortInfoWindow = new google.maps.InfoWindow();
var tatortMapCenter;
var tatorte = [];

var pompeius = new GameStage(new google.maps.LatLng(41.895956, 12.472465), new google.maps.LatLng(41.894267, 12.474289),'tatort.pompeius', false, false);
var fordsTheatre = new GameStage(new google.maps.LatLng(38.897329, -77.025983), new google.maps.LatLng(38.896669, -77.025082),'tatort.  fordsTheatre', false, pompeius);
var fortSumnerPark = new GameStage(new google.maps.LatLng(34.404, -104.198), new google.maps.LatLng(34.399, -104.192),'tatort.bdk.fortSumnerPark', false, fordsTheatre);
var dealeyPlaza = new GameStage(new google.maps.LatLng(32.779, -96.809), new google.maps.LatLng(32.778, -96.807), 'tatort.jfk.dealeyPlaza',false, fortSumnerPark);
var dallas = new GameStage(new google.maps.LatLng(32.934, -96.900), new google.maps.LatLng(32.698, -96.628), 'tatort.jfk.dallas', dealeyPlaza, false);
tatorte.push(dallas, fortSumnerPark, fordsTheatre, pompeius);

var currentGameState;

function GameStage(areaPointTopLeft, areaPointBottomRight, infoTextKey, child, nextGameStage){
    this.areaPointTopLeft = areaPointTopLeft;
    this.areaPointBottomRight = areaPointBottomRight;
    this.infoTextKey = infoTextKey;
    this.child = child;
    this.nextGameStage = nextGameStage;
}

function bindTatortDialog(){
    jQuery('#tatortDialogPlaceholder').puidialog({
        showEffect: 'fade',
        hideEffect: 'fade',
        modal: true,
        resizable: false,
        buttons: [{
            text: 'OK',
            icon: 'ui-icon-check',
            click: function() {
                jQuery('#tatortDialogPlaceholder').puidialog('hide');
            }
        }]
    });


}

function showDialog(contentKey, parameters){
    var $dialog = jQuery('#tatortDialogPlaceholder'),
        $content = $dialog.find('.pui-dialog-content'),
        $title = $dialog.find('.pui-dialog-title'),
        dialogContent = jQuery.i18n.prop(contentKey),
        dialogTitle = jQuery.i18n.prop(parameters);

    $title.html(dialogTitle);
    $content.html(dialogContent);
    $dialog.puidialog('show');
}

function showWelcomeDialog(){
    showDialog('tatort.dialog.welcome','tatort.dialog.title.welcome');
}

function showOkDialog(gameState){
    showDialog(gameState.infoTextKey, 'tatort.dialog.title.ok')
}

function isPointInRectangle(point, pointTopLeft, pointBottomRight){

    return point.lat().between(pointBottomRight.lat(), pointTopLeft.lat()) &&
        point.lng().between(pointTopLeft.lng(), pointBottomRight.lng());

}

function findGameState(clickedLatLng, tatort){
    var pointInRectangle =  isPointInRectangle(clickedLatLng, tatort.areaPointTopLeft, tatort.areaPointBottomRight),
        foundGameStateChild;

    if(pointInRectangle){
        if(tatort.child){
            foundGameStateChild = findGameState(clickedLatLng, tatort.child);
        }
        if(foundGameStateChild){
            return foundGameStateChild
        }
        return tatort;
    }

    return null;
}

function checkLocation(clickedLatLng){
    var x,
        foundGameState;

    for (x = 0; x < tatorte.length; x++) {
        foundGameState = findGameState(clickedLatLng, tatorte[x]);

        if(foundGameState != null){
            break;
        }
    }
    if(foundGameState != null){
        currentGameState = foundGameState;
        showOKDialog(foundGameState)
    }else{
        showDialog('tatort.dialog.nok', 'tatort.dialog.title.nok');
    }

}

function loadTatortMap() {
    var mapDiv = document.getElementById('mapTatort'),
        latLng = new google.maps.LatLng(38.0, -102.0);

    tatortMapCenter = latLng;

    var options = {
        center: latLng,
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
        },
        navigationControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    };
    tatortMap = new google.maps.Map(mapDiv, options);


    google.maps.event.addListener(tatortMap, 'click', function (e) {
        checkLocation(e.latLng);
    });

    addAutocompleteListener(tatortMap, 'addressSearchTxtTatort');
}

function tatortTabSelected(){
    google.maps.event.trigger(tatortMap, "resize");
    tatortMap.setCenter(tatortMapCenter);

    showWelcomeDialog();
}

Number.prototype.between = function (number1, number2) {
    return number1 <= this.valueOf() && number2 >= this.valueOf();
};

function initTatort(){
    loadTatortMap();

    bindTatortDialog();
}