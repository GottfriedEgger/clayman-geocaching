/*global jQuery, google */

var currentGameState;
var currentQuestion;
var tatortMap;
var tatortMapCenter;
var tatorte = [];

function GameStage(areaPointBottomRight, areaPointTopLeft, questionKey, rightAnswerKey, child, nextGameStage) {
    this.areaPointBottomRight = areaPointBottomRight;
    this.areaPointTopLeft = areaPointTopLeft;
    this.questionKey = questionKey;
    this.rightAnswerKey = rightAnswerKey;
    this.child = child;
    this.nextGameStage = nextGameStage;
}

function showDialog(contentKey, dialogTitleKey) {
    var $dialog = jQuery('#tatortDialogPlaceholder'),
        $content = $dialog.find('.pui-dialog-content'),
        $title = $dialog.find('.pui-dialog-title'),
        dialogContent = jQuery.i18n.prop(contentKey),
        dialogTitle = jQuery.i18n.prop(dialogTitleKey);

    $title.html(dialogTitle);
    $content.html(dialogContent);
    $dialog.puidialog('show');
}

function showWelcomeDialog() {
    showDialog('tatort.dialog.welcome', 'tatort.dialog.title.welcome');
    currentQuestion = dallas;
}

function showOkDialog(gameState) {
    showDialog(gameState.rightAnswerKey, 'tatort.dialog.title.ok');
}

function showQuestionDialog(gameState) {
    showDialog(gameState.questionKey, 'tatort.dialog.title.next');
}

function showCurrentQuestion() {
    showQuestionDialog(currentQuestion);
}

function bindTatortDialog() {
    var $tatortDialogPlaceholder = jQuery('#tatortDialogPlaceholder');
    $tatortDialogPlaceholder.puidialog({
        showEffect: 'fade',
        hideEffect: 'fade',
        modal: true,
        resizable: true,
        width: 480,
        buttons: [
            {
                text: 'OK',
                icon: 'ui-icon-check',
                click: function () {
                    $tatortDialogPlaceholder.puidialog('hide');
                }
            }
        ]
    });

    $tatortDialogPlaceholder.puidialog({
        afterHide: function () {
            var isLastGameStage,
                nextGameStage;

            if (currentGameState) {
                nextGameStage = currentGameState.nextGameStage;
                isLastGameStage = nextGameStage === tatorte[tatorte.length - 1];

                if (isLastGameStage) {
                    showDialog(nextGameStage.rightAnswerKey, 'tatort.dialog.title.end');
                } else {
                    showQuestionDialog(nextGameStage);
                    currentQuestion = nextGameStage;
                }
                currentGameState = null;
            }
        }
    });
}

function isPointInRectangle(point, pointTopLeft, pointBottomRight) {
    if (pointTopLeft === null || pointBottomRight === null) {
        return false;
    }

    return point.lat().between(pointBottomRight.lat(), pointTopLeft.lat()) &&
        point.lng().between(pointTopLeft.lng(), pointBottomRight.lng());

}

function findGameState(clickedLatLng, tatort) {
    var pointInRectangle = isPointInRectangle(clickedLatLng, tatort.areaPointTopLeft, tatort.areaPointBottomRight),
        foundGameState;

    if (pointInRectangle) {
        if (tatort.child) {
            foundGameState = findGameState(clickedLatLng, tatort.child);
        }
        if (foundGameState) {
            return foundGameState;
        }
        return tatort;
    }

    return null;
}

