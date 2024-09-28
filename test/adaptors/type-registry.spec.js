// const chai = require('chai'),
//     chaiAsPromised = require('chai-as-promised'),
//     sinon = require('sinon'),
//     TypeRegistry = require('../../src/adaptors/type-registry'),
//     DynamoAdaptor = require('../../src/adaptors/dynamo-adaptor'),
//     { InvalidTypeError } = require('../../src/errors')

// chai.should()
// chai.use(chaiAsPromised)

// describe('TypeRegistry tests', function() {
//     describe('#getType', function() {
//         it('should return a predefined type', function() {
//             const typeRegistry = new TypeRegistry({})
//             return typeRegistry.getType('type', '1.0.0').should.eventually.be.eql({
//                 keyProperties: {
//                     keyPropertyA: 'type',
//                     keyPropertyB: 'version'
//                 }
//             })
//         })

//         it('should return the key property names', function() {
//             const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
//             dynamoAdaptor.get.withArgs({
//                 type: 'type',
//                 version: '1.0.0',
//                 key: {
//                     type: 'user',
//                     version: '1.0.1'
//                 }
//             }).resolves({
//                 keyProperties: 'key-properties'
//             })
//             const typeRegistry = new TypeRegistry({ dynamoAdaptor })
//             return typeRegistry.getType('user', '1.0.1').should.eventually.be.eql({
//                 keyProperties: 'key-properties'
//             })
//         })

//         it('should throw invalid type error', function() {
//             const dynamoAdaptor = sinon.createStubInstance(DynamoAdaptor)
//             dynamoAdaptor.get.withArgs({
//                 type: 'type',
//                 version: '1.0.0',
//                 key: {
//                     type: 'user',
//                     version: '1.0.1'
//                 }
//             }).resolves(undefined)
//             const typeRegistry = new TypeRegistry({ dynamoAdaptor })
//             return typeRegistry.getType('user', '1.0.1').should.eventually.be.rejectedWith(InvalidTypeError)
//         })
//     })

//     describe('#createTypes', function() {
//         it('should write the definitions to the database', function() {
//             const typeRegistry = new TypeRegistry({
//                 dynamoAdaptor: sinon.createStubInstance(DynamoAdaptor)
//             })

//             typeRegistry.dynamoAdaptor.batchWrite.withArgs([
//                 {
//                     op: 'create',
//                     type: 'type',
//                     version: '1.0.0',
//                     data: {
//                         type: 'some-type',
//                         version: 'some-version',
//                         keyProperties: {
//                             keyPropertyA: 'somePropertyA',
//                             keyPropertyB: 'somePropertyB',
//                             keyPropertyC: 'somePropertyC'
//                         }
//                     }
//                 },
//                 {
//                     op: 'create',
//                     type: 'type',
//                     version: '1.0.0',
//                     data: {
//                         type: 'some-type',
//                         version: 'some-version',
//                         keyProperties: {
//                             keyPropertyA: 'somePropertyA',
//                             keyPropertyB: 'somePropertyB',
//                         }
//                     }
//                 },
//                 {
//                     op: 'create',
//                     type: 'type',
//                     version: '1.0.0',
//                     data: {
//                         type: 'some-type',
//                         version: 'some-version',
//                         keyProperties: {
//                             keyPropertyA: 'somePropertyA',
//                         }
//                     }
//                 }
//             ]).resolves('result')

//             return typeRegistry.createTypes([
//                 {
//                     type: 'some-type',
//                     version: 'some-version',
//                     keyProperties: {
//                         keyPropertyA: 'somePropertyA',
//                         keyPropertyB: 'somePropertyB',
//                         keyPropertyC: 'somePropertyC'
//                     }
//                 },
//                 {
//                     type: 'some-type',
//                     version: 'some-version',
//                     keyProperties: {
//                         keyPropertyA: 'somePropertyA',
//                         keyPropertyB: 'somePropertyB',
//                     }
//                 },
//                 {
//                     type: 'some-type',
//                     version: 'some-version',
//                     keyProperties: {
//                         keyPropertyA: 'somePropertyA',
//                     }
//                 }
//             ]).should.eventually.be.eql('result')
//         })
//     })
// })