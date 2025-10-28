const inventoryStatusList = () => {
    return [
        {
            name: 'Not in stock',
            value: 0
        },
        {
            name: 'Inbound',
            value: 1
        },
        {
            name: 'Stock take',
            value: 2
        },
        {
            name: 'Outbound',
            value: 3
        }
    ]
}


/**
 * 1: Purchase, 2: Production Receipt, 3: Return, 4: Transfer, 5: Gift, 6: Scrap Recovery, 7:Sample, 8: Borrowing Return, 9: Inventory Adjustment, 10: Other
 * @returns {[{name: string, value: number}]}
 */
const inboundTypeList = () => {
    return [
        {
            name: 'Purchase',
            value: 1
        },
        {
            name: 'Production Receipt',
            value: 2
        },
        {
            name: 'Return',
            value: 3
        },
        {
            name: 'Transfer',
            value: 4
        },
        {
            name: 'Gift',
            value: 5
        },
        {
            name: 'Scrap Recovery',
            value: 6
        },
        {
            name: 'Sample',
            value: 7
        },
        {
            name: 'Borrowing Return',
            value: 8
        },
        {
            name: 'Inventory Adjustment',
            value: 9
        },
        {
            name: 'Other',
            value: 10
        }
    ]
}

/**
 * 1: Sales, 2: Production Picking, 3: Return, 4: Transfer, 5: Gift, 6: Scrap, 7: Sample, 8: Borrowing, 9: Inventory Adjustment, 10: Other
 * @returns {*[]}
 */
const outboundTypeList = () => {
    return [
        {
            name: 'Sales',
            value: 1
        },
        {
            name: 'Production Picking',
            value: 2
        },
        {
            name: 'Return',
            value: 3
        },
        {
            name: 'Transfer',
            value: 4
        },
        {
            name: 'Gift',
            value: 5
        },
        {
            name: 'Scrap',
            value: 6
        },
        {
            name: 'Sample',
            value: 7
        },
        {
            name: 'Borrowing',
            value: 8
        },
        {
            name: 'Inventory Adjustment',
            value: 9
        },
        {
            name: 'Other',
            value: 10
        }
    ]
}

const getInventoryStatus = (status) => {
    return inventoryStatusList().find(item => item.value === status)
}

const getInboundType = (type) => {
    return inboundTypeList().find(item => item.value === type)
}

const getOutboundType = (type) => {
    return outboundTypeList().find(item => item.value === type)
}

export default {
    getInventoryStatus, getInboundType, getOutboundType
}