var theEnd = new GameStage(null, null, null, 'tatort.end', false, false);
var kingston = new GameStage(new google.maps.LatLng(18.002922, -76.774883), new google.maps.LatLng(18.003065, -76.775098), 'tatort.bm.question', 'tatort.bm.kingston', false, theEnd);
var rothenbaum = new GameStage(new google.maps.LatLng(53.572944, 9.992590), new google.maps.LatLng(53.574136, 9.990508), 'tatort.ms.question', 'tatort.ms.rothenbaum', false, kingston);
var medellin = new GameStage(new google.maps.LatLng(6.193965, -75.510432), new google.maps.LatLng(6.267685, -75.644156), 'tatort.ae.question', 'tatort.ae.medellin', false, rothenbaum);
var buergerbraeu = new GameStage(new google.maps.LatLng(48.130571, 11.592201), new google.maps.LatLng(48.130653, 11.592083), 'tatort.ah.question', 'tatort.ah.buergerbraeu', false, medellin);
var pompeius = new GameStage(new google.maps.LatLng(41.894267, 12.474289), new google.maps.LatLng(41.895956, 12.472465), 'tatort.jc.question', 'tatort.jc.pompeius', false, buergerbraeu);
var fordsTheatre = new GameStage(new google.maps.LatLng(38.896392, -77.025347), new google.maps.LatLng(38.897014, -77.025970), 'tatort.al.question', 'tatort.al.fordsTheatre', false, pompeius);
var headstone = new GameStage(new google.maps.LatLng(34.403, -104.193), new google.maps.LatLng(34.404, -104.194), '', 'tatort.bdk.headstone', false, fordsTheatre);
var fortSumnerPark = new GameStage(new google.maps.LatLng(34.399, -104.192), new google.maps.LatLng(34.404, -104.198), 'tatort.bdk.question', 'tatort.bdk.fortSumnerPark', headstone, false);
var dealeyPlaza = new GameStage(new google.maps.LatLng(32.778141, -96.807678), new google.maps.LatLng(32.779359, -96.809008), '', 'tatort.jfk.dealeyPlaza', false, fortSumnerPark);
var dallas = new GameStage(new google.maps.LatLng(32.698, -96.628), new google.maps.LatLng(32.934, -96.900), 'tatort.dialog.welcome', 'tatort.jfk.dallas', dealeyPlaza, false);
tatorte.push(dallas, fortSumnerPark, fordsTheatre, pompeius, buergerbraeu, medellin, rothenbaum, kingston, theEnd);

function findLocation(clickedLatLng) {
    var x,
        foundGameState;

    for (x = 0; x < tatorte.length; x++) {
        foundGameState = findGameState(clickedLatLng, tatorte[x]);

        if (foundGameState !== null) {
            break;
        }
    }
    if (foundGameState !== null) {
        if (!foundGameState.child) {
            currentGameState = foundGameState;
        }
    } else {
        currentGameState = null;
    }
    return foundGameState;
}

function checkLocation(clickedLatLng) {
    var foundLocation = findLocation(clickedLatLng);

    if (foundLocation !== null) {
        showOkDialog(foundLocation);
    } else {
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
        },
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ]


    };
    tatortMap = new google.maps.Map(mapDiv, options);


    google.maps.event.addListener(tatortMap, 'click', function (e) {
        checkLocation(e.latLng);
    });

    addAutocompleteListener(tatortMap, 'addressSearchTxtTatort');
}

function tatortTabSelected() {
    changeFavicon("gun.ico");

    google.maps.event.trigger(tatortMap, "resize");
    tatortMap.setCenter(tatortMapCenter);

    showWelcomeDialog();
}

Number.prototype.between = function (number1, number2) {
    return number1 <= this.valueOf() && number2 >= this.valueOf();
};

function initTatort() {
    loadTatortMap();

    bindTatortDialog();
}

function searchLocationAndDisplay(inputFieldId) {
    var address = jQuery("#" + inputFieldId).val(),
        geocoderRequest;

    if (address === '') {
        return;
    }

    infoWindow.close(tatortMap);

    if (!geocoder) {
        geocoder = new google.maps.Geocoder();
    }

    geocoderRequest = {
        address: address
    };

    geocoder.geocode(geocoderRequest, function (results, status) {
        var content,
            formattedAddress,
            latLng;

        if (status === google.maps.GeocoderStatus.OK) {

            latLng = results[0].geometry.location;
            tatortMap.setCenter(latLng);
            tatortMap.setZoom(14);

            var foundLocation = findLocation(latLng);
            if (foundLocation !== null) {
                showOkDialog(foundLocation);
            } else {
                formattedAddress = results[0].formatted_address;

                var inCh = containtsAddressShortName(results, 'CH');

                content = '<div id="locationInfoWindow" class="locationInfoWindow">';
                content += '<dl class="dlLocationInfoWindow">';
                content += ' <dt><label>' + jQuery.i18n.prop('map.location') + ':</label></dt>';
                content += ' <dd>' + formattedAddress + '</dd>';
                content += ' <dt><label>' + jQuery.i18n.prop('map.position') + ':</label></dt>';
                content += ' <dd>' + convertLatLngToDecimalMinutes(latLng) + '</dd>';
                if (inCh) {
                    content += ' <dt><dt><dd><span>' + convertWGStoCH(latLng) + '</span></dd>';
                }
                content += '</dl>';
                content += '</div>';

                infoWindow.setPosition(latLng);
                infoWindow.setContent(content);
                infoWindow.open(tatortMap);
            }
        } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
            showWarningDialog('map.warning.zero_results', ['\'' + address + '\'']);
        } else {
            showWarningDialog('map.warning.search_error');
        }

    });
}