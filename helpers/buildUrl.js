var CHAR_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var BASE = CHAR_MAP.length;


//uses id to create hash
module.exports = function buildUrl(id) {
    var shortUrl = '';
    while(id > 1) {
        shortUrl = shortUrl + CHAR_MAP.charAt(id % BASE);
        id = id/BASE;
    }
    return shortUrl.toString();
};

