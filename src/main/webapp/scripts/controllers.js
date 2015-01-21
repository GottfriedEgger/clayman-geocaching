var myApp = angular.module('calculatingApp', []);

myApp.controller('CalculatingController',
    function ($scope) {
        $scope.sum = undefined;

        $scope.letterInput = '';

        var replacements = [];
        replacements.push(['Ä', 'A']);
        replacements.push(['Ö', 'O']);
        replacements.push(['Ü', 'U']);

        function isUpperCaseChar(charCode) {
            return charCode >= 65 && charCode <= 90;
        }

        function isDigit(charCode){
            return charCode >= 48 && charCode <= 57;
        }

        function isUpperCaseCharOrDigit(charCode) {
            return isUpperCaseChar(charCode) || isDigit(charCode);
        }

        function replaceChars(string) {
            var x;
            for (x = 0; x < replacements.length; x+=1) {
                string = string.replace(replacements[x][0], replacements[x][1]);
            }
            return string;
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

        add = function(number1, number2){
            return number1 + number2;
        };

        function calculateWithPreviousResult(operationResult, value, operand) {
            if (operationResult === null) {
                operationResult = value;
            } else {
                operationResult = operand(operationResult, value);
            }
            return operationResult;
        }

        function calculateLetterValues(text, operand) {

            var operationResult = null,
                x,
                charCode,
                charValue;

            text = text.toUpperCase();
            text = replaceChars(text);

            for (x = 0; x < text.length; x+=1) {
                charCode = text.charCodeAt(x);

                if (isUpperCaseCharOrDigit(charCode)) {
                    charValue = getCharValue(charCode);

                    operationResult = calculateWithPreviousResult(operationResult, charValue, operand);
                }
            }

            return operationResult;
        }




        $scope.recalculateLetterValues = function (){
            $scope.sum = calculateLetterValues($scope.letterInput, add);

        };

    });
