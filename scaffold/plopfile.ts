import { type NodePlopAPI } from 'plop'
import { packageAdd } from './generators/packageAdd'
import { packageRemove } from './generators/packageRemove'

export default async function scaffold(plop: NodePlopAPI) {
  plop.load('plop-pack-remove')
  plop.setGenerator('package:add', packageAdd)
  plop.setGenerator('package:remove', packageRemove)
}
