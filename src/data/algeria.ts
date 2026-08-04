import { WILAYAS, COMMUNES } from './algeria-data';

export const getStates = (lang: string): string[] => {
  const key = (lang || '').startsWith('ar') ? 'ar' : 'fr';
  return WILAYAS.map(w => w[key as 'ar' | 'fr']);
};

export const getCitiesForState = (stateName: string, lang: string): string[] => {
  if (!stateName) return [];
  const key = (lang || '').startsWith('ar') ? 'ar' : 'fr';
  
  // Find the wilaya ID from the name (could be ar or fr)
  const wilaya = WILAYAS.find(w => w.ar === stateName || w.fr === stateName);
  if (!wilaya) return [];
  
  return COMMUNES.filter(c => c.w_id === wilaya.id).map(c => c[key as 'ar' | 'fr']);
};
