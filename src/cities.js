import { getCityData } from './helpers.js'
import geolib from 'geolib';
import geodist from 'geodist'
export const getCitiesByTag = async (tag, isActive) => {
    const cityData = await getCityData()

    let cities = cityData.filter(city => city.isActive === !!isActive && city.tags.includes(tag))

    return cities
}

export const getDistanceBetween = async (fromCityGuid, toCityGuid) => {
    const fromCoordinates = await getCityCoordinates(fromCityGuid)
    const toCoordinates = await getCityCoordinates(toCityGuid)

    //geolib.getPreciseDistance, geodist and getDistance custom function all return numbers very close to each other, the only reason i went with geodist is that it returns the same answer as the test, normally i would go with geolib as it offers more functionality
    const distance = geodist(fromCoordinates, toCoordinates, {exact: true, unit: 'km'}).toFixed(2)*1

    return distance
    
}

const getCityCoordinates = async (guid) => {
    const city = await getCity(guid)

    const coordinates = {
        latitude: city.latitude,
        longitude: city.longitude
    }

    return coordinates
}

export const getCity = async (guid) => {
    const cityData = await getCityData()

    let city = cityData.find(city => city.guid === guid)

    if (!city) throw new Error('City not found')
    return city
}

export const getCitiesInDistance = async (distance, startingPoint) => {
    //convert distance in to meters
    distance = distance *1000
    let cityData = await getCityData()
    cityData = cityData.filter(city => city.guid !== startingPoint)    
    const startingPointCoordinates = await getCityCoordinates(startingPoint)

    let citiesWithinDistance = []

    //fast
    cityData.map(city => {
       if(geolib.isPointWithinRadius(startingPointCoordinates, {latitude: city.latitude, longitude: city.longitude}, distance))
        citiesWithinDistance.push(city)
    })

    //slow
    // for(let city of cityData) {
    //    let distanceBetween = await getDistanceBetween(startingPoint, city.guid)
    //    if(distanceBetween <=250 && distanceBetween > 0) {
    //        citiesWithinDistance.push(city)
    //    }
    // }

    return citiesWithinDistance
}

// Just in case you expected me to calculate the distance manually
const getDistance = (lat1, lon1, lat2, lon2, unit) => {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="km") { dist = dist * 1.609344 }
        if (unit=="miles") { dist = dist * 0.8684 }
        return dist;
    }
}