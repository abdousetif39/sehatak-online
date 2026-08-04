import { WILAYAS, COMMUNES } from "../data/algeria-data";

export function getStateByName(name?: string) {
  if (!name) return undefined;

  return WILAYAS.find(
    w =>
      w.ar === name ||
      w.fr === name ||
      String(w.id) === String(name)
  );
}

export function getStateName(
  state: string | number | undefined,
  language: string
) {
  if (!state) return "";

  const item = WILAYAS.find(
    w =>
      String(w.id) === String(state) ||
      w.ar === state ||
      w.fr === state
  );

  if (!item) return String(state);

  return language.startsWith("fr")
    ? item.fr
    : item.ar;
}

export function getCities(
  state: string | number | undefined
) {
  const wilaya = WILAYAS.find(
    w =>
      String(w.id) === String(state) ||
      w.ar === state ||
      w.fr === state
  );

  if (!wilaya) return [];

  return COMMUNES.filter(c => c.w_id === wilaya.id);
}

export function getCityName(
  state: string | number | undefined,
  city: string | undefined,
  language: string
) {
  if (!city) return "";
  
  let commune = undefined;

  if (state) {
    const cities = getCities(state);
    commune = cities.find(c => c.ar === city || c.fr === city);
  }

  if (!commune) {
    commune = COMMUNES.find(c => c.ar === city || c.fr === city);
  }

  if (!commune) return city;

  return language.startsWith("fr") ? commune.fr : commune.ar;
}

export function getCityArabicName(city: string | undefined, state?: string | number) {
  if (!city) return "";
  let commune = undefined;
  if (state) {
    const cities = getCities(state);
    commune = cities.find(c => c.ar === city || c.fr === city);
  }
  if (!commune) {
    commune = COMMUNES.find(c => c.ar === city || c.fr === city);
  }
  return commune ? commune.ar : city;
}
