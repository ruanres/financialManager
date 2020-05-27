module.exports = (error, req, res, next) => {
  const { name, message } = error;
  switch (name) {
    case 'ValidationError':
      res.status(400).send({ error: message });
      break;
    case 'AuthorizationError':
      res.status(401).send({ error: message });
      break;
    case 'ForbiddenError':
      res.status(403).send({ error: message });
      break;
    case 'NotFoundError':
      res.status(404).send({ error: message });
      break;
    default:
      res.status(500).send(error);
  }
  next(error);
};
