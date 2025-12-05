import { describe, expect, it } from 'bun:test'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { CatalogSchema } from '../../src/schemas/schema/common.dto'

const dir = join(import.meta.dir, 'data')
const files = readdirSync(dir).filter((file) => file.endsWith('.json'))

describe('Artist', () => {
  describe('Get a Catalog Artist', () => {
    it.each(files)('%s should be parsed by CatalogSchema', async (file) => {
      const json = await Bun.file(join(dir, file)).json()
      const result = CatalogSchema.safeParse(json)
      if (!result.success) {
        console.error(`Parse error in ${file}:`, result.error.message)
      }
      expect(result.success).toBe(true)
      console.log(JSON.stringify(result.data, null, 2))
    })
  })
})
