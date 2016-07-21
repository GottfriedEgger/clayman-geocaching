/*global jQuery, google, FileReader, convertGoogleLatLngToDecimalMinutes, MarkerClusterer */

var mainMap;
var autoComplete;
var gcMarkers = {};
var geocoder = 0;
var markerClusterer = 0;
var straightPolygon;
var geodesic;
var bounds = 0;
var markerDistanceDestination;
var markerDistanceOrigin;

var infoWindow = new google.maps.InfoWindow();

var roadMapStyleOff = {
    featureType: "road",
    elementType: "all",
    stylers: [
        { visibility: "off" }
    ]
};
var landscapeMapStyleOff = {
    featureType: "landscape",
    elementType: "all",
    stylers: [
        { visibility: "off" }
    ]
};
var administrativeMapStyleOff = {
    featureType: "administrative",
    elementType: "all",
    stylers: [
        { visibility: "off" }
    ]
};
var countryMapStyleOn = {
    featureType: "administrative.country",
    elementType: "geometry",
    stylers: [
        { visibility: "on" }
    ]
};
var poiMapStyleOff = {
    featureType: "poi",
    elementType: "all",
    stylers: [
        { visibility: "off" }
    ]
};
var waterLabelMapStyleOff = {
    featureType: "water",
    elementType: "labels",
    stylers: [
        { visibility: "off" }
    ]
};


var elevationService = 0;

function addSimpleMapType() {
    var mapStyle = [],
        simpleStyledMap;

    mapStyle.push(roadMapStyleOff);
    mapStyle.push(landscapeMapStyleOff);
    mapStyle.push(administrativeMapStyleOff);
    mapStyle.push(countryMapStyleOn);
    mapStyle.push(poiMapStyleOff);
    mapStyle.push(waterLabelMapStyleOff);

    simpleStyledMap = new google.maps.StyledMapType(mapStyle,
        {name: "Simple Map"});

    mainMap.mapTypes.set('simple_map_style', simpleStyledMap);

}

function getElevationInMeters(elevationResponse, responseStatus) {
    var elevationResult;

    if (responseStatus === google.maps.ElevationStatus.OK) {
        if (elevationResponse[0]) {
            elevationResult = elevationResponse[0].elevation.toFixed(0);
        } else {
            elevationResult = jQuery.i18n.prop('map.warning.no_elevation');
        }
    } else {
        console.log('No elevation service found: ' + responseStatus);
        elevationResult = jQuery.i18n.prop('map.warning.no_elevation_service') + responseStatus;
    }

    return elevationResult;
}

function placeChangedListener() {
    var place = autoComplete.getPlace(),
        latLng,
        content;

    if (place.geometry) {
        infoWindow.close(mainMap);

        mainMap.setCenter(place.geometry.location);
        mainMap.setZoom(14);

        latLng = place.geometry.location;

        content = '<div class="locationInfoWindow" >';
        content += place.formatted_address + '<br />';
        content += 'Position: ' + convertLatLngToDecimalMinutes(latLng) + '<br>';
        content += '</div>';

        infoWindow.setPosition(latLng);
        infoWindow.setContent(content);
        infoWindow.open(mainMap);
    }
}

function showLocationInfoPopup(latLng) {
    var locations = [],
        positionalRequest,
        lat,
        lng;

    infoWindow.close(mainMap);

    if (!elevationService) {
        elevationService = new google.maps.ElevationService();
    }

    locations.push(latLng);

    positionalRequest = {
        'locations': locations
    };

    elevationService.getElevationForLocations(positionalRequest, function (elevationResponse, responseStatus) {
        infoWindow.setPosition(latLng);

        lat = latLng.lat();
        lng = latLng.lng();

        var content = '<div id="locationInfoWindow" class="locationInfoWindow">' +
            '<dl class="dlLocationInfoWindow">' +
            ' <dt><label>' + jQuery.i18n.prop('map.position') + ':</label></dt>' +
            ' <dd>' + convertLatLngToDecimalMinutes(latLng) + '</dd>' +
            ' <dt><dt><dd><span>' + lat.toFixed(6) + ' ' + lng.toFixed(6) + '</span></dd>' +
            ' <dt><dt><dd><span>' + convertWGStoCH(latLng) + '</span></dd>' +
            ' <dt><label>' + jQuery.i18n.prop('map.elevation') + ':</label></dt>' +
            ' <dd>' + getElevationInMeters(elevationResponse, responseStatus) + ' ' + jQuery.i18n.prop('map.elevation.unit') + '</dd>' +
            '</dl>' +
            '</div>';

        infoWindow.setContent(content);
        infoWindow.open(mainMap);
    });
}

