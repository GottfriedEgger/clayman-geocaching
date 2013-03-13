/*global jQuery, CHtoWGSlat, CHtoWGSlng */

var ch1903Pattern = /^\d{6}\s*\/\s*\d{6}$/;
var wgs84DecimalPattern = /^[\-]?\d{1,2}([.]\d+)?\s+[\-]?\d{1,3}([.]\d+)?$/;
var wgs84DecimalMinutesPattern = /^[nNsS]\s*\d{1,2}\s*°\s*\d{1,2}([.]\d{3,})?\s+[eEwW]\s*\d{1,3}°\s*\d{1,2}([.]\d{3,})?$/;

var coordinatesPatterns = [];
coordinatesPatterns.push(ch1903Pattern);
coordinatesPatterns.push(wgs84DecimalPattern);
coordinatesPatterns.push(wgs84DecimalMinutesPattern);

var converterStrategies;

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

function convertDecimalMinutesPartToDecimal(input) {

    var absoluteDecimalAngle,
        decimalMinutes,
        decimalPlaces,
        positiveDirections = 'nNeE',
        firstChar;

    firstChar = input.substring(0,1);

    if (positiveDirections.indexOf(firstChar) >= 0) {
        input = input.substr(1);
    } else {
        input = '-' + input.substr(1);
    }

    absoluteDecimalAngle = parseFloat(input.substring(0, input.indexOf('°')).trim());
    decimalMinutes = input.substring(input.indexOf('°') + 1).trim();
    decimalPlaces = ((decimalMinutes / 60).toFixed(6)).substring(2);

    return (absoluteDecimalAngle + '.' + decimalPlaces);
}

function convertInputWGSDecimalMinutesToDecimal(input) {
    var lat, lng,
        pattern,
        matchResult;

    pattern = /[eEwW]/;
    matchResult = pattern.exec(input);

    lat = input.substring(0, matchResult.index - 1);
    lng = input.substring(matchResult.index);

    return convertDecimalMinutesPartToDecimal(lat) + ' ' + convertDecimalMinutesPartToDecimal(lng);

}

function convertInputCHtoWGSDecimal(input) {
    var splittedCoord,
        coordX, coordY,
        lat, lng;

    splittedCoord = input.split(" / ");
    coordX = splittedCoord[0];
    coordY = splittedCoord[1];

    lat = CHtoWGSlat(coordX, coordY).toFixed(6);
    lng = CHtoWGSlng(coordX, coordY).toFixed(6);

    return lat + ' ' + lng;
}

function convertInputWGSDegreeDecimalToDegreeDecimalMinutes(input) {
    var splittedCoord,
        lat, lng;

    splittedCoord = input.split(" ");
    lat = splittedCoord[0];
    lng = splittedCoord[1];

    return convertDecimalAngleToDecimalMinutes(lat, true) + ' ' + convertDecimalAngleToDecimalMinutes(lng, false);
}

function convertInputWGSDegreeDecimalToCH(input) {
    var splittedCoord,
        lat, lng,
        chX, chY;

    splittedCoord = input.split(" ");
    lat = splittedCoord[0];
    lng = splittedCoord[1];

    //the x and y are somehow exchanged

    chY = WGStoCHx(lat, lng).toFixed(0);
    chX = WGStoCHy(lat, lng).toFixed(0);

    return chX + " / " + chY;
}

function CHtoWGS() {
    var coordCH = jQuery('#coordCH').val(),
        splittedCoord,
        wgsDegreeDecimal,
        lat, lng,
        convertedCoordinatesWGSSection,
        conversionResultWGSHtml;

    if (coordCH === '') {
        return;
    }

    wgsDegreeDecimal = convertInputCHtoWGSDecimal(coordCH);

    splittedCoord = wgsDegreeDecimal.split(' ');
    lat = splittedCoord[0];
    lng = splittedCoord[1];

    convertedCoordinatesWGSSection = jQuery('#convertedCoordinatesWGS');
    conversionResultWGSHtml =
        '<b>' + convertDecimalAngleToDecimalMinutes(lat, true) + ' ' + convertDecimalAngleToDecimalMinutes(lng, false) + '</b><br>' +
            lat + ' ' + lng + '<br>' +
            convertDecimalAngleToAngleMinutesSeconds(lat, true) + ' ' + convertDecimalAngleToAngleMinutesSeconds(lng, false);

    convertedCoordinatesWGSSection.html(conversionResultWGSHtml);
}

