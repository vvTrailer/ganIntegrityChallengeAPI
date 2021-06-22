import fs from 'fs-extra'
export const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) res.sendStatus(401)
    // Normally the tokens would be issued by something like jasonwebtoken and in here we would verify it
    // In this case we are just confirming a hardcoded token value as per the test script 

    token === 'dGhlc2VjcmV0dG9rZW4=' ? next() : res.sendStatus(403)
}

export const checkQueryParameters = (req, res) => {
    if (Object.keys(req.query).length === 0) createErrorResponse(res, 'Missing query parameters', 400)
}

export const createErrorResponse = (res, ex, statusCode) => {
    const body = JSON.stringify(ex, Object.getOwnPropertyNames(ex))
    res.status(statusCode).send(body)
}

export const createSuccessResponse = (res, body, statusCode) => {
    body = typeof body === 'object' ? JSON.stringify(body) : body
    res.status(statusCode).send(body)
}

export const getCityData = async () => {
    const file = await fs.readFile('./addresses.json');
    const data = JSON.parse(file);
    return data
}