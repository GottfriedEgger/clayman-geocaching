/*global jQuery, google, convertGoogleLatLngToDecimalMinutes, MarkerClusterer */

var map;
var autocomplete;
var gcMarkers = {};
var geocoder = 0;
var markerClusterer = 0;
var straightPolygon;
var geodesic;
var bounds = 0;

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

(function () {
    var elevationService = 0;

    function addSimpleMapType(){
        var mapStyle = [];

        mapStyle.push(roadMapStyleOff);
        mapStyle.push(landscapeMapStyleOff);
        mapStyle.push(administrativeMapStyleOff);
        mapStyle.push(countryMapStyleOn);
        mapStyle.push(poiMapStyleOff);
        mapStyle.push(waterLabelMapStyleOff);

        var simpleStyledMap = new google.maps.StyledMapType(mapStyle,
            {name: "Simple Map"});

        map.mapTypes.set('simple_map_style', simpleStyledMap);

    }

    function getElevationInMeters(elevationResponse, responseStatus) {
        if (responseStatus === google.maps.ElevationStatus.OK) {
            if (elevationResponse[0]) {
                return elevationResponse[0].elevation.toFixed(0);
            } else {
                alert("No results found");
            }
        } else {
            alert("Elevation service failed due to: " + responseStatus);
        }
    }

    function placeChangedListener(){
        var place = autocomplete.getPlace(),
            latLng = place.geometry.location;

        infoWindow.close(map);

        map.setCenter(place.geometry.location);
        map.setZoom(14);

        var content = '<div class="locationInfoWindow" >';
        content += place.formatted_address + '<br />';
        content += 'Position: ' + convertGoogleLatLngToDecimalMinutes(latLng) + '<br>';
        content += '</div>';

        infoWindow.setPosition(latLng);
        infoWindow.setContent(content);
        infoWindow.open(map);
    }

    function showLocationInfoPopup(latLng) {
        var locations = [],
            positionalRequest;

        infoWindow.close(map);

        if (!elevationService) {
            elevationService = new google.maps.ElevationService();
        }

        locations.push(latLng);

        positionalRequest = {
            'locations': locations
        };

        elevationService.getElevationForLocations(positionalRequest, function (elevationResponse, responseStatus) {
            infoWindow.setPosition(latLng);

            var content = '<div id="locationInfoWindow" class="locationInfoWindow">'+
                '<dl class="dlLocationInfoWindow">' +
                '<dt><label>' + jQuery.i18n.prop('map.position') + ':</label></dt>' +
                '<dd>' + convertGoogleLatLngToDecimalMinutes(latLng) + '</dd>' +
                '<dt><dt><dd><span>' + latLng.lat().toFixed(6) + ' ' + latLng.lng().toFixed(6) + '</span></dd>'+
                '<dt><label>' + jQuery.i18n.prop('map.elevation') + ':</label></dt>' +
                '<dd>' + getElevationInMeters(elevationResponse, responseStatus) + ' ' + jQuery.i18n.prop('map.elevation.unit') + '</dd>'+
                '</dl>' +
                '</div>';

            infoWindow.setContent(content);
            infoWindow.open(map);
        });
    }

    window.onload = function () {
        var mapDiv = document.getElementById('map'),
            latLng = new google.maps.LatLng(46.8, 7.985),
            options,
            inputAddress;

        options = {
            center: latLng,
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, 'simple_map_style']
            },
            navigationControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            scaleControl: true,
            scaleControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM
            }
        };
        map = new google.maps.Map(mapDiv, options);

        infoWindow.setPosition(latLng);
        infoWindow.setContent(jQuery.i18n.prop('map.start_info_window_text'));
        infoWindow.open(map);

        google.maps.event.addListener(map, 'click', function (e) {
            showLocationInfoPopup(e.latLng);
        });

        addSimpleMapType();

        markerClusterer = new MarkerClusterer(map);

        inputAddress = document.getElementById('addressSearchTxt');
        autocomplete = new google.maps.places.Autocomplete(inputAddress);
        autocomplete.bindTo('bounds', map);

        google.maps.event.addListener(autocomplete, 'place_changed', placeChangedListener);
    };

})();

function setMarkersVisibility(visible) {
    var key, typeArray, x;

    for (key in gcMarkers) {
        if (gcMarkers.hasOwnProperty()) {
            typeArray = gcMarkers[key];

            for (x = 0; x < typeArray.length; x++) {
                typeArray[x].setVisible(visible);
            }
        }
    }
}

