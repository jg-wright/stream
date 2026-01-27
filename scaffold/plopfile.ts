import { type NodePlopAPI } from 'plop'
import { packageAdd } from './generators/packageAdd'
import { packageRemove } from './generators/packageRemove'

export default async function scaffold(plop: NodePlopAPI) {
  plop.setActionType('exec', async (_answers, config) => {
    const output = `${config.cmd}\n` as string

    try {
      const { exec } = await import('node:child_process')
      return (
        output +
        (await new Promise((resolve, reject) => {
          exec(config.cmd, (error, stdout) => {
            if (error) reject(error)
            else resolve(stdout)
          })
        }))
      )
    } catch (error: any) {
      return output + error.message
    }
  })

  plop.setGenerator('package:add', packageAdd)
  plop.setGenerator('package:remove', packageRemove)
}
