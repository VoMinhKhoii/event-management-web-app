export const detectEventChanges = (existingEvent, updateData) => {
    const changes = {};
    const fieldsToCheck = [
        'title',
        'description',
        'summary',
        'startTime',
        'endTime',
        'startDate',
        'endDate',
        'location',
        'eventType',
        'image',
        'maxAttendees',
        'publicity'
    ];

    fieldsToCheck.forEach(field => {
        if (existingEvent[field]?.toString() !== updateData[field]?.toString()) {
            changes[field] = {
                oldValue: existingEvent[field],
                newValue: updateData[field]
            };
        }
    });

    return Object.keys(changes).length > 0 ? changes : null;
};
