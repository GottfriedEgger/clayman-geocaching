// ==UserScript==
// @name           GeocachingToGoogleMapsExport
// @namespace      clayman.ch
// @include        http://www.geocaching.com/*
// ==/UserScript==

var latLonSpan=document.getElementById('uxLatLon');
var latLonLink=document.getElementById('uxLatLonLink');

var latLonTextNode = latLonSpan.firstChild;
var latLonOrig = latLonTextNode.data;

var latLonEscaped = latLonOrig.replace(/\s/g, '+')
latLonEscaped = latLonEscaped .replace('°','%C2%B0');
latLonEscaped = latLonEscaped .replace('°','%C2%B0');

var googleMapUrl = 'http://maps.google.ch/maps?q='+latLonEscaped ;

if(latLonLink){
	var googleMapLink = document.createElement('a');
	googleMapLink.href=googleMapUrl;
	googleMapLink.target='_blank';
		
	var mapImage = document.createElement('img');
	mapImage.src='http://cdn1.iconfinder.com/data/icons/fatcow/32x32/google_map.png';
	googleMapLink.appendChild(mapImage);

	latLonLink.parentNode.insertBefore(googleMapLink,latLonLink);

}


