import type { Card } from '../game'

export type CardIllustration = Readonly<{
  name: string
  description?: string
  flavour?: string
  src?: string
  position?: string
}>

// Catalogue identities; only reference local assets once generated.
export const illustrations: Partial<Record<Card['id'], CardIllustration>> = {
  'clubs-2': { name: "Grave Rat", src: '/art/cards/clubs-2.webp' },
  'clubs-3': { name: "Carrion Crow", src: '/art/cards/clubs-3.webp' },
  'clubs-4': { name: "Mire Imp", src: '/art/cards/clubs-4.webp' },
  'clubs-5': { name: "Thornback Wolf", src: '/art/cards/clubs-5.webp' },
  'clubs-6': { name: "Corpse Hound", src: '/art/cards/clubs-6.webp' },
  'clubs-7': { name: "Plague Stalker", src: '/art/cards/clubs-7.webp' },
  'clubs-8': { name: "Boneclaw", src: '/art/cards/clubs-8.webp' },
  'clubs-9': { name: "Bog Wraith", src: '/art/cards/clubs-9.webp' },
  'clubs-10': { name: "Hollow Troll", src: '/art/cards/clubs-10.webp' },
  'clubs-11': { name: "The Skin Collector", src: '/art/cards/clubs-11.webp' },
  'clubs-12': { name: "Broodmother", src: '/art/cards/clubs-12.webp' },
  'clubs-13': { name: "The Rot King", src: '/art/cards/clubs-13.webp' },
  'clubs-14': { name: "The Devourer", src: '/art/cards/clubs-14.webp' },
  'spades-2': { name: "Whispering Skull", src: '/art/cards/spades-2.webp' },
  'spades-3': { name: "Lantern Shade", src: '/art/cards/spades-3.webp' },
  'spades-4': { name: "Gravebound Acolyte", src: '/art/cards/spades-4.webp' },
  'spades-5': { name: "Weeping Spectre", src: '/art/cards/spades-5.webp' },
  'spades-6': { name: "Cursed Knight", src: '/art/cards/spades-6.webp' },
  'spades-7': { name: "The Bell Ringer", src: '/art/cards/spades-7.webp' },
  'spades-8': { name: "Ashen Revenant", src: '/art/cards/spades-8.webp' },
  'spades-9': { name: "The Soul Harvester", src: '/art/cards/spades-9.webp' },
  'spades-10': { name: "Crypt Guardian", src: '/art/cards/spades-10.webp' },
  'spades-11': { name: "The Pale Inquisitor", src: '/art/cards/spades-11.webp' },
  'spades-12': { name: "The Mourning Queen", src: '/art/cards/spades-12.webp' },
  'spades-13': { name: "The Lich Sovereign", src: '/art/cards/spades-13.webp' },
  'spades-14': { name: "The Nameless One", src: '/art/cards/spades-14.webp' },
  'diamonds-2': { name: "Rusted Shiv", src: '/art/cards/diamonds-2.webp' },
  'diamonds-3': { name: "Poacher's Knife", src: '/art/cards/diamonds-3.webp' },
  'diamonds-4': { name: "Grave Digger's Axe", src: '/art/cards/diamonds-4.webp' },
  'diamonds-5': { name: "Thornsteel Blade", src: '/art/cards/diamonds-5.webp' },
  'diamonds-6': { name: "Witch Hunter's Cleaver", src: '/art/cards/diamonds-6.webp' },
  'diamonds-7': { name: "Blackthorn Spear", src: '/art/cards/diamonds-7.webp' },
  'diamonds-8': { name: "Runebound Warhammer", src: '/art/cards/diamonds-8.webp' },
  'diamonds-9': { name: "Moonsteel Longsword", src: '/art/cards/diamonds-9.webp' },
  'diamonds-10': { name: "Emberfang", src: '/art/cards/diamonds-10.webp' },
  'hearts-2': { name: "Dewdrop Vial", src: '/art/cards/hearts-2.webp' },
  'hearts-3': { name: "Hearth Ember", src: '/art/cards/hearts-3.webp' },
  'hearts-4': { name: "Moonpetal", src: '/art/cards/hearts-4.webp' },
  'hearts-5': { name: "Forest Sprite", src: '/art/cards/hearts-5.webp' },
  'hearts-6': { name: "Witch's Remedy", src: '/art/cards/hearts-6-v2.webp' },
  'hearts-7': { name: "Wisp of Renewal", src: '/art/cards/hearts-7.webp' },
  'hearts-8': { name: "Dryad's Gift", src: '/art/cards/hearts-8.webp' },
  'hearts-9': { name: "Starlight Elixir", src: '/art/cards/hearts-9.webp' },
  'hearts-10': { name: "The White Stag", src: '/art/cards/hearts-10.webp' },
  "diamonds-11": { name: "The Oathbreaker", description: "Black executioner’s sword bound in broken chains", src: "/art/cards/diamonds-11.webp" },
  "diamonds-12": { name: "Widow’s Lament", description: "Ornate enchanted rapier trailing violet spectral mist", src: "/art/cards/diamonds-12-v2.webp" },
  "diamonds-13": { name: "Kingsbane", description: "Legendary royal greatsword blazing with pale golden fire", src: "/art/cards/diamonds-13.webp" },
  "diamonds-14": { name: "The Last Needle", description: "Tiny ancient enchanted stiletto, deceptively delicate", src: "/art/cards/diamonds-14-v2.webp" },
  "hearts-11": { name: "The Kindly Witch", description: "Elderly forest healer holding a glowing herbal charm", src: "/art/cards/hearts-11.webp" },
  "hearts-12": { name: "The Dawn Maiden", description: "Benevolent spectral woman radiating golden morning light", src: "/art/cards/hearts-12.webp" },
  "hearts-13": { position: "50% 0%", name: "The Ancient Guardian", description: "Majestic moss-covered forest spirit with luminous antlers", src: "/art/cards/hearts-13.webp" },
  "hearts-14": { name: "The First Light", description: "A single radiant flame suspended within an ancient stone shrine", src: "/art/cards/hearts-14.webp" },
  "joker-1": { name: "The Grinning Harlequin", description: "Sneaky and creepy harlequin jester, gaunt sly face, ragged muted burgundy and charcoal motley, crouching beside a ruined crypt doorway, a hand concealing a stolen trinket", src: "/art/cards/joker-1.webp" },
  "joker-2": { name: "The Briar Trickster", description: "Fey-wild trickster with pointed ears, mischievous knowing expression, leaf-and-briar motley and crooked twig crown, perched on a mossy root beside an ancient forest shrine", src: "/art/cards/joker-2.webp" },
}

