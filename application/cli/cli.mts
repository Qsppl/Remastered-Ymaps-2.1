#!/usr/bin/env node

import { program } from 'commander'
import data from "../../package.json" with { type: "json" }
import { ScrapperService } from './scrapper/scrapper.service.mjs'

export async function main() {
    program
        .version(data.version)
        .description(data.description)

    ScrapperService.searchYmapsSources()
}

// Execute the main function to start the CLI
main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
