#!/usr/bin/env node

import { program } from 'commander'
import { version, description } from "../../package.json"
import { ScrapperService } from 'scrapper/scrapper.service.mjs'

export async function main() {
    program
        .version(version)
        .description(description)

    const sources = ScrapperService.search()

    // const result = await transformFile(sources)

    // fs.writeFileSync(outputPath, result, 'utf8')
    // console.log(`Successfully transformed ${inputPath} to ${outputPath}`)
}

// Execute the main function to start the CLI
main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
