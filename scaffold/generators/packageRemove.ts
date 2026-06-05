import type { PlopGeneratorConfig } from 'plop'
import { readdir } from 'node:fs/promises'
import { sortFields } from '../util'

export const packageRemove: Partial<PlopGeneratorConfig> = {
  description: 'remove packages',
  prompts: [
    {
      type: 'list',
      name: 'name',
      choices: () => readdir('packages'),
    },
  ],
  actions: (answers) => [
    {
      type: 'remove',
      path: `../packages/${answers!.name}`,
    },
    {
      type: 'modify',
      path: '../.release-please-manifest.json',
      transform: (template) => {
        const json = JSON.parse(template)
        delete json[`packages/${answers!.name}`]
        return JSON.stringify(sortFields(json), null, 2)
      },
    },
    {
      type: 'modify',
      path: '../release-please-config.json',
      transform: (template) => {
        const json = JSON.parse(template)
        delete json.packages[`packages/${answers!.name}`]
        json.packages = sortFields(json.packages)
        return JSON.stringify(json, null, 2)
      },
    },
    {
      type: 'modify',
      path: '../tsconfig.json',
      transform: (template) => {
        const json = JSON.parse(template)
        json.references =
          json.references
            ?.filter(
              (reference: any) =>
                reference.path !== `./packages/${answers!.name}`,
            )
            .sort((a: any, b: any) => a.path.localeCompare(b.path)) ?? []
        return JSON.stringify(json, null, 2)
      },
    },
  ],
}
