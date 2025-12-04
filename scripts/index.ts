import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import app from '../src/index'

const docs = app.getOpenAPI31Document({
  info: {
    description: "API documentation for MusicKit",
    title: "MusicKit API",
    version: "1.0.0",
  },
  openapi: "3.1.0",
})

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, "openapi.json")
writeFileSync(outPath, JSON.stringify(docs, null, 2))