function loadGeocachingMap() {
    var mapDiv = document.getElementById('map'),
        latLng = new google.maps.LatLng(46.8, 7.985),
        options;

    options = {
        center: latLng,
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, 'simple_map_style'],
            position: google.maps.ControlPosition.TOP_CENTER
        },
        navigationControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
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

    mainMap = new google.maps.Map(mapDiv, options);

    infoWindow.setPosition(latLng);
    infoWindow.setContent(jQuery.i18n.prop('map.start_info_window_text'));
    infoWindow.open(mainMap);

    google.maps.event.addListener(mainMap, 'click', function (e) {
        showLocationInfoPopup(e.latLng);
    });

    addSimpleMapType();

    markerClusterer = new MarkerClusterer(mainMap);

    autoComplete = addAutoCompleteListener(mainMap, 'addressSearchTxtMainMap');
}

function geocachingTabSelected() {
    changeFavicon("globe.ico");
    google.maps.event.trigger(mainMap, "resize");
}

function setMarkersVisibility(visible) {
    var key, typeArray, x;

    for (key in gcMarkers) {
        if (gcMarkers.hasOwnProperty(key)) {
            typeArray = gcMarkers[key];

            for (x = 0; x < typeArray.length; x += 1) {
                typeArray[x].setVisible(visible);
            }
        }
    }
}

function clearDestinationOverlays() {
    if (markerDistanceDestination) {
        markerDistanceOrigin.setMap(null);
    }
    if (markerDistanceDestination) {
        markerDistanceDestination.setMap(null);
    }

    if (straightPolygon) {
        straightPolygon.getPath().clear();
    }
    if (geodesic) {
        geodesic.getPath().clear();
    }
}

function clearMap() {
    if (infoWindow) {
        infoWindow.close(mainMap);
    }

    setMarkersVisibility(false);

    gcMarkers = {};

    markerClusterer.clearMarkers();

    clearDestinationOverlays();

}

function readFile() {
    var file, files, reader;

    gcMarkers = {};
    clearMap();

    files = document.getElementById('files').files;

    if (!checkFileReadPreconditions(files)) {
        return;
    }

    file = files[0];
    reader = new FileReader();

    reader.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            var xmlContentGpx = evt.target.result,
                waypoints = [],
                xmlDoc = jQuery.parseXML(xmlContentGpx),
                $xml = jQuery(xmlDoc);

            $xml.find('wpt').each(function () {
                var foundType, logDate = '', logText = '';

                jQuery(this).find("groundspeak\\:logs, logs").each(function () {
                    foundType = jQuery(this).find("groundspeak\\:type, type").text();
                    logDate = jQuery(this).find("groundspeak\\:date, date").text();
                    logDate = logDate.substring(0, logDate.indexOf('T'));
                    logText = jQuery(this).find("groundspeak\\:text, text").text();
                });

                if (foundType && foundType === 'Found it') {
                    var lat = jQuery(this).attr('lat'),
                        lon = jQuery(this).attr('lon'),
                        name = jQuery(this).find('name').text(),
                        urlName = jQuery(this).find('urlname').text(),
                        url = jQuery(this).find('url').text(),
                        type = jQuery(this).find('type').text().split("|")[1],
                        waypoint = {lat: lat, lon: lon, name: name, urlName: urlName, url: url, type: type,
                            logDate: logDate, logText: logText};
                    waypoints.push(waypoint);
                }

            });

            displayWaypoints(waypoints);
        }
    };


    reader.readAsText(file);
}

