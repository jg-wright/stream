import type { PlopGeneratorConfig } from 'plop'
import { sortFields } from '../util'

export const packageAdd: Partial<PlopGeneratorConfig> = {
  description: 'a new package',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message:
        'What is the name of the package (minus the @johngw namespace). EG: stream-test',
    },
    {
      type: 'input',
      name: 'description',
      message: 'What does your package do?',
    },
  ],
  actions: (answers) => [
    {
      type: 'addMany',
      destination: `../packages/${answers!.name}`,
      base: 'templates/package/',
      templateFiles: 'templates/package/**/*',
      globOptions: { dot: true },
      data: {
        year: new Date().getFullYear(),
      },
    },
    {
      type: 'modify',
      path: '../.release-please-manifest.json',
      transform: (template) => {
        const json = JSON.parse(template)
        json[`packages/${answers!.name}`] = '0.0.0'
        return JSON.stringify(sortFields(json), null, 2)
      },
    },
    {
      type: 'modify',
      path: '../release-please-config.json',
      transform: (template) => {
        const json = JSON.parse(template)
        json.packages[`packages/${answers!.name}`] = {}
        json.packages = sortFields(json.packages)
        return JSON.stringify(json, null, 2)
      },
    },
    {
      type: 'modify',
      path: '../tsconfig.json',
      transform: (template) => {
        const json = JSON.parse(template)
        json.references ??= []
        json.references.push({ path: `./packages/${answers!.name}` })
        json.references.sort((a: any, b: any) => a.path.localeCompare(b.path))
        return JSON.stringify(json, null, 2)
      },
    },
  ],
}