function clearMap() {
    if (infoWindow) {
        infoWindow.close(map);
    }
    
    if(straightPolygon){
        straightPolygon.getPath().clear();
    }
    if(geodesic){
        geodesic.getPath().clear();
    }

    setMarkersVisibility(false);

    gcMarkers = {};

    markerClusterer.clearMarkers();
}

function readFile() {
    var file, reader;

    gcMarkers = {};
    clearMap();

    var files = document.getElementById('files').files;

    if (!checkFileReadPreconditions(files)) {
        return;
    }

    file = files[0];
    reader = new FileReader();

    reader.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            var xmlContentGpx = evt.target.result,
                waypoints = [];

            var xmlDoc = jQuery.parseXML( xmlContentGpx ),
            $xml = jQuery( xmlDoc );

            $wpt = $xml.find('wpt').each(function () {
                var foundType, logDate, logText;

                jQuery(this).find("groundspeak\\:logs, logs").each(function(){
                   foundType = jQuery(this).find("groundspeak\\:type, type").text();
                   logDate = jQuery(this).find("groundspeak\\:date, date").text();
                   logDate = logDate.substring(0, logDate.indexOf('T'));
                   logText = jQuery(this).find("groundspeak\\:text, text").text();
                });

                if(foundType && foundType === 'Found it'){
                    var lat = jQuery(this).attr('lat');
                    var lon = jQuery(this).attr('lon');
                    var name = jQuery(this).find('name').text();
                    var urlName = jQuery(this).find('urlname').text();
                    var url = jQuery(this).find('url').text();
                    var type = jQuery(this).find('type').text().split("|")[1];

                    var waypoint = {lat:lat, lon: lon, name: name, urlName: urlName, url: url, type: type,
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

    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert(jQuery.i18n.prop('map.alert.missing_file_api'));
        return false;
    }

    if (!files.length) {
        alert(jQuery.i18n.prop('map.alert.select_file'));
        return false;
    }


    if (!files[0].name.match('.*gpx')) {
        alert(jQuery.i18n.prop('map.alert.select_gpx'));
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

    for (x = 0; x < waypoints.length; x++) {
        var waypoint = waypoints[x];
        var latLng = new google.maps.LatLng(waypoint.lat, waypoint.lon);
        bounds.extend(latLng);

        var gcMarker = new google.maps.Marker({
            position: latLng,
            map: map,
            icon: 'images/smiley_16x16.png'
        });

        if (!gcMarkers[waypoint.type]) {
            gcMarkers[waypoint.type] = new Array();
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
                    latLng:gcMarker.position
                };

                geocoder.geocode(geocoderRequest, function (geocoderRequestResult, status) {

                    var gcLink = '<a href="' + waypoint.url + '" target="_blank">' + waypoint.urlName + '</a>';

                    var content = '<div class="cacheInfoWindow">' +
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
                               '<td>' + waypoint.logDate +'</td>' +
                               '</tr>';

                    content += '<tr>' +
                               '<td>' + jQuery.i18n.prop('map.wpt.log_text') + '</td>' +
                               '<td>' + waypoint.logText.substring(0, 20) +'...</td>' +
                               '</tr>';

                    content += '</tr>' +
                                '</table>'+
                                '</div>';

                    infoWindow.setContent(content);
                    infoWindow.open(map, gcMarker);
                });
            });

        })(gcMarker, waypoint);
    }

    map.fitBounds(bounds);

}

function getDisplayAddress(geocoderRequestResult) {
    var displayAddress = [],
        highLevelAddressComponents = 0,
        x,
        y,
        types,
        type,
        partsOfLocation = [],
        addressComponent;

    for (x = 0; x < geocoderRequestResult.length; x++) {
        types = geocoderRequestResult[x].types;

        if (!types.contains('bus_station')) {
            highLevelAddressComponents = geocoderRequestResult[x].address_components;
            break;
        }
    }

    for (x = 0; x < highLevelAddressComponents.length; x++) {
        addressComponent = highLevelAddressComponents[x];
        types = addressComponent.types;

        for (y = 0; y < types.length; y++) {
            type = types[y];

            if (type === 'country' || type === 'administrative_area_level_1' || type === 'locality' || type === 'administrative_area_level_2' || type === 'locality' || type === 'postal_town') {
                partsOfLocation[type] = addressComponent.short_name;
            }
        }
    }

    var partOfLocation;
    if (partOfLocation = partsOfLocation['locality']) {
        displayAddress.push(partOfLocation);
    }

    if (partOfLocation = partsOfLocation['administrative_area_level_1']) {
        displayAddress.push(partOfLocation);
    } else if (partOfLocation = partsOfLocation['administrative_area_level_2']) {
        displayAddress.push(partOfLocation);
    } else if (partOfLocation = partsOfLocation['postal_town']) {
        displayAddress.push(partOfLocation);
    }

    displayAddress.push(partsOfLocation['country']);

    return displayAddress.join(", ");
}

