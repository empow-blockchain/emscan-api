const Utils = {
    isAddress(address) {
        if (address.length === 49 && address[0] === 'E' && address[1] === 'M') {
            return true;
        }

        return false;
    },
}

module.exports = Utils

