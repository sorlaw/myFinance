export const getCategoryIcon = (category: string) => {
    const normalized = category.toLowerCase();

    if (normalized.includes('food') || normalized.includes('makan') || normalized.includes('coffee') || normalized.includes('snack')) return { icon: 'fast-food', color: '#f97316' }; // Orange
    if (normalized.includes('home') || normalized.includes('house') || normalized.includes('rent') || normalized.includes('laundry') || normalized.includes('cuci')) return { icon: 'home', color: '#6366f1' }; // Indigo
    if (normalized.includes('car') || normalized.includes('transport') || normalized.includes('bus') || normalized.includes('uber') || normalized.includes('bensin')) return { icon: 'car', color: '#3b82f6' }; // Blue
    if (normalized.includes('shop') || normalized.includes('buy') || normalized.includes('mall') || normalized.includes('belanja')) return { icon: 'bag-handle', color: '#ec4899' }; // Pink
    if (normalized.includes('bill') || normalized.includes('electric') || normalized.includes('water') || normalized.includes('pln')) return { icon: 'flash', color: '#eab308' }; // Yellow
    if (normalized.includes('salary') || normalized.includes('wage') || normalized.includes('gaji')) return { icon: 'cash', color: '#10b981' }; // Emerald
    if (normalized.includes('school') || normalized.includes('edu')) return { icon: 'school', color: '#8b5cf6' }; // Violet
    if (normalized.includes('health') || normalized.includes('med') || normalized.includes('sakit')) return { icon: 'fitness', color: '#ef4444' }; // Red

    return { icon: 'wallet', color: '#6b7280' }; // Gray
};

export const getCategoryColor = (category: string) => {
    // Deprecated in favor of the object above, but keeping for compatibility if needed
    return getCategoryIcon(category).color;
}
