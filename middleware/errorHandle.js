function errorHandler(error, req, res, next) {
  console.log(error, '<<<<<');
  if (
    error.name == 'SequelizeValidationError' ||
    error.name == 'SequelizeUniqueConstraintError'
  ) {
    let errors = error.errors.map((el) => el.message);
    res.status(400).json({
      message: `${errors}`,
    });
  } else if (error.name === 'Invalid email/password') {
    res.status(401).json({ message: 'Invalid email or password' });
  } else if (error.name === 'Not Found') {
    res.status(404).json({
      message: 'Team not found',
    });
  } else if (error.name === 'Forbidden') {
    res.status(403).json({ message: 'Forbidden' });
  } else if (error.name === 'Not Found') {
    res.status(404).json({ message: 'Data not found' });
  } else if (error.name === 'NoToken') {
    res.status(401).json({ message: 'Please Login' });
  } else if (
    error.name === 'Unauthorized' ||
    error.name === 'JsonWebTokenError'
  ) {
    res.status(401).json({ message: 'Invalid Token' });
  } else if (error.name === 'teamNotFound') {
    res.status(404).json({
      message: 'Team not found',
    });
  } else if (error.name === 'integer(required)') {
    res.status(404).json({
      message: 'integer required',
    });
  } else if (error.name === 'unique') {
    res.status(400).json({
      message: 'You have chosen this team ',
    });
  } else if (error.name === 'Folder Not Found') {
    res.status(404).json({
      message: 'Folder Not Found',
    });
  } else {
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}

module.exports = errorHandler;
