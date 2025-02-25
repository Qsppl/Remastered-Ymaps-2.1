import { parse } from '@babel/parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { extractIIFE } from './helpers/extract-iife.helper.mjs'
import { type IYmapsInitializationData } from './ymaps-initialization-data.entity.js'
import GeneratorModule from '@babel/generator'
import { FileSystemCache, NodeFetchCache } from 'node-fetch-cache'
import { shortDataPreview } from './helpers/short-data-preview.helper.js'
const generate = GeneratorModule.default

const featureHomeDirectory = path.dirname(fileURLToPath(import.meta.url))

export class ScrapperService {
    static readonly libraryInitializatorUrl = 'https://api-maps.yandex.ru/2.1/'

    static readonly cacheDirectory = path.join(featureHomeDirectory, '/downloads')

    static async searchYmapsSources() {
        console.log('\nНачинаем загрузку скрипта инициализации Яндекс.Карт...')

        const script = await this.#downloadInitScript()

        console.log(`Скрипт инициализации успешно загружен (${script.length} байт)`)

        const initData = this.#extractInitData(script)

        console.log('\nДанные инициализации:')
        console.log(shortDataPreview(initData))

        const bundleUrls = this.#getBundleUrls(initData)

        console.log('\nСписок URL бандлов исходного кода Яндекс.Карт:')
        for (const url of bundleUrls) console.log(url.toString())

        console.log('\nНачинаем загрузку бандлов исходного кода Яндекс.Карт...')

        const bundles = await this.#downloadAllBundles(bundleUrls)

        console.log(`Все бандлы загружены`)

        const librarySources = this.#buildSourcesFromBundles(bundles)

        console.log(`\nИсходный код библиотеки Яндекс.Карты:`)
        console.log(shortDataPreview(librarySources))

        return librarySources
    }

    static async #downloadInitScript(): Promise<string> {
        try {
            const url = new URL(this.libraryInitializatorUrl)
            url.searchParams.append('mode', 'debug')
            url.searchParams.append('lang', 'ru_RU')

            console.log('URL:', url.toString())

            return this.#downloadScript(url)
        } catch (error) {
            console.error('Ошибка при загрузке скрипта инициализации:', error)
            throw error
        }
    }

    static #extractInitData(script: string): IYmapsInitializationData {
        try {
            console.log('\nПарсим скрипт инициализации для извлечения конфигурации...')

            const program = parse(script, { sourceType: 'script' }).program
            const IIFE = extractIIFE(program)

            if (IIFE) {
                console.log("\nСкрипт является IIFE, извлекаем конфигурацию из первого аргумента вызова функции...")

                if (IIFE.arguments.length !== 1) throw new Error(`Unexpected IIFE arguments number. Expected 1 argument, but find ${IIFE.arguments.length}`)

                const argument = IIFE.arguments[0]

                if (argument.type !== "ObjectExpression") throw new Error(`Expect data in first IIFE argument, but find ${argument.type}`)

                return JSON.parse(generate(argument).code)
            }

            throw new Error("Unknown initiailization script signaure")
        } catch (error) {
            console.error('Не удалось извлечь данные инициализации:', error)
            throw error
        }
    }

    static #getBundleUrls({ hosts, bundles }: IYmapsInitializationData): URL[] {
        try {
            if (!hosts.static || !bundles) throw new Error('Отсутствуют данные о хосте или бандлах')

            return Object.values(bundles).map(bundle => {
                // Убедимся что нет двойных слешей в URL
                const bundlePath = bundle.startsWith('/') ? bundle.slice(1) : bundle
                const host = hosts.static.endsWith('/') ? hosts.static.slice(0, -1) : hosts.static
                return new URL(`${host}/${bundlePath}`)
            })

        } catch (error) {
            console.error('Не удалось извлечь ссылки на бандлы из данных инициализации:', error)
            throw error
        }
    }

    static async #downloadAllBundles(urls: URL[]): Promise<string[]> {
        try {
            return await Promise.all(urls.map(async url => {
                const bundle = await this.#downloadScript(url)
                console.log(`Бандл загружен (${bundle.length} байт) - `, url.toString())
                return bundle
            }))
        } catch (error) {
            console.error('Ошибка при загрузке бандлов:', error)
            throw error
        }
    }

    static async #downloadScript(url: URL): Promise<string> {
        const fetch = NodeFetchCache.create({
            shouldCacheResponse: (response) => response.ok,
            cache: new FileSystemCache({ cacheDirectory: this.cacheDirectory }),
        })

        const response = await fetch(url.toString())

        if (!response.ok) throw new Error(`Ошибка HTTP! статус: ${response.status}`)

        const text = await response.text()

        if (!text.includes('function') && !text.includes('var') && !text.includes('const')) {
            throw new Error('Ответ не похож на JavaScript файл')
        }

        return text
    }

    static #buildSourcesFromBundles(bundles: string[]) {
        return bundles.join("\n\n\n")
    }
}