function checkFileReadPreconditions(files) {

    var warnMessageKey;

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        warnMessageKey = 'map.warning.missing_file_api';
    } else if (!files.length) {
        warnMessageKey = 'map.warning.select_file';
    } else if (!files[0].name.match('.*gpx')) {
        warnMessageKey = 'map.warning.select_gpx';
    }

    if (warnMessageKey) {
        showWarningDialog(warnMessageKey);
        return false;
    }

    return true;
}

function isClusteringActivated() {
    return jQuery("#useClustering:checked").val();
}

function displayWaypoints(waypoints) {
    bounds = new google.maps.LatLngBounds();

    var clusteringActivated = isClusteringActivated(),
        x;

    for (x = 0; x < waypoints.length; x += 1) {
        var waypoint = waypoints[x];
        var latLng = new google.maps.LatLng(waypoint.lat, waypoint.lon);
        bounds.extend(latLng);

        var gcMarker = new google.maps.Marker({
            position: latLng,
            map: mainMap,
            icon: 'images/smiley_16x16.png'
        });

        if (!gcMarkers[waypoint.type]) {
            gcMarkers[waypoint.type] = [];
        }
        gcMarkers[waypoint.type].push(gcMarker);

        if (clusteringActivated) {
            markerClusterer.addMarker(gcMarker);
        }

        (function (gcMarker, waypoint) {

            google.maps.event.addListener(gcMarker, 'click', function () {

                if (!geocoder) {
                    geocoder = new google.maps.Geocoder();
                }

                var geocoderRequest = {
                    latLng: gcMarker.position
                };

                geocoder.geocode(geocoderRequest, function (geocoderRequestResult, status) {

                    var gcLink, content;

                    gcLink = '<a href="' + waypoint.url + '" target="_blank">' + waypoint.urlName + '</a>';

                    content = '<div class="cacheInfoWindow">' +
                        '<table class="cacheInfoTable" style="border-spacing: 20px 5px;">' +
                        '<tr>' +
                        '<td>' + gcLink + '</td>' +
                        '<td>' + waypoint.name + '</td>' +
                        '</tr><tr>';

                    if (status === google.maps.GeocoderStatus.OK) {
                        content += '<td>' + jQuery.i18n.prop('map.wpt.location') + '</td>';
                        content += '<td>' + getDisplayAddress(geocoderRequestResult) + '</td>';
                    } else {
                        content += '<p>No address could be found. Status = ' + status + '</p>';
                    }

                    content += '<tr>' +
                        '<td>' + jQuery.i18n.prop('map.wpt.found_at') + '</td>' +
                        '<td>' + waypoint.logDate + '</td>' +
                        '</tr>';

                    content += '<tr>' +
                        '<td>' + jQuery.i18n.prop('map.wpt.log_text') + '</td>' +
                        '<td>' + waypoint.logText.substring(0, 20) + '...</td>' +
                        '</tr>';

                    content += '</tr>' +
                        '</table>' +
                        '</div>';

                    infoWindow.setContent(content);
                    infoWindow.open(mainMap, gcMarker);
                });
            });

        })(gcMarker, waypoint);
    }

    mainMap.fitBounds(bounds);

}

function containtsAddressShortName(geocoderRequestResult, shortNameToFind) {
    var addressComponent,
        addressComponents,
        x,
        y;

    for (x = 0; x < geocoderRequestResult.length; x += 1) {
        addressComponents = geocoderRequestResult[x].address_components;

        for (y = 0; y < addressComponents.length; y += 1) {
            addressComponent = addressComponents[y];

            if (addressComponent.short_name === shortNameToFind) {
                return true;
            }
        }
    }

    return false;
}

