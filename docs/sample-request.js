const migrateUserV2 = {
    auth: 'j.w.t',
    operations: [
        {
            op: 'read',
            type: 'user:1.0.0',
            key: {
                email: 'some.user@email.address'
            },
            return: {
                userIdReference: 'userId'
            }
        },
        {
            op: 'read',
            type: 'userPhone:1.0.0',
            key: {
                userId: '${userIdReference}'
            },
            return: {
                userPhone: 'phone'
            }
        },
        {
            op: 'read',
            type: 'randomUserData:1.0.5',
            key: {
                userId: '${userIdReference}'
            },
            return: {
                userPasswordHash: 'passwordHash',
                userLangauge: 'language',
                userLocation: 'location'
            }
        },
        {
            op: 'create',
            type: 'user:2.0.0',
            data: {
                userId: '${userIdReference}',
                email: 'some.user@email.address',
                phone: '${userPhone}',
                passwordHash: '${userPasswordHash}',
                location: '${userLocation}',
                language: '${userLanguage}'
            }
        },
        {
            op: 'archive',
            type: 'user:1.0.0',
            key: {
                userId: '${userIdReference}',
            }
        },
        {
            op: 'archive',
            type: 'userPhone:1.0.0',
            key: {
                userId: '${userIdReference}'
            }
        },
        {
            op: 'archive',
            type: 'randomUserData:1.0.5',
            key: {
                userId: '${userIdReference}'
            }
        }
    ],
    response: {
        userId: '${userIdReference}',
        phone: '${userPhone}',
        location: '${userLocation}',
        language: '${userLanguage}'
    }
}

// some-guid-1: Retrieve user by email
// some-guid-2: Retrieve user phone number using retrieved id
// some-guid-3: Retrieve collection of user data using retrieved id
// some-guid-4: Write new version of user record with combined fields
// some-guid-5: Remove old user record for this user
// some-guid-6: Remove phone number record for this user
// some-guid-7: Remove collection of user data for this user
const migrateUser = {
    auth: 'j.w.t', // admin's jwt
    ops: [
        {
            id: 'some-guid-1',
            op: 'read',
            type: 'user:1.0.0',
            key: {
                email: 'some.user@email.address'
            }
        },
        {
            id: 'some-guid-2',
            op: 'read',
            type: 'userPhone:1.0.0',
            key: {
                userId: '${some-guid-1:userId}'
            }
        },
        {
            id: 'some-guid-3',
            op: 'read',
            type: 'randomUserData:1.0.5',
            key: {
                userId: '${some-guid-1:userId}'
            }
        },
        {
            id: 'some-guid-4',
            op: 'create',
            type: 'user:1.1.0',
            data: {
                userId: '${some-guid-1:userId}',
                email: 'some.user@email.address',
                phone: '${some-guid-2:phone}',
                passwordHash: '${some-guid-3:passwordHash}',
                location: '${some-guid-3:location}',
                language: '${some-guid-3:language}'
            }
        },
        {
            id: 'some-guid-5',
            op: 'archive',
            type: 'user:1.0.0',
            key: {
                userId: 'user-id'
            }
        },
        {
            id: 'some-guid-6',
            op: 'archive',
            type: 'userPhone:1.0.0',
            key: {
                userId: '${some-guid-1:userId}'
            }
        },
        {
            id: 'some-guid-7',
            op: 'archive',
            type: 'randomUserData:1.0.5',
            key: {
                userId: 'user-id'
            }
        }
    ]
}

const changePassword = {
    auth: 'j.w.t', // user's jwt
    ops: [
        {
            id: 'some-guid-1',
            op: 'read',
            type: 'user:1.1.0',
            key: {
                email: 'user.name@email.address'
            }
        },
        {
            id: 'some-guid-2',
            op: 'update',
            type: 'user:1.1.0',
            key: {
                email: 'user.name@email.address'
            },
            data: {
                previousPhone: '${some-guid-1:phone}',
                phone: '555-555-1212'
            }
        }
    ]
}

const getUserDeployables = {
    auth: 'j.w.t',
    ops: [
        {
            id: 'some-guid-1',
            op: 'read',
            type: 'user:1.1.0',
            key: {
                email: 'user.name@email.address'
            }
        },
        {
            id: 'some-guid-2',
            op: 'readCollection',
            type: 'repo:1.0.0',
            key: {
                deployableId: '${some-guid-2[0]:deployableId}'
            }
        },
        {
            id: 'some-guid-2',
            op: 'readCollection',
            type: 'deployable:1.0.0',
            key: {
                userId: '${some-guid-1:userId}'
            }
        }
    ]
}

const addUserDeployable = {
    auth: 'j.w.t',
    ops: [
        {
            id: 'some-guid-1',
            op: 'read',
            type: 'user:1.1.0',
            key: {
                email: 'user.name@email.address'
            }
        },
        {
            id: 'some-guid-2',
            op: 'create',
            type: 'deployable:1.0.0',
            data: {
                deployableId: 'some-guid-here',
                userId: '${some-guid-1:userId}',
                otherData: '...'
            }
        }
    ]
}

const removeDeployable = {
    auth: 'j.w.t',
    ops: [
        {
            id: 'some-guid-1',
            op: 'archive',
            type: 'deployable:1.0.0',
            key: {
                deployableId: 'some-deployable-id'
            }
        },
        {
            id: 'some-guid-2',
            op: 'archiveCollection',
            type: 'repo:1.0.0',
            key: {
                deployableId: 'some-deployable-id'
            }
        }
    ]
}