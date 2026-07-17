const fs = require('fs');
const path = require('path');

const calesDir = path.join(__dirname, 'cales');

// Serveis i activitats extrets dels webs
const servicesData = {
  "son-bou": ["🚌 Bus", "🅿️ Parking", "🚿 Dutxes", "🏖️ Hamaques", "🛟 Socorrista", "🛶 Kayak", "🍽️ Restaurants", "🛒 Supermercat", "💊 Farmàcia"],
  "cala-galdana": ["🚌 Bus", "🅿️ Parking", "🚿 Dutxes", "🛟 Socorrista", "🛶 Kayak", "🏄 Paddle surf", "🤿 Buceig", "🍽️ Restaurants", "🛒 Supermercat", "💊 Farmàcia"],
  "platja-sant-tomas": ["🚌 Bus", "🅿️ Parking", "🚿 Dutxes", "🏖️ Hamaques", "🛟 Socorrista", "🍽️ Restaurants", "🛒 Supermercat", "💊 Farmàcia"],
  "cala-morell": ["🅿️ Parking", "🍽️ Restaurants", "🛒 Botigues", "💊 Farmàcia"],
  "cala-en-tortuga-morell": ["🅿️ Parking", "🏛️ Coves prehistòriques", "🤿 Snorkel"],
  "cala-mitjana": ["🅿️ Parking"],
  "cala-en-turqueta": ["🅿️ Parking", "🏕️ Zona de pícnic"],
  "son-saura": ["🅿️ Parking"],
  "cala-macarella": ["🅿️ Parking (Cala Galdana)"],
  "cala-pregonda": ["🅿️ Parking"],
  "cala-pilar": ["🅿️ Parking"],
  "binimella": ["🅿️ Parking"],
  "es-talaier": [],
  "cala-escorxada": [],
  "cala-fustam": [],
  "cala-trebaluger": [],
  "cala-binigaus": ["🅿️ Parking"],
  "cala-llucalari": ["🅿️ Parking"],
  "cala-en-porter": ["🅿️ Parking", "🍽️ Restaurants", "🛒 Botigues"],
  "platja-punta-prima": ["🅿️ Parking", "🍽️ Restaurants", "🛒 Botigues"],
  "cala-binibequer": ["🅿️ Parking"],
  "cala-alcaufar": ["🅿️ Parking"],
  "cala-sant-esteve": ["🅿️ Parking"],
  "arenal-sa-mesquida": ["🅿️ Parking"],
  "cales-coves": ["🅿️ Parking", "🏛️ Necròpoli"],
  "cala-sant-llorenc": ["🅿️ Parking"],
  "platja-atalis": ["🅿️ Parking"],
  "platja-fontanelles": ["🅿️ Parking"],
  "platja-algaiarens": ["🅿️ Parking"],
  "platja-des-bot": ["🅿️ Parking"],
  "cala-carbo": ["🅿️ Parking"],
  "cala-calderer": ["🅿️ Parking"],
  "cala-barril": ["🅿️ Parking"],
  "macar-ferragut": ["🅿️ Parking"],
  "cala-viola": ["🅿️ Parking"],
  "cala-tirant": ["🅿️ Parking"],
  "ses-salines": ["🅿️ Parking"],
  "pou-bufereta": ["🅿️ Parking"],
  "macar-tosqueta": ["🅿️ Parking"],
  "cala-pudenta": ["🅿️ Parking"],
  "arenal-en-castell": ["🅿️ Parking", "🍽️ Restaurants", "🛒 Botigues"],
  "platja-na-macaret": ["🅿️ Parking"],
  "cala-tortuga": ["🅿️ Parking"],
  "cala-presili": ["🅿️ Parking"],
  "es-grau": ["🅿️ Parking"],
  "binigaus": ["🅿️ Parking"],
  "cala-en-brut": ["🅿️ Parking"],
  "cala-rafalet": ["🅿️ Parking"],
  "cala-pedrera": ["🅿️ Parking"],
  "macarelleta": [],
  "cala-pilar-algaiarens": ["🅿️ Parking"],
  "cala-mica": ["🅿️ Parking"],
  "cala-en-bosc": ["🅿️ Parking", "🍽️ Restaurants"],
  "cala-blanca": ["🅿️ Parking", "🍽️ Restaurants"],
  "santandria": ["🅿️ Parking", "🍽️ Restaurants"],
  "sa-caleta": ["🅿️ Parking", "🍽️ Restaurants"],
  "cala-des-degollador": ["🅿️ Parking"],
  "cala-en-blanes": ["🅿️ Parking", "🍽️ Restaurants"],
  "cala-en-forcat": ["🅿️ Parking", "🍽️ Restaurants"],
  "cales-piques": ["🅿️ Parking"],
  "cala-es-pous": ["🅿️ Parking"],
  "cala-es-morts": ["🅿️ Parking"],
  "calo-fondo": ["🅿️ Parking"],
  "ets-alocs": [],
  "cavalleria": ["🅿️ Parking"],
  "cala-pregondo": ["🅿️ Parking"],
  "binibequer-vell": ["🅿️ Parking"],
  "cala-binissafuller": ["🅿️ Parking"],
  "cala-morella-nou": [],
  "cala-pudenta": ["🅿️ Parking"],
  "arenal-son-saura": ["🅿️ Parking"],
  "arenal-en-castell": ["🅿️ Parking", "🍽️ Restaurants", "🛒 Botigues"],
  "platja-na-macaret": ["🅿️ Parking"],
};

const files = fs.readdirSync(calesDir).filter(f => f.endsWith('.json') && f !== 'index.json');

let updated = 0;

for (const file of files) {
  const filePath = path.join(calesDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!content.services) {
    content.services = servicesData[content.id] || [];
    updated++;

    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
  }
}

console.log(`Total fitxers: ${files.length}`);
console.log(`Cales amb services afegits: ${updated}`);
