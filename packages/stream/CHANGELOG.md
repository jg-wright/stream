# Changelog

## [4.1.0](https://github.com/jg-wright/stream/compare/stream-v4.0.2...stream-v4.1.0) (2026-05-28)


### Features

* add tapWhen and WritableReadablePair ([f40843a](https://github.com/jg-wright/stream/commit/f40843af08730d917fab5496581fb0794e5894ac))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @johngw/stream-common bumped from ^2.0.1 to ^2.1.0
  * devDependencies
    * @johngw/stream-assert bumped from 1.0.2 to 1.1.0
    * @johngw/stream-test bumped from 2.0.1 to 2.1.0

## [4.0.2](https://github.com/jg-wright/stream/compare/stream-v4.0.1...stream-v4.0.2) (2026-05-27)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * @johngw/stream-assert bumped from 1.0.1 to 1.0.2

## [4.0.1](https://github.com/jg-wright/stream/compare/stream-v4.0.0...stream-v4.0.1) (2026-05-27)


### Bug Fixes

* **release:** add required provenance property ([ca55c15](https://github.com/jg-wright/stream/commit/ca55c150419279e0b55fe061903ae200b64a5ae8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @johngw/stream-common bumped from ^2.0.0 to ^2.0.1
  * devDependencies
    * @johngw/stream-assert bumped from 1.0.0 to 1.0.1
    * @johngw/stream-test bumped from 2.0.0 to 2.0.1

## [4.0.0](https://github.com/jg-wright/stream/compare/stream-v3.1.0...stream-v4.0.0) (2026-05-27)


### ⚠ BREAKING CHANGES

* Dropping bun support including stream-test-bun
* **subject:** You must control a subject with the `control()` method.

### Features

* add sink and source guards ([020cd61](https://github.com/jg-wright/stream/commit/020cd6151b706c3875b586f8c4b2b5abc5b0a7b7))
* add type testing ([845200a](https://github.com/jg-wright/stream/commit/845200aca03ab11e7af060e98251c96662dc11e8))
* configurable subject transformers ([8d6299b](https://github.com/jg-wright/stream/commit/8d6299b7d3f3de0c0180ba3770eff8bb49572d9d))
* mono repo ([18faac6](https://github.com/jg-wright/stream/commit/18faac6902eb30bb626b00fdf1d1e2185a14b757))
* **of:** add of source ([bfc66a8](https://github.com/jg-wright/stream/commit/bfc66a81b55288aa6c976a819e6e14009461ea3d))
* stream object entries ([948c3b4](https://github.com/jg-wright/stream/commit/948c3b45584655da4da3b1ff02e35c87833698eb))
* **subject:** multiple controllers ([c1bde5f](https://github.com/jg-wright/stream/commit/c1bde5f84e554d3b1c3a1c43d0a0075a7840863f))
* **subject:** multiple controllers ([5098b15](https://github.com/jg-wright/stream/commit/5098b1538b4f671e762cd97c5a906657999e9909))


### Bug Fixes

* add .js import extensions ([d746712](https://github.com/jg-wright/stream/commit/d746712e028901c39dc2aee758b8aa38fea4a94d))
* attempt to fix for commonjs modules ([0e11625](https://github.com/jg-wright/stream/commit/0e11625204ed1366579ae143e5adc1facb15415b))
* attempt to fix for commonjs modules ([b335622](https://github.com/jg-wright/stream/commit/b3356229dedd75088982d39300239da3e7a5125f))
* **buffercount:** enqueue at correct time ([7f7c999](https://github.com/jg-wright/stream/commit/7f7c999a6fce4551eccd689f90725896b09f9f6f))
* correct exporting for commonjs ([2d6b082](https://github.com/jg-wright/stream/commit/2d6b082af37e0c41a9b536d8cd914b7c8a9d5040))
* default import should be common ([13ef94c](https://github.com/jg-wright/stream/commit/13ef94ccb7b9e8bebb1f825187e191c67ec5388d))
* export missing classes ([d417034](https://github.com/jg-wright/stream/commit/d41703427158ff6201bf564ae077c56671a36946))
* forkable underlying sinks ([e268d95](https://github.com/jg-wright/stream/commit/e268d95a9b85e0ac0fa68f015394fda205983737))
* make sure to use import extensions ([5d38b4c](https://github.com/jg-wright/stream/commit/5d38b4c43817ee9531f4f7ed6c7693ba2026e4fa))
* stream tag ([f4f727a](https://github.com/jg-wright/stream/commit/f4f727a1dc5934258676bd58bbdb5a596eb0b257))
* **stream:** full name imports only ([7f58fb9](https://github.com/jg-wright/stream/commit/7f58fb93ae3f94ceb83931fb59510f94207ecae2))


### Miscellaneous Chores

* move to node.js ([6c9aca5](https://github.com/jg-wright/stream/commit/6c9aca5eadc743553e104218ca146658244cd0b8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @johngw/stream-common bumped from ^1.1.2 to ^2.0.0
  * devDependencies
    * @johngw/stream-assert bumped from 0.0.0 to 1.0.0
    * @johngw/stream-test bumped from 1.3.1 to 2.0.0
