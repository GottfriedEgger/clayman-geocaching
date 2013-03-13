function isPatternMatching(input, pattern) {

    var matchResults = input.match(pattern);

    return matchResults !== null;
}

TestCase('coordinates tests', {
    'test ch1903 regex': function () {
       assertTrue(isPatternMatching('600000 / 200000', ch1903Pattern));
       assertTrue(isPatternMatching('600000/200000', ch1903Pattern));

       assertFalse(isPatternMatching('600000', ch1903Pattern));
       assertFalse(isPatternMatching(' 600000 / 200000 ', ch1903Pattern));
    },

    'test wgs degree deecimal regex': function(){
        assertTrue(isPatternMatching('-47.006480 8.470459', wgs84DecimalPattern));
        assertTrue(isPatternMatching('-47.55555555555 8.666666666', wgs84DecimalPattern));
        assertTrue(isPatternMatching('47 -8', wgs84DecimalPattern));

        assertFalse(isPatternMatching('100.00 -7.00', wgs84DecimalPattern));
    },

    'test wgs degree decimal minutes regex': function(){
        assertTrue(isPatternMatching('N 46° 56.234 e 7° 23.500', wgs84DecimalMinutesPattern));
        assertTrue(isPatternMatching('N46° 56.234 e7° 23.500', wgs84DecimalMinutesPattern));

        assertFalse(isPatternMatching('abc N46° 56.234 e7° 23.500', wgs84DecimalMinutesPattern));
        assertFalse(isPatternMatching('N46° 56.234 e7° 23.500 abc', wgs84DecimalMinutesPattern));
        assertFalse(isPatternMatching('e 46° 56.000 w 7° 23.000', wgs84DecimalMinutesPattern));
        assertFalse(isPatternMatching('n 100° 56.000 e 7° 23.000', wgs84DecimalMinutesPattern));
    },

    'test match pattern': function(){
        assertEquals(ch1903Pattern, getMatchingPattern('600000 / 200000'));
        assertEquals(wgs84DecimalPattern, getMatchingPattern('20.456789 70.123'));
        assertEquals(wgs84DecimalMinutesPattern, getMatchingPattern('N 50° 40.234 E 8° 23.500'));
    },

    'test get converted coordinates for WGS': function(){
        var convertedCoordinates = getConvertedCoordinates('600000 / 200000');

        assertTrue(convertedCoordinates.indexOf('46.951081 7.438637') >= 0);
        assertTrue(convertedCoordinates.indexOf('N46° 57.065 E7° 26.318') >= 0);

        assertFalse(convertedCoordinates.indexOf('600000 / 200000') >= 0);


//        var convertedCoordinates = getConvertedCoordinates('600000/200000');
//
//        assertTrue(convertedCoordinates.indexOf('46.951081 7.438637') >= 0);

    },

    'test get converted coordinates for decimal minutes': function(){
        var convertedCoordinates = getConvertedCoordinates('N46° 57.065 E7° 26.318');

        assertTrue(convertedCoordinates.indexOf('46.951083 7.438633') >= 0);
        assertTrue(convertedCoordinates.indexOf('600000 / 200000') >= 0);

        assertFalse(convertedCoordinates.indexOf('N46° 57.065 E7° 26.318') >= 0);
    },

    'test get converted coordinates for decimal': function(){
        var convertedCoordinates = getConvertedCoordinates('46.951083 7.438633');

        assertTrue(convertedCoordinates.indexOf('N46° 57.065 E7° 26.318') >= 0);
        assertTrue(convertedCoordinates.indexOf('600000 / 200000') >= 0);

        assertFalse(convertedCoordinates.indexOf('46.951083 7.438633') >= 0);
    },

    'test convert wrong input': function(){
        var convertedCoordinates = getConvertedCoordinates('abc');
        assertTrue(convertedCoordinates.length === 0);
    },

    'test convert ch to wgs': function(){
        var convertedCoordinate = convertInputCHtoWGSDecimal('600000 / 200000');
        assertEquals('46.951081 7.438637',convertedCoordinate);

        convertedCoordinate = convertInputCHtoWGSDecimal('600000/200000');
        assertEquals('46.951081 7.438637',convertedCoordinate);
    },

    'test convert wgs degree decimal to degree decimal minutes': function(){
        var convertedCoordinate = convertInputWGSDegreeDecimalToDegreeDecimalMinutes('46.951081 7.438637');

        assertEquals('N46° 57.065 E7° 26.318',convertedCoordinate);
    }
});

