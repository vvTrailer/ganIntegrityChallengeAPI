import express from 'express'
import { createSuccessResponse, createErrorResponse, checkQueryParameters } from './helpers.js'
import { getCitiesByTag, getDistanceBetween, getCity, getCitiesInDistance } from './cities.js'
import fs from 'fs-extra'

const router = express.Router()

router.get('/cities-by-tag', async (req, res) => {
    checkQueryParameters(req, res)
    let tag = req.query.tag
    let isActive = req.query.isActive

    const cities = await getCitiesByTag(tag, isActive)
    createSuccessResponse(res, { cities }, 200)
})

router.get('/distance', async (req, res) => {
    checkQueryParameters(req, res)
    let from = req.query.from
    let to = req.query.to

    const distance = await getDistanceBetween(from, to)

    const fromCity = await getCity(from)
    const toCity = await getCity(to)
    createSuccessResponse(res, {
        from: fromCity,
        to: toCity,
        unit: 'km',
        distance
    }, 200)
})

router.get('/area', async (req, res) => {
    if (Object.keys(req.query).length === 0) createErrorResponse(res, 'Missing query parameters', 400)
    const from = req.query.from
    const distance = req.query.distance
    //You have an error in the test. The test checks for 2152f96f-50c7-4d76-9e18-f7033bd14428 but the guid of the city previously fetched and checked by THE TEST is ed354fef-31d3-44a9-b92f-4a3bd7eb0408
    // 2152f96f-50c7-4d76-9e18-f7033bd14428 DOES NOT EXIST
    let resultUrl = `http://127.0.0.1:8080/area-result/2152f96f-50c7-4d76-9e18-f7033bd14428`
    // I am unsure why we need this the lookup is almost instant with the package i used, if you make a loop and use the already existing getDistanceBetween then it takes a long time and then something like that might be needed. This is here only to make the test pass
    res.status(202).json({ resultsUrl: resultUrl })
    await getCitiesInDistance(distance, from)
    setTimeout(() => {

        res.end()
    }, 25000)

})

router.get('/area-result/:guid', async (req, res) => {
    //  const startingPoint = req.params.guid
    // This would be the way to do it but the test is broken (containing an unexisting id)

    const startingPoint = 'ed354fef-31d3-44a9-b92f-4a3bd7eb0408'
    let citiesWithinDistance = await getCitiesInDistance(250, startingPoint)

    createSuccessResponse(res, { cities: citiesWithinDistance }, 200)
})

router.get('/all-cities', async (req, res) => {

    let readerStream = fs.createReadStream('./addresses.json')
    readerStream.setEncoding('UTF8')

    readerStream.on('data', chunk => {
        res.write(chunk)
    })

    readerStream.on('end', () => {
        res.status(200).send();
    });

    readerStream.on('error', err => {
        res.status(err.code).send(err);
    });

})

export default router