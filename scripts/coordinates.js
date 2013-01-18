/*global jQuery, CHtoWGSlat, CHtoWGSlng */

function getDirection(decimalAngle, lat) {
    var direction;
    if (lat) {
        if (decimalAngle > 0) {
            direction = 'N';
        } else {
            direction = 'S';
        }
    } else {
        if (decimalAngle > 0) {
            direction = 'E';
        } else {
            direction = 'W';
        }
    }
    return direction;
}

// i.e. N46° 56.892 E7° 23.214
function convertDecimalAngleToDecimalMinutes(decimalAngle, lat) {
    decimalAngle = parseFloat(decimalAngle);

    var direction = getDirection(decimalAngle, lat),
        absoluteDecimalAngle = Math.abs(decimalAngle),
        angle = Math.floor(absoluteDecimalAngle),
        decimalPlaces = absoluteDecimalAngle - angle,
        minutesDecimal = decimalPlaces * 60,
        minutes = Math.floor(minutesDecimal),
        decimal = parseFloat((minutesDecimal - minutes));

    return direction + angle + '° ' + (minutes + decimal).toFixed(3);
}

// i.e. N46° 56' 53.52" E7° 23' 12.84"
function convertDecimalAngleToAngleMinutesSeconds(decimalAngle, lat) {
    decimalAngle = parseFloat(decimalAngle);

    var direction = getDirection(decimalAngle, lat),
        angle = Math.floor(decimalAngle),
        decimalPlaces = decimalAngle - angle,
        minutesDecimal = decimalPlaces * 60,
        minutes = Math.floor(minutesDecimal),
        seconds = (parseFloat(minutesDecimal - minutes) * 60).toFixed(3);

    return direction + angle + '° ' + minutes + '\' ' + seconds + '\'\'';
}

function CHtoWGS() {
    var coordCH = jQuery('#coordCH').val(),
        splittedCoord = coordCH.split(" / "),
        coordX = splittedCoord[0],
        coordY = splittedCoord[1],
        lat,
        lng;

    lat = CHtoWGSlat(coordX, coordY).toFixed(6);
    lng = CHtoWGSlng(coordX, coordY).toFixed(6);

    jQuery('#coordDecimalAngle').val(lat + ' ' + lng);

    jQuery('#coordDecimalMinutes').val(
        convertDecimalAngleToDecimalMinutes(lat, true) + ' ' + convertDecimalAngleToDecimalMinutes(lng, false)
    );

    jQuery('#coordAngleMinutesSeconds').val(
        convertDecimalAngleToAngleMinutesSeconds(lat, true) + ' ' + convertDecimalAngleToAngleMinutesSeconds(lng, false)
    );
}

function convertGoogleLatLngToDecimalMinutes(latLng) {
    var lat = latLng.lat(),
        lng = latLng.lng(),
        latConverted = convertDecimalAngleToDecimalMinutes(lat, true),
        lngConverted = convertDecimalAngleToDecimalMinutes(lng, false);

    return latConverted + ' ' + lngConverted;
}

