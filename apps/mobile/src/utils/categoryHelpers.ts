export const getCategoryIconAndColor = (name: string): { icon: string; color: string } => {
  const lowerName = name?.toLowerCase() || '';

  if (lowerName.includes('food') || lowerName.includes('meal') || lowerName.includes('restaurant')) {
    return { icon: 'restaurant', color: '#4ADE80' }; // Green
  }
  if (lowerName.includes('rent') || lowerName.includes('home') || lowerName.includes('house')) {
    return { icon: 'home', color: '#F87171' }; // Red
  }
  if (lowerName.includes('petrol') || lowerName.includes('fuel') || lowerName.includes('transport') || lowerName.includes('car') || lowerName.includes('bike')) {
    return { icon: 'car', color: '#FBBF24' }; // Yellow
  }
  if (lowerName.includes('shopping') || lowerName.includes('clothes')) {
    return { icon: 'bag-handle', color: '#60A5FA' }; // Blue
  }
  if (lowerName.includes('health') || lowerName.includes('medical') || lowerName.includes('doctor')) {
    return { icon: 'medkit', color: '#EC4899' }; // Pink
  }
  if (lowerName.includes('education') || lowerName.includes('book') || lowerName.includes('study')) {
    return { icon: 'school', color: '#818CF8' }; // Indigo
  }
  if (lowerName.includes('entertainment') || lowerName.includes('movie') || lowerName.includes('fun')) {
    return { icon: 'game-controller', color: '#F472B6' }; // Pink-ish
  }
  if (lowerName.includes('bill') || lowerName.includes('utility') || lowerName.includes('electricity') || lowerName.includes('water')) {
    return { icon: 'receipt', color: '#9CA3AF' }; // Gray
  }
  if (lowerName.includes('travel') || lowerName.includes('trip') || lowerName.includes('flight')) {
    return { icon: 'airplane', color: '#38BDF8' }; // Light Blue
  }
  if (lowerName.includes('grocery') || lowerName.includes('groceries')) {
    return { icon: 'cart', color: '#34D399' }; // Emerald
  }
  if (lowerName.includes('personal')) {
    return { icon: 'person', color: '#A78BFA' }; // Purple
  }

  // Default fallback
  return { icon: 'pricetag', color: '#CBD5E1' }; // Slate
};
