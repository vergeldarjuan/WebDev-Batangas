export const facts = [
  {
    label: 'Founded',
    value: '1581',
    detail: 'Established as a province on December 8, 1581',
  },
  {
    label: 'Provincial Capital',
    value: 'Batangas City',
    detail: 'Seat of government transferred from Balayan in 1754',
  },
  {
    label: 'Province Identity',
    value: 'Ala Eh!',
    detail: 'Home of the Balisong, Kapeng Barako, and brave souls',
  },
  {
    label: 'Provincial Day',
    value: 'Dec. 8',
    detail: 'Ala Eh! Festival and Province Foundation Day',
  },
];

export const timeline = [
  {
    year: '1570',
    text: 'Spanish explorers led by Martin de Goiti first explored the Batangas coast and Calumpang River.',
  },
  {
    year: '1581',
    text: 'The Spanish government officially established the Province of Balayan (later renamed Batangas Province).',
  },
  {
    year: '1754',
    text: 'The provincial capital was transferred from Balayan to the municipality of Batangas due to Taal Volcano eruptions.',
  },
  {
    year: '1898',
    text: 'Batanguenos took part in the Philippine Revolution, with General Miguel Malvar fighting as one of the last generals to surrender.',
  },
  {
    year: '2026',
    text: 'Celebrated as a highly progressive province in CALABARZON, thriving in industrial growth, tourism, and agriculture.',
  },
];

export const heritageItems = [
  {
    year: '1572',
    name: 'Taal Town Founded',
    description: 'The oldest town in the province, later relocated due to volcanic activity.',
  },
  {
    year: '1864',
    name: 'Birth of Apolinario Mabini',
    description: 'Born in Tanauan, known as the "Sublime Paralytic" and "Brains of the Revolution."',
  },
  {
    year: '1898',
    name: 'Sewing of the Philippine Flag',
    description: 'Marcela Agoncillo, a native of Taal, hand-sewed the first Philippine flag in Hong Kong.',
  },
  {
    year: '1900s',
    name: 'Balisong and Barako Crafts',
    description: 'Taal hand-crafted knives (balisong) and Lipa coffee (barako) became symbols of Batangueño identity.',
  },
];

export const provinceRoles = [
  {
    number: '01',
    title: 'Industrial & Energy Engine',
    label: 'Calabarzon Hub',
    text: 'Batangas powers a major part of Luzon, hosting power plants, international ports, refineries, and expanding industrial parks.',
  },
  {
    number: '02',
    title: 'Cradle of Heroes',
    label: 'Patriotic Heritage',
    text: 'The province is the birthplace of revolutionary figures like Apolinario Mabini, General Miguel Malvar, and Marcela Agoncillo.',
  },
  {
    number: '03',
    title: 'Natural & Eco-Tourism Sanctuary',
    label: 'Diverse Landscapes',
    text: 'From the dive sites of Anilao and sandy beaches of Laiya to the historic Taal Heritage Town and active volcano vistas.',
  },
];

export const destinations = [
  {
    name: 'Taal Volcano and Lake',
    tag: 'Natural Landmark',
    image: '/images/destinations/taal.jpeg',
    text: 'One of the country\'s most iconic natural landmarks, featuring a scenic lake within a volcanic caldera.',
    tall: true,
  },
  {
    name: 'Anilao, Mabini',
    tag: 'Dive Coast',
    image: '/images/destinations/anilao.jpg',
    text: 'A world-class diving destination offering rich marine sanctuaries, diverse coral reefs, and resort stays.',
  },
  {
    name: 'Laiya Beach',
    tag: 'Beach Getaway',
    image: '/images/destinations/laiya.jpg',
    text: 'A popular coastline in San Juan known for its white sand beaches, active water sports, and seaside resorts.',
  },
  {
    name: 'Taal Heritage Town',
    tag: 'Heritage Town',
    image: '/images/destinations/basilica.jpg',
    text: 'A historical treasure trove of Spanish-colonial ancestral homes and the majestic St. Martin de Tours Basilica.',
  },
];

export const foods = [
  {
    name: 'Batangas Lomi',
    badge: 'Must Try',
    image: '/images/food/batangaslomi.jpg',
    text: 'Thick egg noodles in a hearty broth with pork, kikiam, and egg.',
  },
  {
    name: 'Bulalo',
    badge: 'Province Classic',
    image: '/images/food/bulalo.jpg',
    text: 'Slow-cooked beef marrow soup served hot and shared across the table.',
  },
  {
    name: 'Kapeng Barako',
    badge: 'Local Pride',
    image: '/images/food/kapengbarako.jpg',
    text: 'Bold liberica coffee closely tied to Batangas mornings and pasalubong stops.',
  },
  {
    name: 'Suman and Tablea',
    badge: 'Heritage Delicacy',
    image: '/images/food/tablea.png',
    text: 'Sticky rice in banana leaf paired with rich tablea hot chocolate.',
  },
];

export const events = [
  {
    month: 'Jun',
    day: '24',
    title: 'Parada ng Lechon',
    location: 'Balayan, Batangas',
    text: 'A world-famous festival where golden-roasted pigs are dressed in creative outfits and paraded to honor St. John the Baptist.',
  },
  {
    month: 'Jul',
    day: '23',
    title: 'Sublian Festival',
    location: 'Batangas City',
    text: 'A vibrant cultural festival featuring the traditional Subli dance, honoring the Holy Cross of Alitagtag and Sto. Niño.',
  },
  {
    month: 'Nov',
    day: '30',
    title: 'Balisong Festival',
    location: 'Taal, Batangas',
    text: 'A celebration showcasing Taal\'s legendary hand-crafted butterfly knives (balisong) and the skilled artisans who make them.',
  },
  {
    month: 'Dec',
    day: '08',
    title: 'Ala Eh! Festival',
    location: 'Province-wide (Rotates Host)',
    text: 'The grand founding anniversary of Batangas Province, bringing together different towns with colorful street dancing and food fairs.',
  },
];


export function getListingImage(listing) {
  const title = `${listing?.title || ''}`.toLowerCase();
  const category = `${listing?.category_name || ''}`.toLowerCase();

  if (title.includes('taal')) {
    return '/images/destinations/taal.jpeg';
  }

  if (title.includes('laiya')) {
    return '/images/destinations/laiya.jpg';
  }

  if (category.includes('car') && title.includes('suv')) {
    return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80';
  }

  if (category.includes('car')) {
    return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80';
  }

  return '/images/destinations/basilica.jpg';
}
