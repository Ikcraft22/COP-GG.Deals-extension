export const EPIC_SYNC_ERROR_MESSAGES = {
    emptyCollection: 'Your Epic Games collection is empty. There’s nothing to sync.',
    emptyWishlist: 'Your Epic Games wishlist is empty. There’s nothing to sync.',
    generic: 'We encountered problems during Epic sync. Please try again later.'
} as const;

export const STEAM_SYNC_ERROR_MESSAGES = {
    platformLogin: 'Failed to log in to the platform website.',
    emptyCollection: 'Your Steam collection is empty. There’s nothing to sync.',
    emptyWishlist: 'Your Steam wishlist is empty. There’s nothing to sync.',
    emptyIgnoreList: 'Your Steam ignore list is empty. There’s nothing to sync.',
    generic: 'We encountered problems during Steam sync. Please try again later.'
} as const;

export const PLAYSTATION_SYNC_ERROR_MESSAGES = {
    emptyCollection: 'Your PlayStation collection is empty. There’s nothing to sync.',
    emptyWishlist: 'Your PlayStation wishlist is empty. There’s nothing to sync.',
    generic: 'We encountered problems during PlayStation sync. Please try again later.'
} as const;
