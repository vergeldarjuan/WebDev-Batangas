export const facts = [
  {
    label: 'Founded',
    value: '1581',
    detail: 'City charter signed June 21, 1969',
  },
  {
    label: 'Provincial capital since',
    value: '1754',
    detail: 'Seat of Batangas province',
  },
  {
    label: 'City identity',
    value: 'Port City',
    detail: 'A gateway to Mindoro, Visayas, and Mindanao',
  },
  {
    label: 'Founding anniversary',
    value: 'Jul. 23',
    detail: 'Sublian Festival and City Foundation Day',
  },
];

export const timeline = [
  {
    year: '1581',
    text: 'Settlement founded, with the first Roman Catholic church built in the same year.',
  },
  {
    year: '1754',
    text: 'Batangas became the provincial capital and administrative seat.',
  },
  {
    year: '1948',
    text: 'The town church was elevated to Basilica Minor of the Infant Jesus and Immaculate Conception.',
  },
  {
    year: '1969',
    text: 'Republic Act 5495 created Batangas City, formally organized on July 23.',
  },
  {
    year: '2015',
    text: 'Republic Act 10673 reapportioned the city as the province fifth congressional district.',
  },
];

export const heritageItems = [
  {
    year: '1902',
    name: 'Batangas High School opens',
    description: 'Now known as Batangas City Integrated High School.',
  },
  {
    year: '1909',
    name: 'Municipal Hall inaugurated',
    description: 'A civic landmark in the city core.',
  },
  {
    year: '1910',
    name: 'Trade school formally opens',
    description: 'Forerunner of Batangas State University.',
  },
  {
    year: '1915',
    name: 'Plaza Mabini inaugurated',
    description: 'Named for Apolinario Mabini, Brains of the Revolution.',
  },
];

export const cityRoles = [
  {
    number: '01',
    title: 'Gateway South',
    label: 'Port City',
    text: 'Batangas Port anchors travel to Mindoro, Visayas, and Mindanao, with the Batangas-Calapan route among its busiest links.',
  },
  {
    number: '02',
    title: 'Regional Hub',
    label: 'Growth Center',
    text: 'The city connects industry, trade, and travel through STAR Tollway, SLEX, and its coastal access.',
  },
  {
    number: '03',
    title: 'Capital Since 1754',
    label: 'Provincial Seat',
    text: 'Government, education, commerce, and transport meet in a city shaped by public life and working communities.',
  },
];

export const destinations = [
  {
    name: 'Taal Volcano and Lake',
    tag: 'Natural Landmark',
    image: '/images/destinations/taal.jpeg',
    text: 'One of the province most recognizable views, close enough for a day trip from the city.',
    tall: true,
  },
  {
    name: 'Anilao, Mabini',
    tag: 'Dive Coast',
    image: '/images/destinations/anilao.jpg',
    text: 'A coastline known for coral reefs, diving schools, and weekend trips by the sea.',
  },
  {
    name: 'Laiya Beach',
    tag: 'Beach Getaway',
    image: '/images/destinations/laiya.jpg',
    text: 'A popular San Juan beach area for overnight stays, family outings, and coastal drives.',
  },
  {
    name: 'Taal Heritage Town',
    tag: 'Heritage Town',
    image: '/images/destinations/basilica.jpg',
    text: 'Ancestral houses, old streets, and basilica architecture within reach of the city.',
  },
  {
    name: 'Batangas Port',
    tag: 'City Landmark',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Batangas_Harbor.jpg/800px-Batangas_Harbor.jpg',
    text: 'The working heart of the city gateway identity, with ferry routes moving daily.',
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
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Goto_and_Mami.jpg/640px-Goto_and_Mami.jpg',
    text: 'Sticky rice in banana leaf paired with rich tablea hot chocolate.',
  },
];

export const events = [
  {
    month: 'Jul',
    day: '23',
    title: 'Sublian Festival',
    location: 'Batangas City',
    text: 'A city foundation celebration with street dances, processions, and local cultural performances.',
  },
  {
    month: 'Jan',
    day: '14',
    title: 'Feast of the Black Nazarene',
    location: 'Batangas City Cathedral',
    text: 'A visible expression of devotion through city streets and cathedral gatherings.',
  },
  {
    month: 'May',
    day: '01',
    title: 'Sandugo Festival',
    location: 'Balayan, Batangas',
    text: 'A provincial festival with historical reenactments, parades, and community events.',
  },
  {
    month: 'Nov',
    day: '30',
    title: 'Balisong Festival',
    location: 'Taal, Batangas',
    text: 'A celebration of the province knife-making tradition and artisan craft.',
  },
];

function getFallbackListingImage(listing) {
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

export function getListingImage(listing) {
  const primaryImage = listing?.primary_image_path
    || listing?.images?.find((image) => Number(image.is_primary) === 1)?.image_path
    || listing?.images?.[0]?.image_path;

  return primaryImage || getFallbackListingImage(listing);
}

export function getListingImages(listing) {
  const imagePaths = Array.isArray(listing?.images)
    ? listing.images.map((image) => image.image_path).filter(Boolean)
    : [];
  const primaryImage = getListingImage(listing);
  const orderedImages = [
    primaryImage,
    ...imagePaths.filter((imagePath) => imagePath !== primaryImage),
  ];

  return orderedImages.filter((imagePath, index) => orderedImages.indexOf(imagePath) === index);
}
