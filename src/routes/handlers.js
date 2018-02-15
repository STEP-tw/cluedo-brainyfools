const serveEnrollingForm = function(req,res,next){
  let enrollingForm = req.app.fs.readFileSync('templates/enrollingForm','utf8');
  let gameId = req.params.id;
  enrollingForm = enrollingForm.replace(/{{ ID }}/,gameId);
  res.contentType("text/html");
  res.send(enrollingForm);
  next();
};

module.exports = {
  serveEnrollingForm
};
