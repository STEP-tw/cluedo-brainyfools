const serveHomepage = function(req,res,next) {
  res.statusCode = 200;
  let homepage = this.fs.readFileSync('./public/home.html');
  res.write(homepage);
  res.end();
  next();
}

module.exports = {
  serveHomepage : serveHomepage
}
