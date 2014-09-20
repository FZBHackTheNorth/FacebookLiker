/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ip = '285313038345162|e42HvQFwrzjCHkW6hvpfqIFCE9o';

Pebble.addEventListener("ready", function(e){
    console.log("JavaScript app ready and running!");
    if (window.localStorage.getItem('ip') !== null){
      console.log(window.localStorage.getItem('ip'));
    }
    console.log(window.localStorage.getItem('ip'));
  }
);

Pebble.addEventListener("showConfiguration", function(e){
    console.log("showing Configuration now...");
    Pebble.openURL("<!doctype html>
  <head>
    <script src='//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js'></script>
    <link rel='stylesheet' href='style.css' />
    <title>jQuery Example</title>
    <script>
      $(document).ready(function() {
      $.ajaxSetup({ cache: true });
      $.getScript('//connect.facebook.net/en_UK/all.js', function(){
        FB.init({
          appId: '285313038345162|e42HvQFwrzjCHkW6hvpfqIFCE9o',
        });     
        $('#loginbutton,#feedbutton').removeAttr('disabled');
        FB.getLoginStatus(updateStatusCallback);
      });
      });
      FB.api('/113124472034820', function(response) {
      console.log(response);
    });

    </script>
</head>
</html>");
});

var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello World!',
  body: 'Press any button.'
});

main.show();

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window();
  var textfield = new UI.Text({
    position: new Vector2(0, 50),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});
