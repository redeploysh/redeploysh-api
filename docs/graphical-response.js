const foo = {
    definitions: [
        {
            type: 'flashback',
            version: '1.0.0',
            primaryKeyProperties: {
                keyPropertyA: 'id'
            },
            secondaryKeys: [
                { type: 'trigger', version: '1.0.0', keyProperties: { keyPropertyA: 'triggers' } }
            ]
        },
        {
            type: 'trigger',
            version: '1.0.0',
            primaryKeyProperties: {
                keyPropertyA: 'id'
            },
            secondaryKeys: [
                { type: 'theme', version: '1.0.0', keyProperties: { keyPropertyA: 'themes' } }
            ]
        },
        {
            type: 'theme',
            version: '1.0.0',
            primaryKeyProperties: {
                keyPropertyA: 'id'
            }
        }
    ],
    projections: {
        flashback: {
            type: 'flashback',
            version: '1.0.0',
            response: {
                flashbackId: '${id}',
                triggers: '@{triggers:trigger}'
            }
        },
        trigger: {
            type: 'trigger',
            version: '1.0.0',
            response: {
                triggerId: '${id}',
                themes: '@{themes:theme}'
            }
        },
        theme: {
            type: 'theme',
            version: '1.0.0',
            response: {
                themeId: '${id}',
                color: '${color}'
            }
        }
    },
    operations: [
        {
            op: 'read',
            type: 'flashback',
            version: '1.0.0',
            key: {
                flashbackId: 'someFlashbackId'
            },
            return: {
                flashbackId: '${id}',
                triggers: '$[triggers]'
            }
        },
        {
            op: 'read_many',
            type: 'trigger',
            version: '1.0.0',
            key: {
                triggerId: '${@triggers}'
            },
            return: {
                themes: '$[themes]'
            }
        },
        {
            op: 'read_many',
            type: 'theme',
            version: '1.0.0',
            key: {
                themeId: '${@themes}'
            },
            return: {
                themeColor: 'color'
            }
        }
    ]
}