function searchLocationAndDisplay(){
	var address = jQuery("#addressSearchTxt").val();
	infoWindow.close(map);
 	
	if(!geocoder){
		geocoder = new google.maps.Geocoder();
	}
					
	var geocoderRequest = {
		address: address
	};
	
	geocoder.geocode(geocoderRequest, function(results, status){
		if (status === google.maps.GeocoderStatus.OK){
		
			var latLng = results[0].geometry.location;
			map.setCenter(latLng);
			map.setZoom(14);
			
			var formattedAddress = results[0].formatted_address;
			
			var content = '<div class="locationInfoWindow" >';
			content += formattedAddress + '<br />';
			content += 'Position: ' + convertGoogleLatLngToDecimalMinutes(latLng) + '<br>';
			content += '</div>';

            infoWindow.setPosition(latLng);
            infoWindow.setContent(content);
            infoWindow.open(map);
        }

    });
}

function toggleClusterer() {

    var x, key, typeArray;

    if (markerClusterer.getMarkers().length > 0) {
        markerClusterer.clearMarkers();

        for (key in gcMarkers) {
            typeArray = gcMarkers[key];

            for (x = 0; x < typeArray.length; x++) {
                typeArray[x].setMap(map);
            }
        }
    } else {
        for (key in gcMarkers) {
            typeArray = gcMarkers[key];

            for (x = 0; x < typeArray.length; x++) {
                markerClusterer.addMarker(typeArray[x]);
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

function displayDistance() {
	infoWindow.close(map);
	bounds = new google.maps.LatLngBounds();
	
	$distanceTo = jQuery("#distanceTo");
	
	var distanceFromAddress = jQuery("#distanceFrom").val(),
		distanceToAddress = jQuery("#distanceTo").val(),
		latLngFrom = 0,
		latLngTo = 0,
        geocoderRequest;
	
	if(!geocoder){
		geocoder = new google.maps.Geocoder();
	}

	var polyOptions = {
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 3
	};
  
	if(!straightPolygon){
		straightPolygon = new google.maps.Polyline(polyOptions);
		straightPolygon.setMap(map);
	}else{
		straightPolygon.getPath().clear();
	}
  
	var geodesicOptions = {
			strokeColor: '#CC0099',
			strokeOpacity: 1.0,
			strokeWeight: 3,
			geodesic: true
	};
  
	if(!geodesic){
		geodesic = new google.maps.Polyline(geodesicOptions);
		geodesic.setMap(map);
	}else{
		geodesic.getPath().clear();
	}
  
	geocoderRequest = {
			address: distanceFromAddress
	};
	
	geocoder.geocode(geocoderRequest, function(results, status){
		if (status === google.maps.GeocoderStatus.OK){
			latLngFrom = results[0].geometry.location;
			addOrigin(latLngFrom);
		}
	});
	
	geocoderRequest = {
		address: distanceToAddress
	};
	
	geocoder.geocode(geocoderRequest, function(results, status){
		if (status === google.maps.GeocoderStatus.OK){
			latLngTo = results[0].geometry.location;
			addDestination(latLngTo);
		}
	});
}

function addOrigin(latLng) {
	var path = straightPolygon.getPath();
	path.push(latLng);
	var gPath = geodesic.getPath();
	gPath.push(latLng);
	bounds.extend(latLng);
}

function addDestination(latLng) {
	addOrigin(latLng);
	
	map.fitBounds(bounds);
	adjustHeading();
	adjustDistance();
}
  
function adjustHeading() {
	var path = straightPolygon.getPath();
	var heading = google.maps.geometry.spherical.computeHeading(path.getAt(0), path.getAt(1));
  
	jQuery('#angle').val(heading.toFixed(5) + ' \u00B0');
}

function adjustDistance(){
	var path = straightPolygon.getPath();
	
	var distance = google.maps.geometry.spherical.computeDistanceBetween(path.getAt(0), path.getAt(1));
	
	if(distance > 2000){
		distance = (distance / 1000).toFixed(3) + ' km';
	}else{
		distance = distance.toFixed(2) + ' m';
	}
	
	jQuery('#distance').val(distance);
}