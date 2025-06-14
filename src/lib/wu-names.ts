// Wu-Tang name generation data
export const prefixes = [
  "Ol'", "Mighty", "Ghost", "Divine", "Master", "Dirty", "Rebel", "Golden",
  "Rogue", "Shadow", "Mystic", "Thunder", "Silent", "Cunning", "Furious",
  "Iron", "Swift", "Mysterious", "Ruthless", "Venomous", "Savage", "Crimson",
  "Arcane", "Stealthy", "Wicked", "Blazing", "Storm", "Supreme", "Royal",
  "Turbo", "Mega", "Ultra", "Hyper", "Wild", "Enigmatic", "Radiant", "Celestial",
  "Dragon", "Tiger", "Wolf", "Lion", "Panther", "Falcon", "Viper", "Cobra",
  "Eagle", "Hawk", "Phoenix", "Alpha", "Omega", "Gamma", "Sigma",
  "Vortex", "Shadowborn", "Lunar", "Ironclad", "Obsidian", "Turbocharged",
  "Solar", "Frostborn", "Infernal", "Wildstyle", "Dynamic", "Warborn", "Titan",
  "Quantum", "Echo", "Phantom", "Zen", "Thunderous", "Untamed", "Savage",
  "Majestic", "Slick", "Ghostly", "Cybernetic", "Magnetic", "Stormborn",
  "Electric", "Merciless", "Monolithic", "Blazing", "Perpetual", "Neo",
  "Spectral", "Volcanic", "Runic", "Titanic", "Elemental", "Omniscient",
  "Draconic", "Epoch", "Spartan", "Nomadic", "Tectonic", "Feral", "Zealous",
  "Dagger", "Warped", "Frost", "Mirrored", "Eldritch", "Crystalline", "Meteoric",
  "Interstellar", "Crimson", "Scarlet", "Azure", "Emerald", "Sapphire", "Ruby", "Ivory", "Onyx",
  "Golden", "Silver", "Bronze", "Copper", "Platinum", "Obsidian", "Pearl", "Cyan",
  "Vermilion", "Indigo", "Amethyst", "Turquoise", "Magenta", "Teal", "Coral",
  "Amber", "Topaz", "Jade", "Garnet"
];

export const suffixes = [
  "Shogun", "Samurai", "Monk", "Assassin", "Ninja", "Warrior", "Scholar",
  "Sage", "Chef", "Disciple", "Bastard", "Genius", "Monarch", "Prophet",
  "Champion", "Sentinel", "Nomad", "Reaper", "Titan", "Vanguard",
  "Ronin", "Oracle", "Wanderer", "Mercenary", "Seer", "Gladiator",
  "Alchemist", "Scribe", "Juggernaut", "Phoenix", "Sultan", "Baron", "Outlaw",
  "Leader", "Demon", "Wizard", "Gravedigger", "Wayfarer", "Shepherd"
];

export function generateWuTangName(seed: string): string {
  if (!seed) return "";
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const prefix = prefixes[hash % prefixes.length];
  const suffix = suffixes[hash % suffixes.length];
  return `${prefix} ${suffix}`;
}
