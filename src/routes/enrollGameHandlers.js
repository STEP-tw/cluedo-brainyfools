const serveEnrollingForm = function(req,res,next){
  let enrollingForm = req.app.fs.readFileSync('templates/enrollingForm');
  res.contentType("text/html");
  res.send(enrollingForm);
  next();
};

module.exports = {
  serveEnrollingForm
};
