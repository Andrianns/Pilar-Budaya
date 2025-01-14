const jwt = require('jsonwebtoken');
const jwtKey = process.env.SECRET_KEY ?? 'secret';

const createToken = (payload) => jwt.sign(payload, jwtKey);
const verifyToken = (token) => jwt.verify(token, jwtKey);

module.exports = { createToken, verifyToken };