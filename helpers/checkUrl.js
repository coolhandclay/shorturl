module.exports = function checkUrl(url) {
    var http = /(^https?:\/\/)/i;
	var dot = /\./;
	if(url.match(http) && url.match(dot)) {
		return true;
	} else {
		return false;
	}
};