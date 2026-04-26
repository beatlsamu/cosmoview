/**
 * Service to interact with NASA APIs
 */

const BASE_URL = 'https://api.nasa.gov';
const DEFAULT_KEY = 'DEMO_KEY';

export interface SpaceImage {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
  source: 'APOD' | 'Mars Rover' | 'EPIC' | 'NASA Library' | 'Copernicus';
  copyright?: string;
  hdurl?: string;
}

const getApiKey = () => {
  return import.meta.env.VITE_NASA_API_KEY || DEFAULT_KEY;
};

/**
 * Filter function to exclude non-real/rendered images
 */
const isRealPhoto = (title: string, description: string): boolean => {
  const nonRealKeywords = [
    'artist\'s impression',
    'illustration',
    'rendering',
    'concept',
    'diagram',
    'artwork',
    'conceptual',
    'sketch',
    'visualization',
    'simulated',
    'artist impression',
    'animated',
    'model',
    'cgi',
    'photorealistic render',
    'infographic',
    'schematic',
    'composite artist',
    'artist rendering'
  ];
  
  const text = `${title} ${description}`.toLowerCase();
  return !nonRealKeywords.some(keyword => text.includes(keyword));
};

export const fetchMoonImages = async (page = 1): Promise<SpaceImage[]> => {
  // NASA Image and Video Library API supports pagination
  // Querying for "Apollo Moon" to get high quality verified photos
  const response = await fetch(`https://images-api.nasa.gov/search?q=apollo%20moon%20photograph&media_type=image&page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch Moon images');
  const data = await response.json();
  
  return data.collection.items
    .slice(0, 20)
    .map((item: any) => {
      const dataObj = item.data[0];
      const links = item.links ? item.links[0] : { href: '' };
      
      return {
        id: `moon-${dataObj.nasa_id}-${page}`,
        title: dataObj.title,
        description: dataObj.description || 'Imagen verificada de la Luna de las misiones Apolo.',
        url: links.href,
        hdurl: links.href,
        date: dataObj.date_created.split('T')[0],
        source: 'NASA Library' as const,
      };
    })
    .filter((img: SpaceImage) => img.url && isRealPhoto(img.title, img.description));
};

/**
 * Fetch veridical Earth observation imagery (Landsat/Sentinel)
 */
export const fetchCopernicusImagery = async (page = 1): Promise<SpaceImage[]> => {
  const response = await fetch(`https://images-api.nasa.gov/search?q=landsat%20satellite%20earth%20observation&media_type=image&page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch Copernicus imagery');
  const data = await response.json();
  
  return data.collection.items
    .slice(0, 15)
    .map((item: any) => {
      const dataObj = item.data[0];
      const links = item.links ? item.links[0] : { href: '' };
      
      return {
        id: `copernicus-${dataObj.nasa_id}-${page}`,
        title: dataObj.title,
        description: dataObj.description || 'Imagen satelital verídica de la Tierra (Landsat/Copernicus Registry).',
        url: links.href,
        hdurl: links.href,
        date: dataObj.date_created.split('T')[0],
        source: 'Copernicus' as const,
      };
    })
    .filter((img: SpaceImage) => img.url && isRealPhoto(img.title, img.description));
};

export const fetchEPIC = async (page = 1): Promise<SpaceImage[]> => {
  const apiKey = getApiKey();
  // EPIC provides images for specific dates. To "paginate", we jump back in days.
  const date = new Date();
  date.setDate(date.getDate() - (page - 1));
  const dateStr = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  // Format the date for the API path
  const apiDate = dateStr; 
  
  const response = await fetch(`${BASE_URL}/EPIC/api/natural/date/${apiDate}?api_key=${apiKey}`);
  if (!response.ok) throw new Error('Failed to fetch EPIC images');
  const data = await response.json();

  if (data.length === 0 && page < 5) {
    // If no images for today, try yesterday automatically
    return fetchEPIC(page + 1);
  }

  return data.slice(0, 8).map((item: any) => {
    const dateTime = item.date; // Format: "2023-10-25 12:45:00"
    const dateParts = dateTime.split(' ')[0].split('-'); // ["2023", "10", "25"]
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const imageName = item.image; // "epic_1b_20231025..."
    
    // Construct the archive URL for EPIC images
    const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/jpg/${imageName}.jpg`;

    return {
      id: `epic-${item.identifier}-${page}`,
      title: 'Vista Terrestre EPIC (Foto Real)',
      description: `Fotografía real del disco completo de la Tierra capturada por la cámara EPIC a bordo del satélite DSCOVR el ${dateTime}.`,
      url: imageUrl,
      hdurl: imageUrl,
      date: dateParts.join('-'),
      source: 'EPIC' as const,
    };
  });
};

/**
 * Fetch Hubble and deep space imagery from NASA Library for Cosmos section
 */
export const fetchCosmosLibrary = async (page = 1): Promise<SpaceImage[]> => {
  const queries = ['hubble%20nebula', 'hubble%20galaxy', 'hubble%20star%20cluster'];
  const query = queries[(page - 1) % queries.length];
  
  const response = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image&page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch Cosmos Library images');
  const data = await response.json();
  
  return data.collection.items
    .slice(0, 15)
    .map((item: any) => {
      const dataObj = item.data[0];
      const links = item.links ? item.links[0] : { href: '' };
      
      return {
        id: `hubble-${dataObj.nasa_id}-${page}`,
        title: dataObj.title,
        description: dataObj.description || 'Fotografía de cielo profundo capturada por el Telescopio Espacial Hubble.',
        url: links.href,
        hdurl: links.href,
        date: dataObj.date_created.split('T')[0],
        source: 'APOD' as const, // Map to Cosmos filter
      };
    })
    .filter((img: SpaceImage) => img.url && isRealPhoto(img.title, img.description));
};

export const fetchAPOD = async (count = 12): Promise<SpaceImage[]> => {
  const apiKey = getApiKey();
  const response = await fetch(`${BASE_URL}/planetary/apod?api_key=${apiKey}&count=${count * 2}`); // Fetch more to filter out non-photos
  if (!response.ok) throw new Error('Failed to fetch APOD');
  const data = await response.json();
  
  return data
    .filter((item: any) => item.media_type === 'image')
    .map((item: any, index: number) => ({
      id: `apod-${index}-${item.date}`,
      title: item.title,
      description: item.explanation,
      url: item.url,
      hdurl: item.hdurl,
      date: item.date,
      copyright: item.copyright,
      source: 'APOD' as const,
    }))
    .filter((img: SpaceImage) => isRealPhoto(img.title, img.description))
    .slice(0, count);
};

export const fetchMarsRover = async (page = 1): Promise<SpaceImage[]> => {
  const apiKey = getApiKey();
  // Using latest_photos for the first page to get most current data, then Sol archive
  const url = page === 1 
    ? `${BASE_URL}/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=${apiKey}`
    : `${BASE_URL}/mars-photos/api/v1/rovers/curiosity/photos?api_key=${apiKey}&sol=3500&page=${page}`;
    
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch Mars photos');
  const data = await response.json();
  
  const photos = data.latest_photos || data.photos;
  
  return photos.slice(0, 15).map((item: any) => ({
    id: `mars-${item.id}-${page}`,
    title: `Foto Real: Marte (${item.camera.full_name})`,
    description: `Captura fotográfica real realizada por la cámara ${item.camera.full_name} del rover Curiosity en el Sol ${item.sol} (${item.earth_date}).`,
    url: item.img_src,
    date: item.earth_date,
    source: 'Mars Rover' as const,
  })).filter((img: SpaceImage) => isRealPhoto(img.title, img.description));
};

const FALLBACK_IMAGES: SpaceImage[] = [
  {
    id: 'fallback-1',
    title: 'The Pillars of Creation',
    description: 'James Webb Space Telescope\'s view of the Pillars of Creation, where new stars are forming within dense clouds of gas and dust.',
    url: 'https://images-assets.nasa.gov/image/PIA25434/PIA25434~thumb.jpg',
    hdurl: 'https://images-assets.nasa.gov/image/PIA25434/PIA25434~orig.jpg',
    date: '2022-10-19',
    source: 'APOD',
  },
  {
    id: 'fallback-2',
    title: 'Carina Nebula',
    description: 'The Cosmic Cliffs in the Carina Nebula reveal never-before-seen stellar nurseries and individual stars.',
    url: 'https://images-assets.nasa.gov/image/PIA25424/PIA25424~thumb.jpg',
    hdurl: 'https://images-assets.nasa.gov/image/PIA25424/PIA25424~orig.jpg',
    date: '2022-07-12',
    source: 'APOD',
  },
  {
    id: 'fallback-3',
    title: 'Curiosity on Mars',
    description: 'A look back at the tracks left by the Curiosity rover on the sandy surface of Gale Crater.',
    url: 'https://images-assets.nasa.gov/image/PIA19920/PIA19920~thumb.jpg',
    hdurl: 'https://images-assets.nasa.gov/image/PIA19920/PIA19920~orig.jpg',
    date: '2024-01-15',
    source: 'Mars Rover',
  }
];

export const fetchAllImages = async (page = 1): Promise<SpaceImage[]> => {
  const results = await Promise.allSettled([
    fetchAPOD(10),
    fetchMarsRover(page),
    fetchEPIC(page),
    fetchMoonImages(page),
    fetchCopernicusImagery(page),
    fetchCosmosLibrary(page)
  ]);

  const images: SpaceImage[] = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      images.push(...result.value);
    } else {
      const sources = ['APOD', 'Mars', 'EPIC', 'Moon', 'Copernicus', 'Hubble'];
      const source = sources[index] || 'Unknown';
      console.error(`Error fetching source ${source}:`, result.reason);
    }
  });

  // If no images could be fetched (rate limits), return fallback samples
  if (images.length === 0) {
    return FALLBACK_IMAGES;
  }

  // Sort by date descending
  return images.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
