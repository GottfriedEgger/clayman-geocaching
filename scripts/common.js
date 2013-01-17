/*global jQuery */

Array.prototype.contains = function contains(string) {
    var x;
    for (x = 0; x < this.length; x+=1) {
        if (this[x] === string) {
            return true;
        }
    }

    return false;
};

function showWarningDialog(contentKey, parameters) {
    var $dialog = jQuery('#warningDialogPlaceholder'),
        $content = $dialog.find('.pui-dialog-content'),
        $title = $dialog.find('.pui-dialog-title'),
        dialogContent = jQuery.i18n.prop(contentKey, parameters),
        dialogTitle = jQuery.i18n.prop('map.warning.dialog.title');

    $title.html(dialogTitle);
    $content.html('<p>' + dialogContent + '</p>');
    $dialog.puidialog('show');
}