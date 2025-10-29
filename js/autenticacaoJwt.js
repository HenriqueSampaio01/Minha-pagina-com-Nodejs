var jwt = require('jsonwebtoken');

exports.gerarTokenJwt = async function(idUsuario){
    return jwt.sign({'CodUsuario': idUsuario}, 'Token-liberado', { expiresIn: '1h' });                 
}; 

exports.verificaTokenJwt = async function(req, res, next){
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

    if (!token) return res.status(401).json({ auth: false, message: 'Token não informado.' });    
    
    jwt.verify(token, 'Token-liberado', function(err) {
        if (err) return res.status(401).json({ auth: false, message: 'Token Inválido.' });          
        next();
    });                 
}; 