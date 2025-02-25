export interface IYmapsInitializationData {
    mode: string
    debug: boolean
    namespace: string
    lang: string
    languageCode: string
    countryCode: string
    coordinatesOrder: string
    enterprise: boolean
    bundles: Record<string, string>
    version: string
    tag: string
    cssPrefix: string
    majorVersion: string
    server: {
        url: string
        path: string
        params: {
            apikey: string
            csp: null
        }
        version: string
    }
    preload: {
        load: string
        bundle: string
    }
    token: string
    taxiInceptionBboxes: number[][][]
    apikeyValid: boolean
    browser: {
        name: string
        version: string
        base: string
        engine: string
        engineVersion: string
        osName: string
        osFamily: string
        osVersion: string
        isMobile: boolean
        isTablet: boolean
        multiTouch: boolean
        platform: string
        cssPrefix: string
    }
    yandexMapDisableAdverts: boolean
    theme: null
    dataProvider: null
    dataPrestable: boolean
    suppressDistribution: boolean
    suppressTaxiDistribution: boolean
    displayAdvert: boolean
    allowYandexMapStyle: boolean
    countVisiblePromo: boolean
    allowDeprecatedSuggest: boolean
    vector: {
        version: string
        ts: number
    }
    hosts: {
        api: {
            main: string
            ua: string
            maps: string
            statCounter: string
            services: {
                coverage: string
                geocode: string
                geoxml: string
                inception: string
                panoramaLocate: string
                search: string
                suggest: string
                regions: string
                route: string
                traffic: string
            }
        }
        layers: {
            map: string
            mapj: string
            sat: string
            skl: string
            sklj: string
            stv: string
            sta: string
            staHotspot: string
            staHotspotKey: string
            carparks: string
        }
        static: string
        metro_RU: string
        metro_UA: string
        metro_BY: string
        metro_US: string
        traffic: string
        trafficInfo: string
        trafficArchive: string
        roadEventsRenderer: string
        vectorIndex: string
        vectorTiles: string
        vectorImages: string
        vectorMeshes: string
        vectorGlyphs: string
        indoorTiles: string
        panoramasTiles: string
        taxiRouteInfo: string
    }
    layers: {
        map: {
            version: string
            scaled: boolean
            hotspotZoomRange: number[]
            hotspotExcludeByTags: string[]
        }
        skl: {
            version: string
            scaled: boolean
            hotspotZoomRange: number[]
            hotspotExcludeByTags: string[]
        }
        sat: {
            version: string
        }
        stv: {
            version: string
        }
        sta: {
            version: string
        }
        trf: {
            version: string
            scaled: boolean
        }
        trfe: {
            version: string
            scaled: boolean
            hotspotZoomRange: number[]
        }
        carparks: {
            version: string
            scaled: boolean
        }
    }
    geolocation: {
        longitude: number
        latitude: number
        isHighAccuracy: boolean
        span: {
            longitude: number
            latitude: number
        }
    }
}