Array.prototype.contains = function contains(string) {
    var x;
    for (x = 0; x < this.length; x++) {
        if (this[x] === string) {
            return true;
        }
    }

    return false;
};