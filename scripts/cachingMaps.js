/*global jQuery, google */

var map;
var autocomplete;
var placesService;
var gcMarkers = {};
var geocoder = 0;
var markerClusterer = 0;

var startInfoWindow = new google.maps.InfoWindow();
var infoWindow = new google.maps.InfoWindow();

(function () {
    var elevationService = 0;

    function showLocationInfoPopup(latLng) {
        var locations = [],
            positionalRequest;

        startInfoWindow.close(map);
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

            var content = '<div class="locationInfoWindow">';
            content += 'Position: ' + convertGoogleLatLngToDecimalMinutes(latLng) + '<br>';
            content += jQuery.i18n.prop('map.elevation') + ': ' + getElevationInMeters(elevationResponse, responseStatus) + ' ' +
                jQuery.i18n.prop('map.elevation.unit') + '<br>';
            content += '</div>';

            infoWindow.setContent(content);
            infoWindow.open(map);

        });
    }

    window.onload = function () {
        var mapDiv = document.getElementById('map'),
            latLng = new google.maps.LatLng(46.8, 7.985),
            options;

        options = {
            center: latLng,
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.TERRAIN,
            navigationControlOptions: {
            	position: google.maps.ControlPosition.TOP_RIGHT
            }
        };

        map = new google.maps.Map(mapDiv, options);

        startInfoWindow.setPosition(latLng);
        startInfoWindow.setContent(jQuery.i18n.prop('map.start_info_window_text'));
        startInfoWindow.open(map);

        google.maps.event.addListener(map, 'click', function (e) {
            showLocationInfoPopup(e.latLng);
        });

        markerClusterer = new MarkerClusterer(map);
        
        var input = document.getElementById('addressSearchTxt');
        autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);
        
        google.maps.event.addListener(autocomplete, 'place_changed', placeChangedListener);
    };

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
    if (startInfoWindow) {
        startInfoWindow.close(map);
    }
    if (infoWindow) {
        infoWindow.close(map);
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

            var xmlDoc = jQuery.parseXML(xmlContentGpx);
            $xml = jQuery(xmlDoc);
            
            $wpt = $xml.find('wpt').each(function () {
                var lat = jQuery(this).attr('lat');
                var lon = jQuery(this).attr('lon');
                var name = jQuery(this).find('name').text();
                var urlName = jQuery(this).find('urlname').text();
                var url = jQuery(this).find('url').text();
                var type = jQuery(this).find('type').text().split("|")[1];

                var waypoint = {lat:lat, lon: lon, name: name, urlName: urlName, url: url, type: type};
                waypoints.push(waypoint);
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
    var $selected = jQuery("#useClustering:checked").val();

    if (!$selected) {
        return false;
    }
    return true;
}

function displayWaypoints(waypoints) {
    var bounds = new google.maps.LatLngBounds(),
        clusteringActivated = isClusteringActivated(),
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

                    var content = '<div class="waypointInfoWindow">';
                    content += '<table>';
                    content += '<tr>';
                    content += '<td>' + gcLink + '</td>';
                    content += '<td>' + waypoint.name + '</td>';
                    content += '</tr><tr>';
                    content += '</tr><tr>';

                    if (status === google.maps.GeocoderStatus.OK) {
                        content += '<td>' + jQuery.i18n.prop('map.wpt.location') + '</td>';
                        content += '<td>' + getDisplayAddress(geocoderRequestResult) + '</td>';
                    } else {
                        content += '<p>No address could be found. Status = ' + status + '</p>';
                    }
                    content += '</tr>';
                    content += '</table>';

                    content += '</div>';

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

    var partOfLocation = 0;
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

function placeChangedListener(){
	var place = autocomplete.getPlace(),
    	latLng = place.geometry.location;
    
	infoWindow.close(map);
	startInfoWindow.close(map);
    
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

    if (markerClusterer.getMarkers().length > 0) {
        markerClusterer.clearMarkers();

        for (var key in gcMarkers) {
            var typeArray = gcMarkers[key];

            for (var x = 0; x < typeArray.length; x++) {
                typeArray[x].setMap(map);
            }
        }
    } else {
        for (var key in gcMarkers) {
            var typeArray = gcMarkers[key];

            for (var x = 0; x < typeArray.length; x++) {
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


var poly;
var geodesic;
var map;
var clickcount = 0;

function displayDistance() {
	
	$distanceTo = jQuery("#distanceTo");
	
	var distanceFromAddress = jQuery("#distanceFrom").val(),
		distanceToAddress = jQuery("#distanceTo").val(),
		latLngFrom = 0,
		latLngTo = 0;
	
	infoWindow.close(map);
 	
	if(!geocoder){
		geocoder = new google.maps.Geocoder();
	}
					
	var geocoderRequest = {
		address: distanceFromAddress
	};
	
	geocoder.geocode(geocoderRequest, function(results, status){
		if (status === google.maps.GeocoderStatus.OK){
			latLngFrom = results[0].geometry.location;
			addOrigin(latLngFrom);
		}
	});
	
	var geocoderRequest = {
		address: distanceToAddress
	};
	
	geocoder.geocode(geocoderRequest, function(results, status){
		if (status === google.maps.GeocoderStatus.OK){
			latLngTo = results[0].geometry.location;
			addDestination(latLngTo);
		}
	});

  var polyOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 3
  };
  
  poly = new google.maps.Polyline(polyOptions);
  poly.setMap(map);
  
  var geodesicOptions = {
    strokeColor: '#CC0099',
    strokeOpacity: 1.0,
    strokeWeight: 3,
    geodesic: true
  };
  
  geodesic = new google.maps.Polyline(geodesicOptions);
  geodesic.setMap(map);
}

function addOrigin(latLng) {
  clearPaths();
  var path = poly.getPath();
  path.push(latLng);
  var gPath = geodesic.getPath();
  gPath.push(latLng);
}

function addDestination(latLng) {
  var path = poly.getPath();
  path.push(latLng);
  var gPath = geodesic.getPath();
  gPath.push(latLng);
  adjustHeading();
  clickcount = 0;
}
  
function clearPaths() {
  var path = poly.getPath();
  while (path.getLength()) {
    path.pop();
  }
  var gPath = geodesic.getPath();
  while (gPath.getLength()) {
    gPath.pop();
  }
}

function adjustHeading() {
  var path = poly.getPath();
  var pathSize = path.getLength();
  var heading = google.maps.geometry.spherical.computeHeading(path.getAt(0), path.getAt(pathSize - 1));
  document.getElementById('heading').value = heading;
  document.getElementById('origin').value = path.getAt(0).lat()
      + "," + path.getAt(0).lng();
  document.getElementById('destination').value = path.getAt(pathSize - 1).lat()
      + "," + path.getAt(pathSize - 1).lng();
}




