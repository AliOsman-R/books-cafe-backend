asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res,next)
    } catch (error) {
        return next(error)
    }
}

module.exports = asyncHandler;