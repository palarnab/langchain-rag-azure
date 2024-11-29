const cyptojs = require('crypto-js');

const decryptPwd = (pwd) => {
    return cyptojs.DES.decrypt(pwd, process.env.PWD_SALT).toString(
        cyptojs.enc.Utf8
    );
};

const encryptPwd = (phrase) => {
    return cyptojs.DES.encrypt(phrase, process.env.PWD_SALT).toString();
};

module.exports = {
    decryptPwd,
    encryptPwd,
};
