var chai = require('chai');
var chaiHttp = require('chai-http');

var uuidv4 = require('uuid').v4;

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var promisify = require('util').promisify;
var redis = require('redis');
var sha1 = require('sha1');

chai.use(chaiHttp);
var expect = chai.expect;
var assert = chai.assert;

describe('GET /files', function () {
    var testClientDb;
    var testRedisClient;
    var redisDelAsync;
    var redisGetAsync;
    var redisSetAsync;
    var redisKeysAsync;

    var initialUser = null;
    var initialUserId = null;
    var initialUserToken = null;

    var initialFiles = [];

    function fctRandomString() {
        return Math.random().toString(36).substring(2, 15);
    }

    function fctRemoveAllRedisKeys() {
        return redisKeysAsync('auth_*').then(function (keys) {
            return Promise.all(keys.map(function (key) {
                return redisDelAsync(key);
            }));
        });
    }

    beforeEach(function (done) {
        var dbInfo = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || '27017',
            database: process.env.DB_DATABASE || 'files_manager'
        };

        MongoClient.connect('mongodb://' + dbInfo.host + ':' + dbInfo.port + '/' + dbInfo.database, function (err, client) {
            if (err) throw err;

            testClientDb = client.db(dbInfo.database);

            Promise.all([
                testClientDb.collection('users').deleteMany({}),
                testClientDb.collection('files').deleteMany({})
            ]).then(function () {

                // Add 1 user
                initialUser = {
                    email: fctRandomString() + '@me.com',
                    password: sha1(fctRandomString())
                };

                testClientDb.collection('users').insertOne(initialUser, function (err, createdDocs) {
                    if (createdDocs && createdDocs.ops.length > 0) {
                        initialUserId = createdDocs.ops[0]._id.toString();
                    }

                    // Add folders
                    var initialFolders = [];
                    var folderPromises = [];
                    for (var i = 0; i < 25; i++) {
                        (function () {
                            var item = {
                                userId: ObjectID(initialUserId),
                                name: fctRandomString(),
                                type: "folder",
                                parentId: '0'
                            };
                            initialFolders.push(item);
                            folderPromises.push(
                                testClientDb.collection('files').insertOne(item).then(function (createdFileDocs) {
                                    if (createdFileDocs && createdFileDocs.ops.length > 0) {
                                        item.id = createdFileDocs.ops[0]._id.toString();
                                    }
                                })
                            );
                        })();
                    }

                    Promise.all(folderPromises).then(function () {

                        // Add 2 folders inside a folder
                        var innerPromises = [];
                        for (var j = 0; j < 2; j++) {
                            (function () {
                                var item = {
                                    userId: ObjectID(initialUserId),
                                    name: fctRandomString(),
                                    type: "folder",
                                    parentId: ObjectID(initialFolders[0].id)
                                };
                                initialFiles.push(item);
                                innerPromises.push(
                                    testClientDb.collection('files').insertOne(item).then(function (createdFileDocs) {
                                        if (createdFileDocs && createdFileDocs.ops.length > 0) {
                                            item.id = createdFileDocs.ops[0]._id.toString();
                                        }
                                    })
                                );
                            })();
                        }

                        Promise.all(innerPromises).then(function () {
                            // Setup Redis
                            testRedisClient = redis.createClient();
                            redisDelAsync = promisify(testRedisClient.del).bind(testRedisClient);
                            redisGetAsync = promisify(testRedisClient.get).bind(testRedisClient);
                            redisSetAsync = promisify(testRedisClient.set).bind(testRedisClient);
                            redisKeysAsync = promisify(testRedisClient.keys).bind(testRedisClient);

                            testRedisClient.on('connect', function () {
                                fctRemoveAllRedisKeys().then(function () {
                                    initialUserToken = uuidv4();
                                    redisSetAsync('auth_' + initialUserToken, initialUserId).then(function () {
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    afterEach(function () {
        return fctRemoveAllRedisKeys();
    });

    it('GET /files with a valid parentId and no page', function (done) {
        chai.request('http://localhost:5000')
            .get('/files')
            .query({ parentId: initialFiles[0].parentId.toString() })
            .set('X-Token', initialUserToken)
            .end(function (err, res) {
                expect(err).to.be.null;
                expect(res).to.have.status(200);

                var resList = res.body;
                expect(resList.length).to.equal(2);

                resList.forEach(function (item) {
                    var itemIdx = initialFiles.findIndex(function (i) { return i.id == item.id; });
                    assert.isAtLeast(itemIdx, 0);

                    var itemInit = initialFiles.splice(itemIdx, 1)[0];
                    expect(itemInit).to.not.be.null;

                    expect(itemInit.id).to.equal(item.id);
                    expect(itemInit.name).to.equal(item.name);
                    expect(itemInit.type).to.equal(item.type);
                    expect(itemInit.parentId.toString()).to.equal(item.parentId.toString());
                });

                expect(initialFiles.length).to.equal(0);

                done();
            });
    }).timeout(30000);
});

