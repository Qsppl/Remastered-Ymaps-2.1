import { parse } from '@babel/parser'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'
import { extractIIFE } from './helpers/extract-iife.helper.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface IYmapsInitializationData {
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

export class ScrapperService {
    static readonly libraryInitializatorUrl = 'https://api-maps.yandex.ru/2.1/'

    static readonly output = path.join(__dirname, '../../downloaded_source')

    static async search() {
        console.log('\nНачинаем загрузку скрипта инициализации Яндекс.Карт...')

        try {
            const script = await this.#downloadInitScript()
            console.log('Скрипт инициализации успешно загружен')

            const initData = this.#extractInitData(script)
            console.log('\nДанные инициализации:')
            const strinified = JSON.stringify(initData, null, 2)
            if (strinified.length > 300) console.log(strinified.slice(0, 300), "\n...")
            else console.log(strinified)

            const bundleUrls = this.#getBundleUrls(initData)
            console.log('\nСписок URL бандлов:')
            bundleUrls.forEach(url => console.log(url))

        } catch (error) {
            console.error('Критическая ошибка:', error)
            process.exit(1)
        }
    }

    static #getBundleUrls({ hosts, bundles }: IYmapsInitializationData) {
        if (!hosts.static || !bundles) throw new Error('Отсутствуют данные о хосте или бандлах')

        return Object.values(bundles).map(bundle => {
            // Убедимся что нет двойных слешей в URL
            const bundlePath = bundle.startsWith('/') ? bundle.slice(1) : bundle
            const host = hosts.static.endsWith('/') ? hosts.static.slice(0, -1) : hosts.static
            return `${host}/${bundlePath}`
        })
    }

    static #extractInitData(script: string) {
        console.log('\nПарсим скрипт инициализации для извлечения конфигурации...')

        const program = parse(script, { sourceType: 'script' }).program
        const IIFE = extractIIFE(program)

        if (IIFE) {
            console.log("\nСкрипт является IIFE, извлекаем конфигурацию из первого аргумента вызова функции...")

            if (IIFE.arguments.length !== 1) throw new Error(`Unexpected IIFE arguments number. Expected 1 argument, but find ${IIFE.arguments.length}`)

            const argument = IIFE.arguments[0]

            if (argument.type !== "ObjectExpression") throw new Error(`Expect data in first IIFE argument, but find ${argument.type}`)

            return JSON.parse(argument)
        }

        throw new Error("Unknown initiailization script signaure")
    }

    static async #downloadInitScript() {
        const initScriptPath = path.join(this.output, 'init.js')

        try {
            const url = new URL(this.libraryInitializatorUrl)
            url.searchParams.append('mode', 'debug')
            url.searchParams.append('lang', 'ru_RU')

            console.log('URL:', url.toString())

            const response = await fetch(url.toString(), {
                headers: {
                    'Accept': '*/*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            })

            if (!response.ok) {
                throw new Error(`Ошибка HTTP! статус: ${response.status}`)
            }

            const text = await response.text()

            if (!text.includes('function') && !text.includes('var') && !text.includes('const')) {
                throw new Error('Ответ не похож на JavaScript файл')
            }

            await fs.mkdir(this.output, { recursive: true })
            await fs.writeFile(initScriptPath, text, 'utf8')
            console.log(`Скрипт инициализации (${text.length} байт) сохранен`)

            return text
        } catch (error) {
            console.error('Ошибка при загрузке скрипта инициализации:', error)
            throw error
        }
    }
}
