// Check if users are creating or updating fields that actually exist in User and Task models

const updates = async (req, res, next) => {
    try {
        const setKeys = Object.keys(req.body)
        let allowedKeys
        if(req.url === '/users/profile' || req.url === '/users') {
            allowedKeys = ['name', 'email', 'password', 'age']
        } else {
            allowedKeys = ['description', 'completed']
        }
        const isValidOperation = setKeys.every((setKey) => allowedKeys.includes(setKey))
    
        if(!isValidOperation) {
            throw new Error('Invalid field(s) creation or update!')
        }
        req.setKeys = setKeys // for update purposes
        next()
    } catch(error) {
        res.status(403).send({
            error: 'Invalid create or update!'
        })
    }
}

module.exports = updates
