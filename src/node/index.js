var app = require('express')();
var http = require('http').Server(app);

// supply to an Http server
// route handler / gets called when we git website home

app.get('/', function(req, res){
  res.sendFile(__dirname + 'src\www\html\index.html');
});
app.listen(3000, "10.39.90.175", () => {
  console.log("starting the local server");
})
