/*global jQuery */

var replacements = [];
replacements.push(['Ä', 'A']);
replacements.push(['Ö', 'O']);
replacements.push(['Ü', 'U']);

var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function replaceChars(string) {
    var x;
    for (x = 0; x < replacements.length; x++) {
        string = string.replace(replacements[x][0], replacements[x][1]);
    }
    return string;
}

function calculateLetterValues(inputText) {

    inputText = inputText.toUpperCase();
    inputText = replaceChars(inputText);
    var sum = 0,
        x,
        charCode;

    for (x = 0; x < inputText.length; x++) {
        charCode = inputText.charCodeAt(x);

        if (charCode >= 65 && charCode <= 90) {
            sum += inputText.charCodeAt(x) - 64;
        }
    }

    return sum;
}

function displayCalculationResults(output) {
    var x, $label, $spanForResultValue;

    for (x = 0; x < output.length; x++) {
        $label = jQuery('#' + output[x].id);
        $spanForResultValue = $label.next();
        $spanForResultValue.text(output[x].value);
    }
}

function calculateLetterValuesAndDisplayResults() {

    var inputText = jQuery('#calcLetterInp').val(),
        sum,
        sumEach = [],
        subtotal,
        letter,
        output = [];


    letter = inputText.substring(0,1);

    for (x = 0; x < inputText.length; x++) {
        letter = inputText.substring(x, x+1);
        subtotal = calculateLetterValues(letter);

        if(subtotal > 0){
            sumEach.push(calculateLetterValues(letter));
        }
    }

    sum = calculateLetterValues(inputText);


    output.push({id: 'sum', value: sum});
    output.push({id: 'singleLetterValue', value: sumEach.join(", ")});
    output.push({id: 'checksum', value: sum.getChecksum()});
    output.push({id: 'oneDigitChecksum', value: sum.getOneDigitChecksum()});


    displayCalculationResults(output);
}

function replaceForHtml(string) {
    var result = '',
        x,
        charAtPosition;

    for (x = 0; x < string.length; x++) {
        charAtPosition = string.charAt(x);

        if (charAtPosition === '\n') {
            charAtPosition = '<br>';
        }

        result += charAtPosition;
    }

    return result;
}

function calculateRot() {
    var rotResult = '',
        rotationInput,
        rotationCount,
        x,
        charAtPosition,
        rot,
        index;

    rotationInput = jQuery('#rotationInput').val();
    rotationCount = parseInt(jQuery('#rotationCount option:selected').text(), 10);

    for (x = 0; x < rotationInput.length; x++) {
        charAtPosition = rotationInput.charAt(x);
        rot = charAtPosition;
        index = alphabet.indexOf(charAtPosition);

        if (index >= 0) {
            rot = alphabet.charAt(index + rotationCount) % alphabet.length;
        } else if ((index = alphabet.indexOf(charAtPosition.toUpperCase())) >= 0) {
            rot = (alphabet.charAt((index + rotationCount) % alphabet.length)).toLowerCase();
        }

        rotResult += rot;
    }

    rotResult = replaceForHtml(rotResult);

    jQuery('#rotationResult').html(rotResult);

}

Number.prototype.getChecksum = function () {
    var numberString = this.toString(),
        checksum = 0,
        x;

    for (x = 0; x < numberString.length; x++) {
        checksum += Number(numberString.charAt(x));
    }
    return checksum;
};

Number.prototype.getOneDigitChecksum = function () {
    var checksum = this.getChecksum();

    while (checksum.toString().length > 1) {
        checksum = checksum.getChecksum();
    }
    return checksum;
};