const db = require('../../data/dbConfig');

const checkUserValid = (req, res, next) => {
    const { username, password } = req.body;
    if(!username || !password || !username.trim() || !password.trim()) {
        res.status(400).json({message: 'username and password required'});
    } else {
        next();
    }
};

const checkUsernameUnique = async(req, res, next) => {
    const username = req.body.username;
    const matches = await db('users').where({ username });
    if(matches.length >= 1) {
        res.status(400).json({message: 'username taken'});
    } else {
        next();
    }
};

module.exports = {
    checkUserValid,
    checkUsernameUnique
}