function getDisplayAddress(geocoderRequestResult) {
    var displayAddress = [],
        highLevelAddressComponents = 0,
        x,
        y,
        types,
        type,
        partsOfLocation = [],
        partOfLocation,
        addressComponent;

    for (x = 0; x < geocoderRequestResult.length; x += 1) {
        types = geocoderRequestResult[x].types;

        if (!types.contains('bus_station')) {
            highLevelAddressComponents = geocoderRequestResult[x].address_components;
            break;
        }
    }

    for (x = 0; x < highLevelAddressComponents.length; x += 1) {
        addressComponent = highLevelAddressComponents[x];
        types = addressComponent.types;

        for (y = 0; y < types.length; y += 1) {
            type = types[y];

            if (type === 'country' || type === 'administrative_area_level_1' || type === 'locality' || type === 'administrative_area_level_2' || type === 'locality' || type === 'postal_town') {
                partsOfLocation[type] = addressComponent.short_name;
            }
        }
    }

    if (partOfLocation = partsOfLocation.locality) {
        displayAddress.push(partOfLocation);
    }

    if (partOfLocation = partsOfLocation.administrative_area_level_1) {
        displayAddress.push(partOfLocation);
    } else if (partOfLocation = partsOfLocation.administrative_area_level_2) {
        displayAddress.push(partOfLocation);
    } else if (partOfLocation = partsOfLocation.postal_town) {
        displayAddress.push(partOfLocation);
    }

    displayAddress.push(partsOfLocation.country);

    return displayAddress.join(", ");
}

function searchLocationAndDisplay(map, inputFieldId){
	var address = jQuery("#" + inputFieldId).val(),
        geocoderRequest;

    if (address === '') {
        return;
    }

    infoWindow.close(map);

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
            map.setCenter(latLng);
            map.setZoom(14);

            formattedAddress = results[0].formatted_address;

            var inCh = containtsAddressShortName(results, 'CH');

            content = '<div id="locationInfoWindow" class="locationInfoWindow">';
            content += '<dl class="dlLocationInfoWindow">';
            content += ' <dt><label>' + jQuery.i18n.prop('map.location') + ':</label></dt>';
            content += ' <dd>' + formattedAddress + '</dd>';
            content += ' <dt><label>' + jQuery.i18n.prop('map.position') + ':</label></dt>';
            content += ' <dd>' + convertLatLngToDecimalMinutes(latLng) + '</dd>';
            if(inCh){
                content += ' <dt><dt><dd><span>' + convertWGStoCH(latLng) + '</span></dd>';
            }
            content += '</dl>';
            content += '</div>';

            infoWindow.setPosition(latLng);
            infoWindow.setContent(content);
            infoWindow.open(map);

        } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
            showWarningDialog('map.warning.zero_results', ['\'' + address + '\'']);
        } else {
            showWarningDialog('map.warning.search_error');
        }

    });
}

function getHeight(latLng){
    var locations = [],
        positionalRequest;

    if (!elevationService) {
        elevationService = new google.maps.ElevationService();
    }

    locations.push(latLng);

    positionalRequest = {
        'locations': locations
    };

    elevationService.getElevationForLocations(positionalRequest, function (elevationResponse, responseStatus) {
        return getElevationInMeters(elevationResponse, responseStatus);
    });
}

function toggleClusterer() {

    var x, key, typeArray;

    if (markerClusterer.getMarkers().length > 0) {
        markerClusterer.clearMarkers();

        for (key in gcMarkers) {
            if (gcMarkers.hasOwnProperty(key)) {
                typeArray = gcMarkers[key];

                for (x = 0; x < typeArray.length; x += 1) {
                    typeArray[x].setMap(mainMap);
                }
            }
        }
    } else {
        for (key in gcMarkers) {
            if (gcMarkers.hasOwnProperty(key)) {
                typeArray = gcMarkers[key];

                for (x = 0; x < typeArray.length; x += 1) {
                    markerClusterer.addMarker(typeArray[x]);
                }
            }
        }
    }
}

function toggleTraditionalCaches(checked) {

    var tradCaches = gcMarkers['Traditional Cache'];

    jQuery.each(tradCaches, function () {
        this.setVisible(checked);
    });
}

function adjustHeading() {
    var path = straightPolygon.getPath(),
        heading = google.maps.geometry.spherical.computeHeading(path.getAt(0), path.getAt(1));

    jQuery('#angle').text(heading.toFixed(5) + ' \u00B0');
}

