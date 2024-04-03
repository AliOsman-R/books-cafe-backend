const {constants} = require('../utils/constants')

errorHandler = (err,req,res,next) => {

    const statusCode = res.statusCode? res.statusCode : 500;

    switch(statusCode)
    {
        case constants.VAILDATION_ERROR:
            res.json({title:'Validation failed', message:err.message});
            break;
        case constants.UNAUTHORIZED:
            res.json({title:'Unauthorized', message:err.message});
            break;
        case constants.FORBIDDEN:
            res.json({title:'Forbidden', message:err.message});
            break;
        case constants.NOT_FOUND:
            res.json({title:'Not found', message:err.message});
            break;
        case constants.SERVER_ERROR:
            res.json({title:'Server error', message:err.message});
            break;
        default:
            res.status(500)
            res.json({title:'Server error', message:err.message});
            break;
    }
}

module.exports = errorHandler;
