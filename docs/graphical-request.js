const graphRequest = {
    definitions: [
        {
            type: 'flashback',
            version: '1.0.0',
            primaryKeyProperties: {
                keyPropertyA: 'id'
            },
            relationships: [
                { hasMany: { type: 'trigger', version: '1.0.0', keyProperties: { keyPropertyA: 'id=@{triggers}' } } },
                { hasOne: { type: 'triggerIcon', version: '1.0.0', keyProperties: { keyPropertyA: 'id=${iconId}' } } }
            ]
        },
        {
            type: 'trigger',
            version: '1.0.0',
            primaryKeyProperties: {
                keyPropertyA: 'id'
            },
            relationships: [
                { hasMany: { type: 'theme', version: '1.0.0', keyProperties: { keyPropertyA: 'id=@{themes}' } } }
            ]
        },
        {
            type: 'theme',
            version: '1.0.0',
            primaryKeyProperties: {
                keyPropertyA: 'id'
            },
            relationships: [
                { hasOne: { type: 'alertSound', version: '1.0.0', keyProperties: { keyPropertyA: 'id=${alertSoundId}' } } }
            ]
        }
    ],
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
                subpropertyFromFlashback: '${someProperty.subproperty}',
                'flashbackMemories=@memories#sortedRange(date,0,10)': '${*}',
                'flashbackTriggers=@triggers': {
                    triggerId: '${id}',
                    'blueTriggerThemesWithQuacking=@themes#color=blue&alertSound=quacking': {
                        themeId: '${id}',
                        frequency: '${frequency}'
                    },
                    'colorsOfTopThemes=@themes#sortedRange(frequency,-1,-5)': {
                        themeId: '${id}',
                        color: '${color}'
                    },
                    'themesByIntensity=@themes#sortedRange(intensity,-1)': '${*}',
                    'orderedIntensities=@themes#sortedRange(intensity,-1)': '${intensity}'
                }
            }
        }
    ],
    response: {
        id: '${flashbackId}',
        propertyFromFlashback: '${subpropertyFromFlashback}',
        memories: '@{flashbackMemories}',
        triggers: '@{flashbackTriggers}'
    }
}

sampleoutput = {
    id: 'some-id',
    propertyFromFlashback: 'subproperty-value',
    memories: [
        { propertyOfMemory: 'some-value1', property2OfMemory: 'some-value1', property3OfMemory: 'some-value1' },
        { propertyOfMemory: 'some-value2', property2OfMemory: 'some-value2', property3OfMemory: 'some-value2' },
        { propertyOfMemory: 'some-value3', property2OfMemory: 'some-value3', property3OfMemory: 'some-value3' }
    ],
    triggers: [
        {
            triggerId: 'some-id',
            blueTriggerThemesWithQuacking: [{ themeId: 'some-theme-id', frequency: 75 }],
            colorsOfTopThemes: [
                { themeId: 'some-theme-id', color: 'red' },
                { themeId: 'some-theme-id', color: 'orange' },
                { themeId: 'some-theme-id', color: 'orange' },
                { themeId: 'some-theme-id', color: 'pink' },
                { themeId: 'some-theme-id', color: 'orange' }
            ],
            themesByIntensity: [
                { themeId: 'some-theme-id', frequency: 50, color: 'blue', intensity: 99 },
                { themeId: 'some-theme-id', frequency: 40, color: 'orange', intensity: 98 },
                { themeId: 'some-theme-id', frequency: 30, color: 'pink', intensity: 95 },
                { themeId: 'some-theme-id', frequency: 25, color: 'purple', intensity: 90 },
                { themeId: 'some-theme-id', frequency: 10, color: 'yellow', intensity: 73 },
                { themeId: 'some-theme-id', frequency: 50, color: 'blue', intensity: 72 },
                { themeId: 'some-theme-id', frequency: 40, color: 'orange', intensity: 60 },
                { themeId: 'some-theme-id', frequency: 30, color: 'pink', intensity: 50 },
                { themeId: 'some-theme-id', frequency: 25, color: 'purple', intensity: 49 },
                { themeId: 'some-theme-id', frequency: 10, color: 'yellow', intensity: 2 }
            ],
            orderedIntensities: [
                99, 98, 95, 90, 73, 72, 60, 50, 49, 2
            ]
        },
        {
            triggerId: 'some-other-id',
            blueTriggerThemesWithQuacking: [{ themeId: 'some-theme-id', frequency: 75 }],
            colorsOfTopThemes: [
                { themeId: 'some-theme-id', color: 'red' },
                { themeId: 'some-theme-id', color: 'orange' },
                { themeId: 'some-theme-id', color: 'orange' },
                { themeId: 'some-theme-id', color: 'pink' },
                { themeId: 'some-theme-id', color: 'orange' }
            ],
            themesByIntensity: [
                { themeId: 'some-theme-id', frequency: 50, color: 'blue', intensity: 99 },
                { themeId: 'some-theme-id', frequency: 40, color: 'orange', intensity: 98 },
                { themeId: 'some-theme-id', frequency: 30, color: 'pink', intensity: 95 },
                { themeId: 'some-theme-id', frequency: 25, color: 'purple', intensity: 90 },
                { themeId: 'some-theme-id', frequency: 10, color: 'yellow', intensity: 73 },
                { themeId: 'some-theme-id', frequency: 50, color: 'blue', intensity: 72 },
                { themeId: 'some-theme-id', frequency: 40, color: 'orange', intensity: 60 },
                { themeId: 'some-theme-id', frequency: 30, color: 'pink', intensity: 50 },
                { themeId: 'some-theme-id', frequency: 25, color: 'purple', intensity: 49 },
                { themeId: 'some-theme-id', frequency: 10, color: 'yellow', intensity: 2 }
            ],
            orderedIntensities: [
                99, 98, 95, 90, 73, 72, 60, 50, 49, 2
            ]
        }
    ]
}