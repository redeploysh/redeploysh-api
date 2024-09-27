const foo = {
    definitions: [
        {
            type: 'user',
            version: '1.0.0',
            keyProperties: {
                keyPropertyA: 'email',
                keyPropertyB: 'phone'
            },
            validations: [
                {
                    property: 'email',
                    re: '/.+@.+\..+/'
                },
                {
                    property: 'nested.prop.phone',
                    validators: [
                        '(propertyValue) => propertyValue === "555-555-1212"'
                    ]
                }
            ]
        }
    ],
    operations: [
        {
            op: 'read',
            type: 'user:1.0.0',
            key: {
                email: 'some.user@email.address'
            },
            return: {
                userIdReference: 'emailAddress'
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
        }
    ],
    response: {
        userId: '${userIdReference}',
        phone: '${userPhone}',
        location: '${userLocation}',
        language: '${userLanguage}'
    }
}