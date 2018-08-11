var request = require('request');
var cheerio = require('cheerio');

var getlyr = {
  getLyrics : function (artist, song, callback) {
    String.prototype.replaceAll = function(search, replacement) {
      var target = this;
      return target.replace(new RegExp(" ", 'g'), "-");
    };

    String.prototype.stripPunctuation = function() {
      var target = this;
      return target.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    };

    var link = "https://www.letras.mus.br/";

    artist = artist.stripPunctuation();
    artist = artist.replaceAll(" ", "-");
    artist = artist.toLowerCase();
    song = song.stripPunctuation();
    song = song.replaceAll(" ", "-");
    song = song.toLowerCase();

    link += artist +  "/" + song + "/";
    request(link, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var pageHTML = $("article").clone();
        var songtitle = $("h1").clone();
        var title = songtitle.text().replace("Letras de músicas - Letras.mus.br", "");
        pageHTML.find("br").replaceWith("\n");
        pageHTML.find("p").after("\n\n");
        var lyrics = pageHTML.text();

        if (lyrics == ""){
          console.log("Lyrics could not be found.");
          callback("Lyrics could not be found.", "");
        }
        else {
          callback(null, title, lyrics);
      }
      }
    });
  }
};

module.exports = getlyr;