function adjustDistance() {
    var path = straightPolygon.getPath(),
        distance = google.maps.geometry.spherical.computeDistanceBetween(path.getAt(0), path.getAt(1));

    if (distance > 2000) {
        distance = (distance / 1000).toFixed(3) + ' km';
    } else {
        distance = distance.toFixed(2) + ' m';
    }

    jQuery('#distance').text(distance);
}

function updateDistanceLines(marker, origin) {
    var changePosition = origin ? 0 : 1,
        markerPosition = marker.get('position');

    straightPolygon.getPath().setAt(changePosition, markerPosition);
    geodesic.getPath().setAt(changePosition, markerPosition);
}

function adjustOriginInfo(latLng) {
    jQuery('#distanceFrom').val(
        convertLatLngToDecimalMinutes(latLng)
    );
}

function adjustDestinationInfo(latLng) {
    jQuery('#distanceTo').val(
        convertLatLngToDecimalMinutes(latLng)
    );
}

function updateDistanceLineOrigin(marker) {
    updateDistanceLines(marker, true);
    adjustOriginInfo(marker.get('position'));
}
function updateDistanceLineDestination(marker) {
    updateDistanceLines(marker, false);

    adjustHeading();
    adjustDistance();

    adjustDestinationInfo(marker.get('position'));
}

function addOrigin(latLng) {
    var path = straightPolygon.getPath(),
        gPath = geodesic.getPath();

    path.push(latLng);
    gPath.push(latLng);

    bounds.extend(latLng);
}

function addDestination(latLng) {
    addOrigin(latLng);

    mainMap.fitBounds(bounds);
    adjustHeading();
    adjustDistance();
}

function getMarkerForDistanceDisplay(latLng) {
    return new google.maps.Marker({
        map: mainMap,
        position: latLng,
        draggable: true,
        raiseOnDrag: false
    });
}

function displayDistance() {
    infoWindow.close(mainMap);
    bounds = new google.maps.LatLngBounds();

    var distanceFromAddress = jQuery("#distanceFrom").val(),
        distanceToAddress = jQuery("#distanceTo").val(),
        polyOptions,
        geodesicOptions,
        latLngFrom = 0,
        latLngTo = 0,
        geocoderRequestFrom,
        geocoderRequestTo;

    if (!geocoder) {
        geocoder = new google.maps.Geocoder();
    }

    polyOptions = {
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3
    };

    if (!straightPolygon) {
        straightPolygon = new google.maps.Polyline(polyOptions);
        straightPolygon.setMap(mainMap);
    } else {
        straightPolygon.getPath().clear();
    }

    geodesicOptions = {
        strokeColor: '#CC0099',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        geodesic: true,
        title: 'Geodesic'
    };

    if (!geodesic) {
        geodesic = new google.maps.Polyline(geodesicOptions);
        geodesic.setMap(mainMap);
    } else {
        geodesic.getPath().clear();
    }

    geocoderRequestFrom = {
        address: distanceFromAddress
    };

    geocoder.geocode(geocoderRequestFrom, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            latLngFrom = results[0].geometry.location;


            if (markerDistanceOrigin) {
                markerDistanceOrigin.setMap(null);
            }

            markerDistanceOrigin = getMarkerForDistanceDisplay(latLngFrom);

            markerDistanceOrigin.position_changed = function () {
                updateDistanceLineOrigin(this);
            };

            addOrigin(latLngFrom);

            geocoderRequestTo = {
                address: distanceToAddress
            };

            geocoder.geocode(geocoderRequestTo, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    latLngTo = results[0].geometry.location;

                    if (markerDistanceDestination) {
                        markerDistanceDestination.setMap(null);
                    }

                    markerDistanceDestination = getMarkerForDistanceDisplay(latLngTo);

                    markerDistanceDestination.position_changed = function () {
                        updateDistanceLineDestination(markerDistanceDestination);
                    };

                    addDestination(latLngTo);
                }
            });
        }
    });

}

