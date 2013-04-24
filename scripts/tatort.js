/*global jQuery, google */

var tatortMap;
var tatortInfoWindow = new google.maps.InfoWindow();
var tatortMapCenter;
var tatorte = [];

var dealeyPlaza = new GameStage(new google.maps.LatLng(32.779, -96.809), new google.maps.LatLng(32.778, -96.807), 'tatort.dealeyPlaza',false);
var dallas = new GameStage(new google.maps.LatLng(32.934, -96.900), new google.maps.LatLng(32.698, -96.628), 'tatort.dallas', dealeyPlaza);
var fortSumnerPark = new GameStage(new google.maps.LatLng(34.404, -104.198), new google.maps.LatLng(34.399, -104.192),'tatort.fortSumnerPark', false);
var fordsTheatre = new GameStage(new google.maps.LatLng(38.897329, -77.025983), new google.maps.LatLng(38.896669, -77.025082),'tatort.fordsTheatre', false);
var pompeius = new GameStage(new google.maps.LatLng(41.895956, 12.472465), new google.maps.LatLng(41.894267, 12.474289),'tatort.pompeius', false);


tatorte.push(dallas, fortSumnerPark, fordsTheatre, pompeius);


function GameStage(areaPointTopLeft, areaPointBottomRight, infoTextKey, child){
    this.areaPointTopLeft = areaPointTopLeft;
    this.areaPointBottomRight = areaPointBottomRight;
    this.infoTextKey = infoTextKey;
    this.child = child;
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
        alert(jQuery.i18n.prop(foundGameState.infoTextKey));
    }else{
        alert("Falsch");
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

    tatortInfoWindow.setPosition(latLng);
    tatortInfoWindow.setContent('JFK');
    tatortInfoWindow.open(tatortMap);

    google.maps.event.addListener(tatortMap, 'click', function (e) {
        checkLocation(e.latLng);
    });

    addAutocompleteListener(tatortMap, 'addressSearchTxtTatort');
}

function tatortTabSelected(){
//        jQuery('#tatortTabContent').load('tatort.html');

    google.maps.event.trigger(tatortMap, "resize");
    tatortMap.setCenter(tatortMapCenter);
}

Number.prototype.between = function (number1, number2) {
    return number1 <= this.valueOf() && number2 >= this.valueOf();
};