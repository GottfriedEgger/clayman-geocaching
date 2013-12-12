/*global jQuery */

var replacements = [];
replacements.push(['Ä', 'A']);
replacements.push(['Ö', 'O']);
replacements.push(['Ü', 'U']);

var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function replaceChars(string) {
    var x;
    for (x = 0; x < replacements.length; x+=1) {
        string = string.replace(replacements[x][0], replacements[x][1]);
    }
    return string;
}

function add(number1, number2){
    return number1 + number2;
}

function multiply(number1, number2){
    return number1 * number2;
}

function isUpperCaseChar(charCode) {
    return charCode >= 65 && charCode <= 90;
}

function isDigit(charCode){
    return charCode >= 48 && charCode <= 57;
}

function isUpperCaseCharOrDigit(charCode) {
    return isUpperCaseChar(charCode) || isDigit(charCode);
}

function getCharValue(charCode) {
    var charValue;

    if (isUpperCaseChar(charCode)) {
        charValue = charCode - 64;
    } else {
        charValue = charCode - 48;
    }

    return charValue;
}

function calculateWithPreviousResult(operationResult, value, operand) {
    if (operationResult === null) {
        operationResult = value;
    } else {
        operationResult = operand(operationResult, value);
    }
    return operationResult;
}

function calculateLetterValues(inputText, operand) {

    var operationResult = null,
        x,
        charCode,
        value;

    inputText = inputText.toUpperCase();
    inputText = replaceChars(inputText);

    for (x = 0; x < inputText.length; x+=1) {
        charCode = inputText.charCodeAt(x);

        if (isUpperCaseCharOrDigit(charCode)) {
            value = getCharValue(charCode);

            operationResult = calculateWithPreviousResult(operationResult, value, operand);
        }
    }

    return operationResult;
}

function displayCalculationResults(output) {
    var x, $displayNode;

    for (x = 0; x < output.length; x+=1) {
        $displayNode = jQuery('#' + output[x].id).parent().next();

        if(output[x].value !== 0){
            $displayNode.text(output[x].value);
        }else{
            $displayNode.text('');
        }
    }
}

function calculateLetterValuesAndDisplayResults() {

    var inputText = jQuery('#calcLetterInp').val(),
        x,
        sum,
        product,
        sumEach = [],
        subtotal,
        letter,
        output = [];


    letter = inputText.substring(0,1);

    for (x = 0; x < inputText.length; x+=1) {
        letter = inputText.substring(x, x+1);
        subtotal = calculateLetterValues(letter, add);

        if(subtotal > 0){
            sumEach.push(calculateLetterValues(letter, add));
        }
    }

    sum = calculateLetterValues(inputText, add);
    product = calculateLetterValues(inputText, multiply);


    output.push({id: 'sum', value: sum});
    output.push({id: 'singleLetterValue', value: sumEach.join(", ")});
    output.push({id: 'product', value: product });
    output.push({id: 'checksum', value: sum.getChecksum()});
    output.push({id: 'oneDigitChecksum', value: sum.getOneDigitChecksum()});


    displayCalculationResults(output);
}

function replaceForHtml(string) {
    var result = '',
        x,
        charAtPosition;

    for (x = 0; x < string.length; x+=1) {
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
        charAtPosition,
        rotatedChar,
        index,
        i;

    rotationInput = jQuery('#rotationInput').val();
    rotationCount = parseInt(jQuery('#rotationCount').find('option:selected').text(), 10);

    for (i = 0; i < rotationInput.length; i+=1) {
        charAtPosition = rotationInput.charAt(i);
        index = alphabet.indexOf(charAtPosition);

        if (index >= 0) {
            rotatedChar = alphabet.charAt((index + rotationCount) % alphabet.length);
        } else if ((index = alphabet.indexOf(charAtPosition.toUpperCase())) >= 0) {
            rotatedChar = (alphabet.charAt((index + rotationCount) % alphabet.length)).toLowerCase();
        }

        rotResult += rotatedChar;
    }

    rotResult = replaceForHtml(rotResult);

    jQuery('#rotationResult').html(rotResult);

}

function toolsTabSelected(){
    changeFavicon("tools.ico");
}

Number.prototype.getChecksum = function () {
    var numberString = this.toString(),
        checksum = 0,
        x;

    for (x = 0; x < numberString.length; x+=1) {
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