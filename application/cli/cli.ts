#!/usr/bin/env node

import { program } from 'commander'
import data from "../../package.json" with { type: "json" }
import { ScrapperService } from '../scrapper/scrapper.service.js'
import { TransformService } from '../transform/transform.service.js'

export async function main() {
    program
        .version(data.version)
        .description(data.description)

    const sourcecode = await ScrapperService.searchYmapsSourcecode()
    TransformService.transformYmapsLibrary(sourcecode)
}

// Execute the main function to start the CLI
main().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