function convertWGStoCH(latLng) {
    var lat = latLng.lat(),
        lng = latLng.lng();

    return convertInputWGSDegreeDecimalToCH(lat + ' ' + lng);
}

function convertLatLngToDecimalMinutes(latLng) {
    var lat = latLng.lat(),
        lng = latLng.lng(),
        latConverted = convertDecimalAngleToDecimalMinutes(lat, true),
        lngConverted = convertDecimalAngleToDecimalMinutes(lng, false);

    return latConverted + ' ' + lngConverted;
}

var ConverterStrategy = function (parameters) {
    this.convert = parameters.convertFunction;
    this.convertBack = parameters.backConvertFunction;
    this.coordinatesPattern = parameters.coordinatesPattern;
};

function getConverterStrategies() {
    var CHtoWGSConverterStrategy,
        WGStoCHConverterStrategy,
        WGSDecimalMinutestoDecimalConverterStrategy;

    if (!converterStrategies) {
        converterStrategies = [];

        CHtoWGSConverterStrategy = new ConverterStrategy({
            convertFunction: convertInputCHtoWGSDecimal,
            backConvertFunction: convertInputWGSDegreeDecimalToCH,
            coordinatesPattern: ch1903Pattern
        });
        WGStoCHConverterStrategy = new ConverterStrategy({
            convertFunction: convertWGStoCH,
            coordinatesPattern: wgs84DecimalPattern
        });
        WGSDecimalMinutestoDecimalConverterStrategy = new ConverterStrategy({
            convertFunction: convertInputWGSDecimalMinutesToDecimal,
            backConvertFunction: convertInputWGSDegreeDecimalToDegreeDecimalMinutes,
            coordinatesPattern: wgs84DecimalMinutesPattern
        });

        converterStrategies.push(WGStoCHConverterStrategy);
        converterStrategies.push(CHtoWGSConverterStrategy);
        converterStrategies.push(WGSDecimalMinutestoDecimalConverterStrategy);
    }

    return converterStrategies;

}

function getMatchingPattern(input) {
    var patternMatched,
        converterStrategy,
        i;

    for (i = 0; i < getConverterStrategies().length; i += 1) {

        converterStrategy = getConverterStrategies()[i];
        patternMatched = !!input.match(converterStrategy.coordinatesPattern);

        if (patternMatched) {
            return converterStrategy.coordinatesPattern;
        }
    }
}

function getConvertedCoordinates(input) {
    var matchingPattern,
        convertedCoordinates = [],
        converterStrategy,
        rootConverterStrategy,
        targetConverterStrategies = [],
        targetConverterStrategy,
        conversionResult,
        isAlreadyBasePattern,
        i;

    matchingPattern = getMatchingPattern(input);

    for (i = 0; i < getConverterStrategies().length; i += 1) {
        converterStrategy = getConverterStrategies()[i];

        if (matchingPattern === converterStrategy.coordinatesPattern) {

            rootConverterStrategy = converterStrategy;

//            conversionResult = converterStrategy.convert(input);
//            convertedCoordinates.push(conversionResult);

//            convertedCoordinates.push(convertInputWGSDegreeDecimalToDegreeDecimalMinutes(conversionResult));
        } else {
            targetConverterStrategies.push(converterStrategy);
        }
    }

    isAlreadyBasePattern = rootConverterStrategy.coordinatesPattern === wgs84DecimalPattern;

    if (isAlreadyBasePattern) {
        convertedCoordinates = input;
    } else {
        conversionResult = rootConverterStrategy.convert(input);
        convertedCoordinates.push(conversionResult);
    }
    console.log('base pattern ' + isAlreadyBasePattern);
    console.log('conversionResult ' + conversionResult);
    console.log('root converter ' + rootConverterStrategy.coordinatesPattern);


    for (i = 0; i < targetConverterStrategies.length; i += 1) {
        targetConverterStrategy = targetConverterStrategies[i];

        if (rootConverterStrategy !== targetConverterStrategy && wgs84DecimalPattern !== targetConverterStrategy.coordinatesPattern) {
            console.log("strat pattern " + targetConverterStrategy.coordinatesPattern);
            console.log("strat back function " + targetConverterStrategy.convertBack);
            convertedCoordinates.push(targetConverterStrategy.convertBack(conversionResult));
        }
    }

    return convertedCoordinates;
}

