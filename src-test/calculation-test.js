TestCase('calculation tests', {
    'test calculateLetterValues addition': function () {
        var result = calculateLetterValues('BCD', add);

        assertEquals(9, result); // 2 +3 +4
    },

    'test calculateLetterValues addition': function () {
        var result = calculateLetterValues('BCD', multiply);

        assertEquals(24, result); //  2 * 3 * 4
    }
});