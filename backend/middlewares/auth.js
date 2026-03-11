import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const headerToken = req.headers.token;
    const cookieToken = req.cookies?.token;
    const token = cookieToken || headerToken;

    if (!token) {
      return res.json({ success: false, message: "Not Authorized" });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default authUser;