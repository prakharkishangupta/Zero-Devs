const jwt = require("jsonwebtoken");
const UserDB = require("../../model/User.js");

const refreshJWT = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  const foundUser = await UserDB.findOne({ refreshToken: refreshToken });
  if (!foundUser) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      {
        email: decoded.email,
        id: decoded.id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const data = {
      name: foundUser.name,
      email: decoded.email,
      id: foundUser.id,
      accessToken,
    };

    res.json(data);
  });
};

module.exports = refreshJWT;
