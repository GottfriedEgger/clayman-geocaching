/*global jQuery, google */

var tatortMap;
var tatortMapCenter;
var tatorte = [];

var medellin = new GameStage(new google.maps.LatLng(6.267685, -75.644156), new google.maps.LatLng(6.193965, -75.510432),'tatort.ae.question', 'tatort.ae.medellin', false, false);
var buergerbraeu =  new GameStage(new google.maps.LatLng(48.130653, 11.592083), new google.maps.LatLng(48.130571, 11.592201),'tatort.ah.question', 'tatort.ah.buergerbraeu', false, medellin);
var pompeius = new GameStage(new google.maps.LatLng(41.895956, 12.472465), new google.maps.LatLng(41.894267, 12.474289),'tatort.jc.question', 'tatort.jc.pompeius', false, buergerbraeu);
var fordsTheatre = new GameStage(new google.maps.LatLng(38.897014, -77.025970), new google.maps.LatLng(38.896392, -77.025347),'tatort.al.question','tatort.al.fordsTheatre', false, pompeius);
var headstone = new GameStage(new google.maps.LatLng(34.404, -104.194), new google.maps.LatLng(34.403, -104.193), '', 'tatort.bdk.headstone', false, fordsTheatre);
var fortSumnerPark = new GameStage(new google.maps.LatLng(34.404, -104.198), new google.maps.LatLng(34.399, -104.192), 'tatort.bdk.question', 'tatort.bdk.fortSumnerPark', headstone, false);
var dealeyPlaza = new GameStage(new google.maps.LatLng(32.779359, -96.809008), new google.maps.LatLng(32.778141, -96.807678),'', 'tatort.jfk.dealeyPlaza',false, fortSumnerPark);
var dallas = new GameStage(new google.maps.LatLng(32.934, -96.900), new google.maps.LatLng(32.698, -96.628), '', 'tatort.jfk.dallas', dealeyPlaza, false);
tatorte.push(dallas, fortSumnerPark, fordsTheatre, pompeius, buergerbraeu, medellin);

var currentGameState;

function GameStage(areaPointTopLeft, areaPointBottomRight, questionKey, rightAnswerKey, child, nextGameStage){
    this.areaPointTopLeft = areaPointTopLeft;
    this.areaPointBottomRight = areaPointBottomRight;
    this.questionKey = questionKey;
    this.rightAnswerKey = rightAnswerKey;
    this.child = child;
    this.nextGameStage = nextGameStage;
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
    showDialog(gameState.rightAnswerKey, 'tatort.dialog.title.ok');
}

function showQuestionDialog(gameState){
    showDialog(gameState.questionKey, 'tatort.dialog.title.next');
}

function bindTatortDialog(){
    var $tatortDialogPlaceholder = jQuery('#tatortDialogPlaceholder');
    $tatortDialogPlaceholder.puidialog({
        showEffect: 'fade',
        hideEffect: 'fade',
        modal: true,
        resizable: true,
        width: 400,
        buttons: [{
            text: 'OK',
            icon: 'ui-icon-check',
            click: function() {
                $tatortDialogPlaceholder.puidialog('hide');
            }
        }]
    });

    $tatortDialogPlaceholder.puidialog({
        afterHide: function() {
            if(currentGameState){
                showQuestionDialog(currentGameState.nextGameStage);
                currentGameState = null;
            }
        }
    });
}

function isPointInRectangle(point, pointTopLeft, pointBottomRight){
    return point.lat().between(pointBottomRight.lat(), pointTopLeft.lat()) &&
        point.lng().between(pointTopLeft.lng(), pointBottomRight.lng());

}

function findGameState(clickedLatLng, tatort){
    var pointInRectangle =  isPointInRectangle(clickedLatLng, tatort.areaPointTopLeft, tatort.areaPointBottomRight),
        foundGameState;

    if(pointInRectangle){
        if(tatort.child){
            foundGameState = findGameState(clickedLatLng, tatort.child);
        }
        if(foundGameState){
            return foundGameState;
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

        if(foundGameState !== null){
            break;
        }
    }
    if(foundGameState !== null){
        if(!foundGameState.child){
            currentGameState = foundGameState;
        }
        showOkDialog(foundGameState);
    }else{
        currentGameState = null;
        showDialog('tatort.dialog.nok', 'tatort.dialog.title.nok');
    }
}

function loadTatortMap() {
    var options,
        mapDiv = document.getElementById('mapTatort'),
        latLng = new google.maps.LatLng(38.0, -102.0);

    tatortMapCenter = latLng;

    options = {
        center: latLng,
        zoom: 4,
        mapTypeId: google.maps.MapTypeId.HYBRID,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
        },
        scaleControl: true,
        scaleControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        panControl: true,
        panControlOptions: {
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