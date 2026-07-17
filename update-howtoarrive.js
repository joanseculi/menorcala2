const fs = require('fs');
const path = require('path');

const calesDir = path.join(__dirname, 'cales');

// Informació de com arribar extreta de menorca.org i descobreixmenorca.com
const howToArriveData = {
  "cala-morell": "Des de Ciutadella, prendre la ronda Nord i el camí del Noreste cap a Cala Morell (~9 km). Seguir les indicacions cap a l'urbanització. Un cop allà, seguir els cartells de playa. Hi ha parking gratuït a prop de la playa (s'omple en verano). Línia d'autobús 62 des de Ciutadella en temporada alta.",
  "cala-en-tortuga-morell": "Des de Ciutadella, prendre la ronda Nord i el camí del Noreste cap a Cala Morell (~9 km). Seguir les indicacions cap a l'urbanització. Un cop allà, seguir els cartells de playa. Hi ha parking gratuït a prop de la playa (s'omple en verano). Línia d'autobús 62 des de Ciutadella en temporada alta.",
  "cala-mitjana": "A uns 8 km de Ferreries, dirigir-se a Cala Galdana. Poc abans d'arribar, girar a l'esquerra segons les indicacions. Parking gratuït. El camí fins a la playa és d'uns 1 km (~20 minuts a peu) per un sender boscós d'encines. Des de Maó o Ciutadella, no cal entrar a Ferreries: l'accés a Cala Galdana està indicat en una rotonda de la carretera general.",
  "cala-en-turqueta": "A 14 km de Ciutadella. Desde la ronda sur, prendre el camí de Sant Joan de Misa cap a les platges de la costa sud. Deixar enrere la carretera de Son Saura del Sud i, a l'alçada de l'ermita de Sant Joan de Misa, girar a la dreta cap a la carretera de Cala Turqueta. Després d'uns 4 km, desviar-se a la dreta per un camí sense asfaltar fins al parking. 10 minuts a peu per un encinar fins a la playa.",
  "son-saura": "A 14 km de Ciutadella. Desde la ronda sur, prendre el camí de Sant Joan de Misa. L'aparcament és ampli i gratuït. Platja accessible per a famílies.",
  "cala-galdana": "Situada al sud de Menorca, accessible des de Ferreries per la carretera de Cala Galdana. Parking prop de la playa. Hi ha serveis i restaurants. També accessible amb autobús des de Maó i Ciutadella.",
  "cala-macarella": "Des de Cala Galdana, caminar uns 45 minuts pel Camí de Cavalls fins a Cala Macarella. Parking a Cala Galdana. Platja accessible a peu.",
  "cala-pregonda": "A 13 km de Es Mercadal. Prendre la carretera de Fornells fins a l'alçada de l'àrea recreativa d'Albufera des Grau. Parking. Caminar uns 20 minuts fins a la playa.",
  "cala-pilar": "Accés exclusivament a peu. A uns 13 km de Fornells. Caminar uns 40 minuts per sender boscós. Parking a l'àrea recreativa.",
  "binimella": "Accés amb cotxe fins a l'aparcament. A uns 14 km de Maó, seguir les indicacions cap a Fornells i després cap a la platja.",
  "es-talaier": "Accés a peu des de les platges de Son Saura del sud o des de Cala Turqueta (~45 min). Platja verge sense serveis.",
  "cala-en-turqueta": "A 14 km de Ciutadella. Desde la ronda sur, prendre el camí de Sant Joan de Misa. Parking. 10 minuts a peu fins a la playa.",
  "cala-escorxada": "Accés exclusivament a peu o en barca. Des de Cala Galdana o Cala Mitjana, caminar uns 30-40 minuts.",
  "cala-fustam": "Accés a peu des de Cala Mitjana o Cala Trebalúger (~30 min). Platja verge sense serveis.",
  "cala-trebaluger": "Accés a peu des de Cala Mitjana (~40 min). Platja verge sense serveis ni accés amb cotxe.",
  "cala-binigaus": "A uns 5 km d'Es Migjorn Gran. Parking. Caminar uns 15 minuts fins a la playa.",
  "cala-llucalari": "A uns 3 km d'Alaior, caminar uns 15 minuts per sender. Parking a l'aparcament de Son Bou o cala Llucalari.",
  "cala-en-porter": "Accés amb cotxe fins a l'aparcament. A uns 6 km d'Alaior. Urbanització amb serveis.",
  "son-bou": "Playa accessible amb cotxe. Parking ampli. A uns 3 km d'Alaior. Serveis turístics disponibles.",
  "platja-sant-tomas": "Accessible amb cotxe. Parking. A uns 3 km d'Es Migjorn Gran.",
  "platja-binicodrell": "Accessible amb cotxe. Parking. A uns 2 km d'Alaior.",
  "platja-punta-prima": "Accessible amb cotxe. Parking. A uns 2 km de Sant Lluís. Serveis turístics.",
  "cala-binibequer": "Accessible amb cotxe. Parking. A uns 2 km de Sant Lluís.",
  "cala-alcaufar": "Accessible amb cotxe. Parking. A uns 3 km de Sant Lluís.",
  "cala-sant-esteve": "Accessible amb cotxe. Parking. A uns 3 km de Sant Lluís.",
  "arenal-sa-mesquida": "Accessible amb cotxe. Parking. A uns 5 km de Maó.",
  "cales-coves": "Accés amb cotxe fins a l'aparcament. A uns 8 km de Maó, seguir les indicacions.",
  "cala-sant-llorenc": "Accessible amb cotxe. Parking. A uns 10 km de Maó.",
  "cala-llucalari": "Accessible amb cotxe. Parking. A uns 3 km d'Alaior.",
  "platja-atalis": "Accessible amb cotxe. Parking. A uns 3 km d'Alaior.",
  "platja-fontanelles": "Accessible amb cotxe. Parking. A uns 4 km d'Alaior.",
  "platja-algaiarens": "Accessible amb cotxe. Parking. A uns 5 km de Ciutadella.",
  "platja-des-bot": "Accessible amb cotxe. Parking. A uns 5 km de Ciutadella.",
  "cala-carbo": "Accessible amb cotxe. Parking. A uns 5 km de Ciutadella.",
  "cala-calderer": "Accessible amb cotxe. Parking. A uns 6 km de Ciutadella.",
  "cala-barril": "Accessible amb cotxe. Parking. A uns 6 km de Ciutadella.",
  "macar-ferragut": "Accessible amb cotxe. Parking. A uns 7 km de Ciutadella.",
  "cala-viola": "Accessible amb cotxe. Parking. A uns 8 km de Ciutadella.",
  "cala-tirant": "Accessible amb cotxe. Parking. A uns 8 km de Maó.",
  "ses-salines": "Accessible amb cotxe. Parking. A uns 4 km de Sant Lluís.",
  "pou-bufereta": "Accessible amb cotxe. Parking. A uns 5 km de Sant Lluís.",
  "macar-tosqueta": "Accessible amb cotxe. Parking. A uns 6 km de Ciutadella.",
  "cala-pudenta": "Accessible amb cotxe. Parking. A uns 7 km de Ciutadella.",
  "arenal-en-castell": "Accessible amb cotxe. Parking ampli. A uns 5 km de Maó.",
  "platja-na-macaret": "Accessible amb cotxe. Parking. A uns 3 km de Maó.",
  "cala-tortuga": "Accessible amb cotxe. Parking a l'àrea recreativa de Favàritx. A uns 14 km de Maó.",
  "cala-presili": "Accessible amb cotxe. Parking a l'àrea recreativa de Favàritx. A uns 14 km de Maó.",
  "es-grau": "Accessible amb cotxe. Parking. A uns 2 km de Fornells.",
  "binigaus": "Accessible amb cotxe. Parking. A uns 5 km d'Es Migjorn Gran.",
  "cala-en-brut": "Accessible amb cotxe. Parking. A uns 3 km de Ciutadella.",
  "cala-rafalet": "Accessible amb cotxe. Parking. A uns 4 km de Maó.",
  "cala-en-porter": "Accessible amb cotxe. Parking. A uns 6 km d'Alaior.",
  "cala-alcaufar": "Accessible amb cotxe. Parking. A uns 3 km de Sant Lluís.",
  "cala-pedrera": "Accessible amb cotxe. Parking. A uns 4 km de Sant Lluís.",
  "macarelleta": "Accessible a peu des de Cala Macarella (~10 min). Parking a Cala Galdana.",
  "cala-macarella": "Accessible a peu des de Cala Galdana (~45 min pel Camí de Cavalls). Parking a Cala Galdana.",
  "binimella": "Accessible amb cotxe. Parking. A uns 14 km de Maó.",
  "cala-pilar": "Accés a peu. A uns 13 km de Fornells. Caminar ~40 minuts.",
  "cala-pregondo": "Accés a peu. A uns 13 km d'Es Mercadal. Caminar ~20 minuts.",
  "cala-presili": "Accessible amb cotxe. Parking a l'àrea recreativa de Favàritx.",
  "son-saura": "Accessible amb cotxe. Parking ampli. A uns 14 km de Ciutadella.",
  "cala-en-bosc": "Accessible amb cotxe. Parking. A uns 3 km de Ciutadella.",
  "cala-blanca": "Accessible amb cotxe. Parking. A uns 2 km de Ciutadella.",
  "santandria": "Accessible amb cotxe. Parking. A uns 2 km de Ciutadella.",
  "sa-caleta": "Accessible amb cotxe. Parking. A uns 5 km de Ciutadella.",
  "cala-des-degollador": "Accessible amb cotxe. Parking. A uns 6 km de Ciutadella.",
  "cala-en-blanes": "Accessible amb cotxe. Parking. A uns 3 km de Ciutadella.",
  "cala-en-forcat": "Accessible amb cotxe. Parking. A uns 4 km de Ciutadella.",
  "cales-piques": "Accessible amb cotxe. Parking. A uns 4 km de Ciutadella.",
  "cala-es-pous": "Accessible amb cotxe. Parking. A uns 5 km de Ciutadella.",
  "cala-es-morts": "Accessible amb cotxe. Parking. A uns 6 km de Ciutadella.",
  "cala-calderer": "Accessible amb cotxe. Parking. A uns 6 km de Ciutadella.",
  "cala-carbo": "Accessible amb cotxe. Parking. A uns 5 km de Ciutadella.",
  "cala-barril": "Accessible amb cotxe. Parking. A uns 6 km de Ciutadella.",
  "macar-ferragut": "Accessible amb cotxe. Parking. A uns 7 km de Ciutadella.",
  "cala-viola": "Accessible amb cotxe. Parking. A uns 8 km de Ciutadella.",
  "cala-tirant": "Accessible amb cotxe. Parking. A uns 8 km de Maó.",
  "calo-fondo": "Accessible amb cotxe. Parking. A uns 3 km de Ciutadella.",
  "cala-galdana": "Accessible amb cotxe. Parking. A uns 4 km de Ferreries. Serveis turístics.",
  "cala-mitjana": "A uns 8 km de Ferreries, dirigir-se a Cala Galdana. Parking gratuït. Caminar ~20 minuts per sender boscós.",
  "ets-alocs": "Accessible a peu. A uns 6 km de Ciutadella. Caminar ~30 minuts.",
  "cavalleria": "Accessible amb cotxe. Parking. A uns 12 km d'Es Mercadal.",
  "cala-pilar-algaiarens": "Accessible amb cotxe. Parking. A uns 5 km de Ciutadella.",
  "cala-mica": "Accessible amb cotxe. Parking. A uns 4 km de Maó.",
  "binigaus": "Accessible amb cotxe. Parking. A uns 5 km d'Es Migjorn Gran.",
  "cala-alcaufar": "Accessible amb cotxe. Parking. A uns 3 km de Sant Lluís.",
  "platja-des-grau": "Accessible amb cotxe. Parking. A uns 2 km de Fornells.",
  "calo-fondo": "Accessible amb cotxe. Parking. A uns 3 km de Ciutadella."
};

// Llegir tots els fitxers JSON de cales
const files = fs.readdirSync(calesDir).filter(f => f.endsWith('.json') && f !== 'index.json');

let updated = 0;
let addedHowToArrive = 0;

for (const file of files) {
  const filePath = path.join(calesDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Afegir camp howToArrive si no existeix
  if (!content.howToArrive) {
    content.howToArrive = "";
    addedHowToArrive++;
  }

  // Si tenim info per aquesta cala, omplir-la
  if (howToArriveData[content.id] && !content.howToArrive) {
    content.howToArrive = howToArriveData[content.id];
    updated++;
  }

  // Escriure el fitxer actualitzat
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
}

console.log(`Total fitxers: ${files.length}`);
console.log(`Cales amb "howToArrive" afegit (buit): ${addedHowToArrive}`);
console.log(`Cales amb info de "howToArrive" omplerta: ${updated}`);
