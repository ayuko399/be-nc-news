const { selectUsers, selectUserByUsername } = require("../models/users.models");

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;

  selectUserByUsername(username)
    .then((user) => {
      console.log(user, "<<<<<<<user");
      res.status(200).send({ user });
    })
    .catch((err) => {
      console.log(err, "<<<<<<<<<error from controller");
      next(err);
    });
};
