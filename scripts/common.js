Array.prototype.contains = function contains(string) {
    var x;
    for (x = 0; x < this.length; x++) {
        if (this[x] === string) {
            return true;
        }
    }

    return false;
};

function showWarningDialog(contentKey) {
    var $dialog = jQuery('#warningDialogPlaceholder'),
        $content = $dialog.find('.pui-dialog-content'),
        $title = $dialog.find('.pui-dialog-title'),
        dialogContent = jQuery.i18n.prop(contentKey),
        dialogTitle = jQuery.i18n.prop('map.warning.dialog.title');

    $title.html(dialogTitle);
    $content.html('<p>' + dialogContent + '</p>');
    $dialog.puidialog('show');
}