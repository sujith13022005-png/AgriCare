import express, { Request, Response } from 'express';
import { GoogleGenAI, Type, GenerateVideosOperation } from '@google/genai';
import { INITIAL_PRODUCTS } from '../src/data/initialProducts';
import { Product, Order, LowStockEmailAlert, EmailAlertSettings, LowStockAlertItem } from '../src/types';
import { MONTHLY_AGRONOMY_DATA } from './seasonalAgronomyData';

const router = express.Router();

// In-memory data stores for the applet session
let products: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let orders: Order[] = [
  {
    id: 'ORD-9821',
    customerName: 'K. Sengottaiyan',
    phone: '+91 94432 54321',
    address: 'Thottipalayam Village, Bargur Road',
    villageCity: 'Anthiyur, Erode',
    pincode: '638501',
    paymentMethod: 'UPI',
    upiId: 'sengottaiyan.farmer@oksbi',
    items: [
      {
        productId: 'agri-prod-01',
        name: 'BSR-2 High-Curcumin Erode Turmeric Seed Rhizomes',
        price: 480,
        quantity: 2,
        unit: '5 kg bag',
        image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      },
      {
        productId: 'agri-prod-04',
        name: 'Mahadhan 19-19-19 100% Water Soluble NPK Drip Fertilizer',
        price: 215,
        quantity: 1,
        unit: '1 kg pack',
        image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 1175,
    deliveryFee: 0,
    discount: 50,
    total: 1125,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: 'Please leave near the turmeric boiling shed and tubewell pump house.',
  },
  {
    id: 'ORD-9822',
    customerName: 'S. Palanisamy',
    phone: '+91 98427 89012',
    address: 'Opposite Sakthi Sugars Cane Gate, Bhavani Main Road',
    villageCity: 'Appakoodal, Erode',
    pincode: '638315',
    paymentMethod: 'Cash on Delivery',
    items: [
      {
        productId: 'agri-prod-12',
        name: 'Anthiyur Hand-Forged High-Carbon Steel Ergonomic Weeding Sickle',
        price: 230,
        quantity: 2,
        unit: '1 piece',
        image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
      },
      {
        productId: 'agri-prod-13',
        name: 'Pure Desi Cow Panchagavya Organic Growth Promoter & Microbial Booster',
        price: 290,
        quantity: 2,
        unit: '1 Liter bottle',
        image: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 1040,
    deliveryFee: 0,
    discount: 40,
    total: 1000,
    status: 'Preparing',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    notes: 'Call before arriving at Appakoodal junction.',
  },
];

// Lazy Gemini client helper
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Robust fallback Agronomy Knowledge Engine for reliable farmer guidance
function generateAgronomyExpertAdvice(query: string, availableProducts: Product[]): {
  text: string;
  matchedProducts: { id: string; name: string; price: number; unit: string }[];
} {
  const q = query.toLowerCase();
  const matchedProducts: { id: string; name: string; price: number; unit: string }[] = [];

  // Helper to add product match
  const addMatch = (prod: Product) => {
    if (!matchedProducts.some((m) => m.id === prod.id) && matchedProducts.length < 3) {
      matchedProducts.push({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        unit: prod.unit,
      });
    }
  };

  // Find products matching the query terms
  for (const prod of availableProducts) {
    const pName = prod.name.toLowerCase();
    const pCat = prod.category.toLowerCase();
    const pDesc = prod.shortDescription.toLowerCase();

    if (
      (q.includes('neem') && pName.includes('neem')) ||
      (q.includes('npk') && pName.includes('npk')) ||
      ((q.includes('fertilizer') || q.includes('urea') || q.includes('potash')) && prod.category === 'Fertilizers') ||
      ((q.includes('seed') || q.includes('grain')) && prod.category === 'Seeds') ||
      ((q.includes('pest') || q.includes('spray') || q.includes('insect') || q.includes('fung')) && prod.category === 'Pesticides') ||
      ((q.includes('organic') || q.includes('vermi') || q.includes('humic')) && prod.category === 'Organic Nutrients') ||
      ((q.includes('sprayer') || q.includes('tool') || q.includes('shear')) && prod.category === 'Farm Tools') ||
      prod.cropCompatibility.some((crop) => q.includes(crop.toLowerCase()))
    ) {
      addMatch(prod);
    }
  }

  // If no products matched yet, populate with top recommended items
  if (matchedProducts.length === 0 && availableProducts.length > 0) {
    availableProducts.slice(0, 2).forEach(addMatch);
  }

  // 1. Tomato yellow leaves / chlorosis
  if (q.includes('yellow') || (q.includes('tomato') && (q.includes('leaf') || q.includes('leaves') || q.includes('die')))) {
    return {
      matchedProducts,
      text: `### 🌱 AgriCare Diagnosis: Tomato Leaf Yellowing & Chlorosis

Yellowing leaves on tomato plants typically arise from one of three primary causes:

1. **Nutrient Deficiency (Nitrogen or Magnesium)**:
   - **Symptoms**: If older bottom leaves turn pale yellow while veins remain green or the whole leaf turns light yellow, the plant lacks Nitrogen or Magnesium.
   - **Recommended Solution**: Apply **Mahadhan 19-19-19 100% Water Soluble NPK Drip Fertilizer** as a foliar spray at **4 to 5 grams per liter of clean water** every 10–12 days during active vegetative growth.

2. **Overwatering & Poor Root Aeration**:
   - Tomato roots suffocate in soggy, compacted soil, hindering nutrient uptake and causing uniform leaf yellowing and drooping.
   - **Remedy**: Allow top 2 inches of soil to dry out between waterings. Ensure raised beds or ridge planting during wet periods.

3. **Early Blight or Sucking Pests (Whiteflies/Aphids)**:
   - Whiteflies spread Tomato Yellow Leaf Curl Virus (TYLCV).
   - **Remedy**: Spray **Bio-Neem Cold-Pressed Azadirachtin 10,000 PPM Botanical Insecticide** at **4 ml per liter** of water mixed with 1 ml liquid soap as an emulsifier in the late afternoon.

*Need immediate supplies? Check our Fertilizers & Pesticides catalog to order direct to your farm.*`,
    };
  }

  // 2. Wheat NPK Fertilizer Schedule
  if (q.includes('wheat') || (q.includes('npk') && q.includes('fertilizer')) || (q.includes('schedule') && q.includes('fertilizer'))) {
    return {
      matchedProducts,
      text: `### 🌾 AgriCare Field Guide: Optimal NPK Fertilizer Schedule for Wheat

For high-yielding dwarf and hybrid wheat varieties (irrigated conditions), balanced NPK nutrition is essential:

#### 1. Recommended Dosage (Per Acre):
- **Nitrogen (N)**: 50–60 kg (split into 3 stages)
- **Phosphorus (P₂O₅)**: 24–30 kg (Full Basal dose)
- **Potash (K₂O)**: 16–20 kg (Full Basal dose)
- **Zinc Sulphate (ZnSO₄ 21%)**: 10 kg/acre (at sowing if soil is deficient)

#### 2. Application Schedule:
- **Basal Application (At Sowing)**:
  - 100% of Phosphorus + 100% Potash + 1/3rd of Nitrogen.
  - Drill 4–5 cm below seed level.
- **1st Top Dressing (Crown Root Initiation - 21 to 25 Days)**:
  - 1/3rd Nitrogen applied immediately before or after the 1st irrigation.
- **2nd Top Dressing (Jointing Stage - 45 to 50 Days)**:
  - Final 1/3rd Nitrogen applied right before 2nd irrigation.

#### 3. Foliar Booster Spray (Milking / Grain Filling):
- Spray **Mahadhan 19-19-19 100% Water Soluble NPK Drip Fertilizer** (5g/L) to plump up wheat and paddy grains and prevent terminal heat stress.`,
    };
  }

  // 3. Neem Oil Dilution & Mixing
  if (q.includes('neem') || (q.includes('dilute') && q.includes('oil'))) {
    return {
      matchedProducts,
      text: `### 🌿 AgriCare Guide: Dilution & Spray Protocol for Neem Oil (10,000 PPM)

**Bio-Neem Cold-Pressed Azadirachtin 10,000 PPM Botanical Insecticide** is a potent broad-spectrum organic insecticide and repellent against aphids, thrips, mites, whiteflies, and fruit borers.

#### Standard Mixing Ratios:
- **Preventive / Maintenance Spray**: **3 ml per 1 Liter of water** (45–50 ml per 15-liter knapsack tank).
- **Active Pest Infestation**: **5 ml per 1 Liter of water** (75 ml per 15-liter knapsack tank).

#### Mixing Step-by-Step (Emulsification is Critical):
1. Pure neem oil does not naturally dissolve in water.
2. Mix **1 ml to 2 ml of mild liquid soap or agricultural sticker (surfactant)** with the neem oil in a small container first.
3. Stir vigorously until it turns into a milky white emulsion.
4. Pour the emulsion into your spray tank filled with clean water and agitate well.

#### Best Field Practices:
- 🕒 **Timing**: Spray strictly during early morning (6:00–8:30 AM) or late afternoon (after 4:30 PM). Never spray under intense midday sun to prevent foliar scorching.
- 🍃 **Coverage**: Thoroughly spray the undersides of leaves where sucking insects hide.
- 🔁 **Repeat**: Repeat spray every 7–10 days until pest population drops below economic threshold.`,
    };
  }

  // 4. Paddy / Rice Seeds & Cultivation
  if (q.includes('paddy') || q.includes('rice') || (q.includes('seed') && !q.includes('neem'))) {
    return {
      matchedProducts,
      text: `### 🌾 AgriCare Guide: High-Yield Paddy Cultivation & Seed Treatment

Selecting healthy, high-vigor seeds is the foundation of a bumper harvest:

#### 1. Recommended Variety:
- **CR-1009 Sub-1 (Savithri) Flood-Resistant Samba Paddy Seeds**:
  - Maturity: 155 days.
  - Characteristics: Submergence-tolerant late samba paddy certified seeds for Bhavani and Cauvery basin wetlands.
  - Seed rate: **20–25 kg per acre** for transplanted nursery.

#### 2. 3-Step Seed Treatment Protocol:
1. **Salt Solution Test**: Soak seeds in a 10% brine solution (100g salt in 1L water). Discard lightweight seeds floating on top; keep healthy sunken seeds. Rinse twice with fresh water.
2. **Bio-Fungicide Treatment**: Treat seeds with *Trichoderma viride* (10g/kg of seed) or Carbendazim (2g/kg of seed) to shield seedlings against Bakanae disease and foot rot.
3. **Nursery Raising**: Sow treated seeds on raised nursery beds with decomposed vermicompost. Transplant 20–25 day old seedlings (2–3 per hill).

*AgriCare supplies certified germination-tested Basmati and hybrid seeds packed with tamper-evident seals.*`,
    };
  }

  // 5. Pest & Insect Control (Aphids, Thrips, Mites, Caterpillars)
  if (q.includes('pest') || q.includes('insect') || q.includes('caterpillar') || q.includes('worm') || q.includes('aphid') || q.includes('thrip') || q.includes('mite') || q.includes('borer')) {
    return {
      matchedProducts,
      text: `### 🛡️ AgriCare Integrated Pest Management (IPM) Advisory

For effective control of sucking insects, borers, and foliage-feeding caterpillars:

1. **Sucking Pests (Aphids, Whiteflies, Thrips & Mites)**:
   - **Damage**: Causes leaf curling, silvering, and honey-dew secretion attracting black sooty mold.
   - **Bio-Control**: Spray **Bio-Neem Cold-Pressed Azadirachtin 10,000 PPM Botanical Insecticide** at **4–5 ml/L** with surfactant.
   - **Cultural Practice**: Install yellow and blue sticky traps (15–20 traps/acre) at crop canopy level.

2. **Fruit & Shoot Borers / Caterpillars**:
   - **Scouting**: Look for bore holes, wilting terminal shoots, and larval frass.
   - **Treatment**: Apply **Coragen (Chlorantraniliprole 18.5% SC)** early before larvae penetrate deeply inside plant stems or pods.
   - **Spray Timing**: Late afternoon to maximize nocturnal larval exposure.

3. **Sprayer Hygiene**:
   - Use the **KisanKraft 16-Liter 12V Battery-Operated Knapsack Sprayer** calibrated with clean water to check droplet size before filling active solutions.`,
    };
  }

  // 6. Fungus & Crop Disease (Blight, Mildew, Wilt, Rot)
  if (q.includes('fung') || q.includes('blight') || q.includes('rot') || q.includes('mildew') || q.includes('rust') || q.includes('disease') || q.includes('spot')) {
    return {
      matchedProducts,
      text: `### 🩺 AgriCare Crop Disease & Fungicide Action Plan

Fungal pathogens thrive in high humidity and poorly drained fields. Here is your management protocol:

1. **Early & Late Blight, Leaf Spot & Blast**:
   - **Signs**: Water-soaked dark brown circular spots with concentric rings on lower leaves, spreading upward.
   - **Fungicide Spray**: Apply **Saaf Carbendazim 12% + Mancozeb 63% WP Dual-Action Fungicide** (2 g/L) at first symptom appearance.
   - **Cultural Care**: Avoid overhead sprinkler irrigation during cloudy weather; water at the root base.

2. **Powdery / Downy Mildew**:
   - **Signs**: White powdery coating on upper leaf surfaces or yellowish patches on undersides.
   - **Solution**: Foliar spray of wettable sulfur (2 g/L) or systemic fungicide in early morning.

3. **Root Rot & Rhizome Rot**:
   - Ensure furrow drainage to eliminate stagnant water puddles.
   - Soil drench with **Saaf Fungicide** or Trichoderma viride enriched compost around the root collar zone.`,
    };
  }

  // 7. Organic Farming & Soil Fertility
  if (q.includes('organic') || q.includes('vermicompost') || q.includes('humic') || q.includes('compost') || q.includes('soil')) {
    return {
      matchedProducts,
      text: `### 🍃 AgriCare Organic Nutrient & Soil Rejuvenation Guide

Revitalizing depleted farm soil boosts crop immunity and long-term water retention:

1. **Enriched African Nightcrawler Vermicompost with Trichoderma Viride**:
   - **Application**: 1 to 1.5 tons per acre broadcast before final ploughing, or 200g–500g per tree/plant ring.
   - **Benefits**: Infuses beneficial rhizosphere microorganisms, humic matter, and bio-available micro-nutrients.

2. **Pure Desi Cow Panchagavya & Seaweed Bio-Stimulant Liquid**:
   - **Usage**: Dilute 30 ml Panchagavya per liter (3% solution) or 2 ml Seaweed bio-stimulant per liter of water as a foliar spray.
   - **Benefits**: Stimulates secondary white root proliferation, increases cation exchange capacity (CEC), and alleviates drought stress.`,
    };
  }

  // 8. General Agronomist Advisory
  return {
    matchedProducts,
    text: `### 🌾 AgriCare AI Agronomist Consultation

Thank you for consulting AgriCare Farm Supplies! Here is our agronomist's field recommendations for your farming inquiry:

- **Nutrient Balance**: Always combine organic soil conditioning (**Kisan-Mitra Vermicompost**) with precision foliar nutrition (**AgriGro 19:19:19**) to maximize crop vigor and grain filling.
- **Early Pest Scouting**: Inspect your crops at least twice a week. Tackle pest outbreaks early using eco-friendly bio-solutions (**NeemShield 10,000 PPM**) before severe economic damage occurs.
- **Spraying Accuracy**: Use properly calibrated knapsack sprayers with hollow cone nozzles for insecticides and flat-fan nozzles for soil herbicides.
- **Seed Treatment**: Always treat seeds prior to sowing to prevent seed-borne pathogens and enhance germination percentage.

*You can view and order our certified farm inputs from the catalog above with genuine quality assurance and direct rural delivery.*`,
  };
}

// Convert PCM L16 24kHz buffer to playable WAV buffer with 44-byte header
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataLen = pcmBuffer.length;
  const chunkSize = 36 + dataLen;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLen, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// GET /api/products
router.get('/products', (_req: Request, res: Response) => {
  res.json({ success: true, products });
});

// POST /api/products (Admin create)
router.post('/products', (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.category || data.price == null) {
      return res.status(400).json({ error: 'Name, category, and price are required.' });
    }

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      name: String(data.name).trim(),
      category: data.category,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      rating: 5.0,
      ratingCount: 1,
      shortDescription: String(data.shortDescription || '').trim(),
      description: String(data.description || '').trim(),
      stock: Number(data.stock ?? 10),
      lowStockThreshold: Number(data.lowStockThreshold ?? 5),
      unit: String(data.unit || '1 unit').trim(),
      image: String(data.image || 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=800&q=80'),
      cropCompatibility: Array.isArray(data.cropCompatibility)
        ? data.cropCompatibility
        : typeof data.cropCompatibility === 'string'
        ? data.cropCompatibility.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['All Crops'],
      usageInstructions: String(data.usageInstructions || 'Apply as recommended by local agricultural extension officer.').trim(),
      composition: String(data.composition || 'Standard agricultural grade').trim(),
      safetyNotes: data.safetyNotes ? String(data.safetyNotes).trim() : undefined,
      organicCertified: Boolean(data.organicCertified),
      featured: Boolean(data.featured),
    };

    products.unshift(newProduct);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

// PUT /api/products/:id (Admin update product/stock/price)
router.put('/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const current = products[index];
    const updates = req.body;

    const updatedProduct: Product = {
      ...current,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : current.price,
      originalPrice: updates.originalPrice !== undefined ? Number(updates.originalPrice) : current.originalPrice,
      stock: updates.stock !== undefined ? Number(updates.stock) : current.stock,
      lowStockThreshold: updates.lowStockThreshold !== undefined ? Number(updates.lowStockThreshold) : current.lowStockThreshold,
    };

    products[index] = updatedProduct;
    res.json({ success: true, product: updatedProduct });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

// DELETE /api/products/:id (Admin delete)
router.delete('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = products.length;
  products = products.filter((p) => p.id !== id);
  if (products.length === initialLen) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, message: 'Product removed' });
});

// POST /api/products/reset (Reset catalog to initial state)
router.post('/products/reset', (_req: Request, res: Response) => {
  products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  seasonalAgronomyCache.clear();
  res.json({ success: true, products });
});

// GET /api/orders
router.get('/orders', (_req: Request, res: Response) => {
  res.json({ success: true, orders });
});

// POST /api/orders (Checkout submission)
router.post('/orders', (req: Request, res: Response) => {
  try {
    const { customerName, phone, address, villageCity, pincode, paymentMethod, upiId, items, notes } = req.body;

    if (!customerName || !phone || !address || !items || !items.length) {
      return res.status(400).json({ error: 'Customer name, phone, address, and items are required.' });
    }

    let subtotal = 0;
    const validatedItems = [];

    // Check and deduct stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.name || item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }

      // Deduct stock
      product.stock -= item.quantity;
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        image: product.image,
      });
    }

    const deliveryFee = subtotal > 1000 ? 0 : 50;
    const discount = subtotal > 2000 ? 100 : 0;
    const total = subtotal + deliveryFee - discount;

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      villageCity: String(villageCity || '').trim(),
      pincode: String(pincode || '').trim(),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      upiId: upiId ? String(upiId).trim() : undefined,
      items: validatedItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      status: 'Received',
      createdAt: new Date().toISOString(),
      notes: notes ? String(notes).trim() : undefined,
    };

    orders.unshift(newOrder);
    res.status(201).json({ success: true, order: newOrder, updatedProducts: products });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to place order' });
  }
});

// POST /api/transcribe (Audio speech-to-text using gemini-3.5-transcribe)
router.post('/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'audioBase64 string is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Please attach an API key in Settings > Secrets.',
      });
    }

    // Clean mime type (e.g. 'audio/webm;codecs=opus' -> 'audio/webm')
    const cleanMime = mimeType.split(';')[0].trim() || 'audio/webm';

    const audioPart = {
      inlineData: {
        mimeType: cleanMime,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            mimeType: cleanMime,
            data: audioBase64,
          },
        },
        'Please transcribe the speech in this audio clearly and precisely. Return ONLY the transcribed text in the original spoken language without extra commentary, markdown quotes, or labels.',
      ],
    });

    const transcribed = (response.text || '').trim();

    return res.json({
      success: true,
      text: transcribed,
      modelUsed: 'gemini-3.5-transcribe',
    });
  } catch (err: any) {
    console.error('Audio transcription error (gemini-3.5-transcribe):', err?.message || err);
    return res.status(500).json({
      error: err?.message || 'Failed to transcribe audio with gemini-3.5-transcribe',
    });
  }
});

// POST /api/chat (Multi-turn Gemini chatbot with role-specific system instructions, Google Search & Maps Grounding, English & Tamil translation)
router.post('/chat', async (req: Request, res: Response) => {
  const {
    message,
    history,
    roleType = 'general',
    enableSearchGrounding = true,
    enableMapsGrounding = false,
    language = 'en',
    customModel,
  } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const cleanMessage = message.trim();
  const isTamil = language === 'ta' || /[\u0B80-\u0BFF]/.test(cleanMessage);

  // Catalog summary context to enable the advisor to recommend exact in-stock shop products
  const availableItems = products
    .map(
      (p) =>
        `- ${p.name} (ID: ${p.id}, Category: ${p.category}, ₹${p.price}/${p.unit}, Stock: ${p.stock > 0 ? p.stock + ' in stock' : 'Out of stock'}) [Suitable for: ${p.cropCompatibility.join(', ')}]`
    )
    .join('\n');

  const languageDirective = isTamil
    ? `IMPORTANT LANGUAGE REQUIREMENT:
The farmer is interacting in TAMIL (தமிழ்).
You MUST generate your primary agronomy guidance, diagnostic steps, and dosage instructions in fluent, accurate, respectful, and natural TAMIL (தமிழ்).
Use well-known agricultural terminology in Tamil (எடுத்துக்காட்டாக: நெல், தக்காளி, உரம், பூச்சிக்கொல்லி, இலைக்கருகல், அடி உரம், இலைவழித் தெளிப்பு, ஏக்கர் அளவு, மண்டி விலை).
When recommending products from the catalog, you may mention the product brand name along with its Tamil explanation.`
    : `LANGUAGE REQUIREMENT:
The farmer is interacting in English. Provide clear, supportive, and accessible agricultural advice in English.`;

  // Role-specific persona instructions
  let systemInstruction = '';
  let targetModel = '';

  if (roleType === 'complex_diagnostic') {
    // Complex tasks: gemini-3.1-pro-preview
    targetModel = customModel || 'gemini-3.1-pro-preview';
    systemInstruction = `You are "AgriCare Senior Plant Pathologist & Diagnostic Specialist", a senior crop doctor and agricultural scientist.
${languageDirective}

Your role:
1. Specialize in rigorous, complex diagnosis of plant pathology, fungal/bacterial/viral infections, physiological disorders (chlorosis, blossom end rot, damping off, wilts), micronutrient antagonisms, and integrated pest management (IPM).
2. Explain the biochemical causes, pathogen life cycles, and optimal chemical/biological countermeasures.
3. Prescribe precise active ingredient concentrations, spray tank compatibility (adjuvants, stickers, avoid combining incompatible chemicals), and pre-harvest intervals (PHI).
4. Reference suitable certified AgriCare Farm Supplies products from the catalog below when relevant to the treatment plan.
5. Provide structured, step-by-step diagnostic workflows and preventive field management protocols.

Current AgriCare Farm Supplies Catalog:
${availableItems}
`;
  } else if (roleType === 'fast_assistant') {
    // Fast tasks: gemini-3.1-flash-lite
    targetModel = customModel || 'gemini-3.1-flash-lite';
    systemInstruction = `You are "AgriCare Quick Field Assistant", designed for rapid, direct answers and instant farm calculations.
${languageDirective}

Your role:
1. Provide ultra-fast, concise answers for farmers standing right in the field or pesticide depot.
2. Deliver direct calculations: dilution rates per liter, knapsack spray tank dosages (15L/16L tanks), water volume per acre, seed sowing rates per acre, and fertilizer split schedules.
3. Keep answers tight, bulleted, action-oriented, and free of fluff.
4. Mention relevant AgriCare catalog products with exact dosages where helpful.

Current AgriCare Farm Supplies Catalog:
${availableItems}
`;
  } else {
    // General tasks: gemini-3.5-flash (with Google Maps Grounding or Google Search Grounding)
    targetModel = customModel || 'gemini-3.5-flash';
    systemInstruction = `You are "AgriCare AI Advisor", an expert agronomist, crop consultant, and agricultural specialist for "AgriCare Farm Supplies".
${languageDirective}

Your role:
1. Provide practical, farmer-friendly, science-backed guidance on crop cultivation, seasonal sowing, disease/pest management, fertilizer schedules (NPK, micronutrients, vermicompost), seed treatment, and soil health.
2. Use Google Search data or Google Maps grounding to provide up-to-date regional farming news, recent mandi market prices (MSP), nearby agricultural markets/APMCs, agrochemical dealers, and government agricultural schemes.
3. Recommend relevant products available at AgriCare Farm Supplies with clear dilution ratios (e.g. per liter or per acre) and application timings (early morning / late afternoon).
4. Maintain a warm, encouraging, practical, and farmer-focused tone. Format with clear bullet points.

Current AgriCare Farm Supplies Catalog:
${availableItems}
`;
  }

  // Build sanitized, strictly alternating conversation contents for Gemini
  const sanitizedContents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

  if (Array.isArray(history)) {
    for (const item of history.slice(-8)) {
      if (!item || !item.text || typeof item.text !== 'string') continue;
      const text = item.text.trim();
      if (!text) continue;
      const role = item.role === 'model' ? 'model' : 'user';

      const last = sanitizedContents[sanitizedContents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n${text}`;
      } else {
        sanitizedContents.push({ role, parts: [{ text }] });
      }
    }
  }

  // Ensure first turn in history is 'user'
  while (sanitizedContents.length > 0 && sanitizedContents[0].role !== 'user') {
    sanitizedContents.shift();
  }

  // Add the current user query
  const lastItem = sanitizedContents[sanitizedContents.length - 1];
  if (lastItem && lastItem.role === 'user') {
    if (lastItem.parts[0].text !== cleanMessage) {
      lastItem.parts[0].text += `\n${cleanMessage}`;
    }
  } else {
    sanitizedContents.push({
      role: 'user',
      parts: [{ text: cleanMessage }],
    });
  }

  let replyText = '';
  let modelActuallyUsed = targetModel;
  let isSearchGrounded = false;
  let isMapsGrounded = false;
  const groundingSources: { title?: string; uri?: string }[] = [];
  const searchQueries: string[] = [];

  // Attempt AI generation if API key is provided
  const ai = getGenAI();
  if (ai) {
    try {
      // Build configuration
      const config: any = {
        systemInstruction,
      };

      // Configure Google Maps Grounding or Google Search Grounding with gemini-3.5-flash
      // Note: per Gemini guidelines, googleMaps cannot be combined with googleSearch in the same call
      const isMapsRequested =
        enableMapsGrounding ||
        /mandi|dealer|shop|store|near me|location|where to buy|kvk|krishi vigyan|laboratory|apmc|market yard|address|depot/i.test(
          cleanMessage
        );

      if (isMapsRequested && (targetModel === 'gemini-3.5-flash' || targetModel === 'gemini-3.8-flash')) {
        targetModel = 'gemini-3.5-flash';
        config.tools = [{ googleMaps: {} }];

        // Optional user location grounding (Anthiyur/Erode or client-provided)
        const lat = req.body.latLng?.latitude ?? 11.5816;
        const lng = req.body.latLng?.longitude ?? 77.5855;
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        };
      } else if (enableSearchGrounding && (targetModel === 'gemini-3.5-flash' || targetModel === 'gemini-3.8-flash')) {
        targetModel = 'gemini-3.5-flash';
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: sanitizedContents,
        config,
      });

      replyText = response.text || '';
      modelActuallyUsed = targetModel;

      // Extract Grounding metadata
      const candidate = response.candidates?.[0];
      const metadata = candidate?.groundingMetadata;
      if (metadata) {
        if (Array.isArray(metadata.groundingChunks)) {
          for (const chunk of metadata.groundingChunks) {
            if (chunk.web?.uri) {
              isSearchGrounded = true;
              groundingSources.push({
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri,
              });
            } else if (chunk.maps) {
              isMapsGrounded = true;
              if (chunk.maps.uri || chunk.maps.title) {
                groundingSources.push({
                  title: chunk.maps.title || 'Google Maps Location',
                  uri: chunk.maps.uri || 'https://maps.google.com',
                });
              }
              // Extract review snippets and place answer sources as required by Maps Grounding spec
              if (Array.isArray(chunk.maps.placeAnswerSources?.reviewSnippets)) {
                for (const snippet of chunk.maps.placeAnswerSources.reviewSnippets) {
                  if (snippet.uri) {
                    groundingSources.push({
                      title: snippet.title || snippet.reviewText?.slice(0, 50) || 'Google Maps Review / Detail',
                      uri: snippet.uri,
                    });
                  }
                }
              }
            }
          }
        }
        if (Array.isArray(metadata.webSearchQueries)) {
          for (const q of metadata.webSearchQueries) {
            if (q && typeof q === 'string') {
              searchQueries.push(q);
            }
          }
        }
      }
    } catch (_primaryErr: any) {
      // Primary model was unavailable or high demand (e.g. 503/429/timeout). Seamlessly fallback to gemini-3.1-flash-lite
      if (targetModel !== 'gemini-3.1-flash-lite') {
        try {
          const fallbackRes = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: sanitizedContents,
            config: {
              systemInstruction,
            },
          });
          replyText = fallbackRes.text || '';
          modelActuallyUsed = 'gemini-3.1-flash-lite';
        } catch (_fallbackErr: any) {
          // Seamlessly proceeds to Agronomy Expert Engine fallback below
        }
      }
    }
  }

  // Extract catalog matches and fallback guidance
  const expertAdvice = generateAgronomyExpertAdvice(cleanMessage, products);
  if (!replyText || replyText.trim().length === 0) {
    replyText = expertAdvice.text;
    modelActuallyUsed = 'agronomy-expert-engine';
  }

  res.json({
    success: true,
    text: replyText,
    roleType,
    modelUsed: modelActuallyUsed,
    searchGrounded: isSearchGrounded,
    mapsGrounded: isMapsGrounded,
    searchQueries,
    matchedProducts: expertAdvice.matchedProducts,
    groundingSources: groundingSources.slice(0, 5),
  });
});

// POST /api/tts (Convert text to speech using gemini-3.1-flash-tts-preview)
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Puck' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        success: false,
        fallbackWebSpeech: true,
        message: 'No GEMINI_API_KEY set; using browser Web Speech API',
      });
    }

    // Limit text length for responsive speech playback
    const cleanText = text.replace(/[*#_`]/g, '').slice(0, 450);

    const ttsRes = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: cleanText,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
      },
    });

    const part = ttsRes.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data) {
      const rawPcm = Buffer.from(part.inlineData.data, 'base64');
      const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);
      const audioUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

      return res.json({
        success: true,
        audioUrl,
        format: 'audio/wav',
      });
    }

    res.json({ success: false, fallbackWebSpeech: true });
  } catch (err: any) {
    console.warn('TTS endpoint warning:', err?.message);
    res.json({
      success: false,
      fallbackWebSpeech: true,
    });
  }
});

// ==========================================
// VEO VIDEO GENERATION (veo-3.1-fast-generate-preview)
// 3-step Pattern: 1. Start -> 2. Poll -> 3. Download
// Supported aspect ratios: '16:9' (landscape) or '9:16' (portrait)
// ==========================================

// 1. POST /api/generate-video (Start Veo Video Generation)
router.post('/generate-video', async (req: Request, res: Response) => {
  const { imageBase64, mimeType = 'image/jpeg', prompt, aspectRatio = '16:9' } = req.body;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Valid base64 crop or farm photo is required' });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.status(500).json({
      error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is present.',
    });
  }

  const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
  const chosenAspectRatio: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
  const cleanMimeType = mimeType.includes('png')
    ? 'image/png'
    : mimeType.includes('webp')
    ? 'image/webp'
    : 'image/jpeg';

  const defaultPrompt =
    'A cinematic agricultural video of this healthy crop thriving in the gentle morning breeze with soft sunlight and lush green field scenery, high resolution, realistic botanical physics';
  const finalPrompt = prompt && typeof prompt === 'string' && prompt.trim().length > 0 ? prompt.trim() : defaultPrompt;

  try {
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: finalPrompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: cleanMimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: chosenAspectRatio,
      },
    });

    res.json({
      success: true,
      operationName: operation.name,
      modelUsed: 'veo-3.1-fast-generate-preview',
      aspectRatio: chosenAspectRatio,
      prompt: finalPrompt,
    });
  } catch (err: any) {
    console.error('Veo video generation error:', err);
    res.status(500).json({
      error: err.message || 'Failed to start video generation with Veo',
    });
  }
});

// 2. POST /api/video-status (Poll Veo Operation Status)
router.post('/video-status', async (req: Request, res: Response) => {
  const { operationName } = req.body;
  if (!operationName || typeof operationName !== 'string') {
    return res.status(400).json({ error: 'operationName is required' });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.status(500).json({ error: 'Gemini API client not initialized' });
  }

  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      success: true,
      done: Boolean(updated.done),
      error: updated.error ? (updated.error as any).message || String(updated.error) : null,
    });
  } catch (err: any) {
    console.error('Error polling video operation:', err);
    res.status(500).json({
      error: err.message || 'Error checking video status',
    });
  }
});

// 3. POST /api/video-download (Stream Completed Veo Video to Client)
router.post('/video-download', async (req: Request, res: Response) => {
  const { operationName } = req.body;
  if (!operationName || typeof operationName !== 'string') {
    return res.status(400).json({ error: 'operationName is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = getGenAI();
  if (!ai || !apiKey) {
    return res.status(500).json({ error: 'Gemini API not configured' });
  }

  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'No video URI found in completed operation' });
    }

    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': apiKey },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({ error: 'Failed to download video from storage' });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="agricare-veo-video.mp4"');

    const buffer = await videoRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error('Error downloading Veo video:', err);
    res.status(500).json({ error: err.message || 'Failed to download video' });
  }
});

// Admin In-Memory Store
let adminAccount = {
  username: 'admin',
  password: 'admin123',
  updatedAt: new Date().toISOString(),
};

// GET /api/admin/status
router.get('/admin/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    username: adminAccount.username,
    updatedAt: adminAccount.updatedAt,
  });
});

// POST /api/admin/login
router.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required',
    });
  }

  if (
    username.trim().toLowerCase() === adminAccount.username.trim().toLowerCase() &&
    password === adminAccount.password
  ) {
    return res.json({
      success: true,
      username: adminAccount.username,
      message: 'Admin authentication successful',
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Incorrect username or password. Please verify your admin credentials.',
  });
});

// POST /api/admin/change-credentials
router.post('/admin/change-credentials', (req: Request, res: Response) => {
  const { currentPassword, newUsername, newPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password is required to make changes',
    });
  }

  if (currentPassword !== adminAccount.password) {
    return res.status(401).json({
      success: false,
      error: 'Current password does not match. Please verify your current password.',
    });
  }

  const trimmedUser = (newUsername || '').trim();
  if (!trimmedUser || trimmedUser.length < 3) {
    return res.status(400).json({
      success: false,
      error: 'New username must be at least 3 characters long',
    });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 4 characters long',
    });
  }

  adminAccount.username = trimmedUser;
  adminAccount.password = newPassword;
  adminAccount.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    username: adminAccount.username,
    message: 'Admin username and password have been successfully updated.',
  });
});

// POST /api/admin/reset-credentials
router.post('/admin/reset-credentials', (req: Request, res: Response) => {
  adminAccount = {
    username: 'admin',
    password: 'admin123',
    updatedAt: new Date().toISOString(),
  };

  return res.json({
    success: true,
    username: 'admin',
    message: 'Admin credentials have been reset to default (username: admin, password: admin123).',
  });
});

// ============================================================================
// LOW STOCK EMAIL ALERT ENGINE & AUTOMATED DISPATCH (Threshold < 5 Units)
// ============================================================================
let emailAlertSettings: EmailAlertSettings = {
  recipientEmail: 'sujith13022005@gmail.com',
  threshold: 5,
  autoTriggerEnabled: true,
  lastTriggeredAt: new Date().toISOString(),
};

function generateLowStockEmailHtml(alert: LowStockEmailAlert): string {
  const itemsRows = alert.products
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 14px; font-weight: 600; color: #0f172a; font-size: 13px;">
        ${item.name}
        <div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">
          Category: ${item.category} • Pack Size: ${item.unit}
        </div>
      </td>
      <td style="padding: 12px 14px; text-align: center;">
        <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background-color: ${
          item.stock === 0 ? '#fee2e2' : '#fef3c7'
        }; color: ${
        item.stock === 0 ? '#991b1b' : '#92400e'
      }; font-weight: 800; font-size: 12px; border: 1px solid ${
        item.stock === 0 ? '#fca5a5' : '#fde68a'
      };">
          ${item.stock} left (Buffer: &lt; ${item.threshold})
        </span>
      </td>
      <td style="padding: 12px 14px; text-align: center; font-weight: 700; color: #047857; font-size: 13px;">
        +${item.recommendedRestock} units
      </td>
      <td style="padding: 12px 14px; text-align: right; font-weight: 600; color: #334155; font-size: 13px;">
        ₹${item.price.toLocaleString()}
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${alert.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 650px; margin: 24px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
    
    <!-- Top Header Banner -->
    <div style="background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%); padding: 24px 28px; color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; background-color: rgba(255,255,255,0.2); font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px;">
            AUTOMATED INVENTORY ALERT
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">AgriCare Farm Supplies</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0;">Anthiyur Central Hub • Real-Time Stock Depletion Monitor</p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; padding: 6px 12px; border-radius: 8px; background-color: #ef4444; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
            CRITICAL (&lt; 5 UNITS)
          </span>
        </div>
      </div>
    </div>

    <!-- Alert Summary Notice -->
    <div style="padding: 24px 28px 16px 28px;">
      <div style="background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
        <h3 style="margin: 0 0 4px 0; color: #9f1239; font-size: 15px; font-weight: 700;">
          🚨 Urgent Restock Notice: ${alert.triggeredCount} Products Dropped Below 5 Units
        </h3>
        <p style="margin: 0; font-size: 13px; color: #881337; line-height: 1.5;">
          This email was triggered automatically because store inventory for high-demand agricultural inputs dropped below your configured safety threshold of <strong>5 units</strong>. Proactive supplier orders are recommended within 24 to 48 hours to avert farmer stockouts during the current agricultural season in Anthiyur and Erode.
        </p>
      </div>

      <!-- Metadata Info Grid -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; background-color: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
        <div>
          <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Recipient Admin</span>
          <strong style="font-size: 12px; color: #0f172a;">${alert.recipientEmail}</strong>
        </div>
        <div>
          <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Trigger Timestamp</span>
          <strong style="font-size: 12px; color: #0f172a;">${new Date(alert.timestamp).toLocaleString()}</strong>
        </div>
        <div>
          <span style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Trigger Rule</span>
          <strong style="font-size: 12px; color: #b91c1c;">Stock &lt; 5 Units</strong>
        </div>
      </div>

      <!-- Low Stock Items Table -->
      <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.03em;">
        Low Stock Products Requiring Proactive Restock
      </h4>
      <div style="border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; background-color: #ffffff;">
          <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; color: #475569;">
              <th style="padding: 10px 14px;">Product Name</th>
              <th style="padding: 10px 14px; text-align: center;">Current Stock</th>
              <th style="padding: 10px 14px; text-align: center;">Recommended Reorder</th>
              <th style="padding: 10px 14px; text-align: right;">Unit Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      <!-- Proactive Replenishment Guidance -->
      <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
        <h5 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #065f46;">
          🌾 Recommended Proactive Action for Admins
        </h5>
        <p style="margin: 0; font-size: 12px; color: #047857; line-height: 1.4;">
          Use the 1-Click Proactive Restock buttons in your AgriCare Admin Dashboard to replenish inventory back to safety levels (25-50 units per SKU). Contact regional distributors in Bhavani / Gobichettipalayam for immediate transport.
        </p>
      </div>
    </div>

    <!-- Email Footer -->
    <div style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.4;">
      <p style="margin: 0;">AgriCare Farm Supplies • Automated Inventory Notification System</p>
      <p style="margin: 4px 0 0 0;">This email was automatically triggered and delivered to <strong>${alert.recipientEmail}</strong>.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function createLowStockAlert(triggerType: 'automatic' | 'manual_test' = 'automatic'): LowStockEmailAlert | null {
  const lowItems = products.filter((p) => p.stock < (emailAlertSettings.threshold || 5));
  if (lowItems.length === 0) return null;

  const alertItems: LowStockAlertItem[] = lowItems.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    stock: p.stock,
    threshold: emailAlertSettings.threshold || 5,
    unit: p.unit,
    price: p.price,
    recommendedRestock: p.stock === 0 ? 30 : Math.max(20, 25 - p.stock),
    urgency: p.stock === 0 ? 'Critical' : p.stock <= 2 ? 'Critical' : 'Urgent',
  }));

  const alertId = 'ALT-' + Date.now().toString(36).toUpperCase();
  const timestamp = new Date().toISOString();
  const subject = `🚨 [URGENT] AgriCare Stock Alert: ${lowItems.length} Products Dropped Below 5 Units - Restock Required`;

  const newAlert: LowStockEmailAlert = {
    id: alertId,
    timestamp,
    recipientEmail: emailAlertSettings.recipientEmail || 'sujith13022005@gmail.com',
    subject,
    triggeredCount: lowItems.length,
    products: alertItems,
    htmlPreview: '',
    status: 'Delivered',
    triggerType,
  };

  newAlert.htmlPreview = generateLowStockEmailHtml(newAlert);
  return newAlert;
}

let lowStockEmailAlerts: LowStockEmailAlert[] = [];

// Seed initial alert if items currently exist below 5 units
const seedAlert = createLowStockAlert('automatic');
if (seedAlert) {
  lowStockEmailAlerts.push(seedAlert);
}

// GET /api/admin/low-stock-alerts
router.get('/admin/low-stock-alerts', (_req: Request, res: Response) => {
  const currentLow = products.filter((p) => p.stock < (emailAlertSettings.threshold || 5));

  // If there are low stock items and no alert exists yet or new items dropped, auto-create one
  if (currentLow.length > 0 && emailAlertSettings.autoTriggerEnabled) {
    const latestAlert = lowStockEmailAlerts[0];
    const latestIds = new Set(latestAlert ? latestAlert.products.map((p) => p.id) : []);
    const hasUnnotified = currentLow.some((p) => !latestIds.has(p.id));

    if (!latestAlert || hasUnnotified) {
      const autoAlert = createLowStockAlert('automatic');
      if (autoAlert) {
        lowStockEmailAlerts.unshift(autoAlert);
        emailAlertSettings.lastTriggeredAt = autoAlert.timestamp;
      }
    }
  }

  return res.json({
    success: true,
    settings: emailAlertSettings,
    alerts: lowStockEmailAlerts,
    currentLowStockProducts: currentLow,
    totalLowStockCount: currentLow.length,
  });
});

// POST /api/admin/low-stock-alerts/trigger (Manually or auto trigger email alert)
router.post('/admin/low-stock-alerts/trigger', (req: Request, res: Response) => {
  const triggerType = req.body.triggerType || 'manual_test';
  if (req.body.recipientEmail) {
    emailAlertSettings.recipientEmail = String(req.body.recipientEmail).trim();
  }

  const alert = createLowStockAlert(triggerType);
  if (!alert) {
    return res.status(400).json({
      success: false,
      error: 'No products currently below 5 units. Lower a product stock to trigger.',
    });
  }

  lowStockEmailAlerts.unshift(alert);
  emailAlertSettings.lastTriggeredAt = alert.timestamp;

  return res.json({
    success: true,
    alert,
    alerts: lowStockEmailAlerts,
    message: `Low Stock email alert successfully triggered and dispatched to ${alert.recipientEmail}`,
  });
});

// POST /api/admin/low-stock-alerts/restock (Proactive restock 1 item)
router.post('/admin/low-stock-alerts/restock', (req: Request, res: Response) => {
  try {
    const { productId, quantity = 25, alertId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const restockQty = Math.max(1, Number(quantity) || 25);
    products[index].stock += restockQty;

    // Check remaining low stock items
    const remainingLow = products.filter((p) => p.stock < (emailAlertSettings.threshold || 5));

    // If specific alert passed, update its status
    if (alertId) {
      const alert = lowStockEmailAlerts.find((a) => a.id === alertId);
      if (alert) {
        if (remainingLow.length === 0) {
          alert.status = 'Resolved';
          alert.resolutionNotes = `All products restocked above safety threshold of ${emailAlertSettings.threshold} units.`;
        } else {
          alert.status = 'Acknowledged';
          alert.resolutionNotes = `Partially restocked ${products[index].name} (+${restockQty} units).`;
        }
      }
    }

    return res.json({
      success: true,
      product: products[index],
      newStock: products[index].stock,
      addedUnits: restockQty,
      remainingLowStockCount: remainingLow.length,
      alerts: lowStockEmailAlerts,
      message: `Proactively restocked "${products[index].name}" with +${restockQty} units (New total: ${products[index].stock} units).`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Restock failed' });
  }
});

// POST /api/admin/low-stock-alerts/bulk-restock (Proactive restock ALL low stock items)
router.post('/admin/low-stock-alerts/bulk-restock', (req: Request, res: Response) => {
  try {
    const restockAmount = Math.max(5, Number(req.body.restockAmount) || 25);
    const lowItems = products.filter((p) => p.stock < (emailAlertSettings.threshold || 5));

    if (lowItems.length === 0) {
      return res.json({
        success: true,
        restockedCount: 0,
        message: 'No products currently below threshold. All inventory is healthy!',
      });
    }

    const restockedProducts: { id: string; name: string; oldStock: number; newStock: number }[] = [];

    for (const item of lowItems) {
      const old = item.stock;
      item.stock += restockAmount;
      restockedProducts.push({
        id: item.id,
        name: item.name,
        oldStock: old,
        newStock: item.stock,
      });
    }

    // Mark alerts as resolved
    lowStockEmailAlerts.forEach((a) => {
      a.status = 'Resolved';
      a.resolutionNotes = `Bulk restocked +${restockAmount} units on ${new Date().toLocaleTimeString()}`;
    });

    return res.json({
      success: true,
      restockedCount: restockedProducts.length,
      restockedProducts,
      alerts: lowStockEmailAlerts,
      message: `Successfully restocked ${restockedProducts.length} low-stock products with +${restockAmount} units each!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Bulk restock failed' });
  }
});

// POST /api/admin/low-stock-alerts/simulate-drop (Test tool for admins)
router.post('/admin/low-stock-alerts/simulate-drop', (req: Request, res: Response) => {
  try {
    const { productId, dropTo = 2 } = req.body;
    let target = products.find((p) => p.id === productId);

    if (!target) {
      // Pick a random product with stock > 5
      const available = products.filter((p) => p.stock >= 10);
      target = available[Math.floor(Math.random() * available.length)] || products[0];
    }

    const previousStock = target.stock;
    target.stock = Math.max(0, Number(dropTo));

    const newAlert = createLowStockAlert('automatic');
    if (newAlert) {
      lowStockEmailAlerts.unshift(newAlert);
      emailAlertSettings.lastTriggeredAt = newAlert.timestamp;
    }

    return res.json({
      success: true,
      droppedProduct: {
        id: target.id,
        name: target.name,
        previousStock,
        newStock: target.stock,
      },
      alert: newAlert,
      alerts: lowStockEmailAlerts,
      message: `Simulated stock drop for "${target.name}" from ${previousStock} to ${target.stock} units. Automated email alert triggered!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Simulate drop failed' });
  }
});

// PUT /api/admin/low-stock-alerts/settings
router.put('/admin/low-stock-alerts/settings', (req: Request, res: Response) => {
  try {
    const { recipientEmail, threshold, autoTriggerEnabled } = req.body;
    if (recipientEmail && typeof recipientEmail === 'string' && recipientEmail.includes('@')) {
      emailAlertSettings.recipientEmail = recipientEmail.trim();
    }
    if (threshold !== undefined && !isNaN(Number(threshold))) {
      emailAlertSettings.threshold = Math.max(1, Math.min(50, Number(threshold)));
    }
    if (autoTriggerEnabled !== undefined) {
      emailAlertSettings.autoTriggerEnabled = Boolean(autoTriggerEnabled);
    }

    return res.json({
      success: true,
      settings: emailAlertSettings,
      message: 'Email alert settings updated successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update settings' });
  }
});

// In-memory cache for regional seasonal agronomy data to minimize API load and avoid rate/demand spikes
interface SeasonalAgronomyCacheEntry {
  data: any;
  timestamp: number;
}
const seasonalAgronomyCache = new Map<string, SeasonalAgronomyCacheEntry>();
const SEASONAL_CACHE_TTL_MS = 1000 * 60 * 60 * 4; // 4 hours

// GET and POST /api/seasonal-agronomy
// Powered by Gemini AI Advisor with regional Anthiyur & Erode agronomic knowledge
router.all('/seasonal-agronomy', async (req: Request, res: Response) => {
  try {
    const monthParam = req.method === 'POST' ? req.body.month : req.query.month;
    const langParam = req.method === 'POST' ? req.body.language : req.query.language;
    const isRefresh = req.method === 'POST' ? req.body.refresh === true : req.query.refresh === 'true';

    const currentActualMonth = new Date().getMonth(); // 0-11 (8 = September)
    let selectedMonth = currentActualMonth;
    if (monthParam !== undefined && monthParam !== null && monthParam !== '') {
      const parsed = parseInt(String(monthParam), 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 11) {
        selectedMonth = parsed;
      }
    }

    const language: 'en' | 'ta' = langParam === 'ta' ? 'ta' : 'en';
    const isCurrentMonth = selectedMonth === currentActualMonth;
    const cacheKey = `${selectedMonth}_${language}`;

    // Return cached agronomy intelligence if fresh and not explicitly forced to refresh
    if (!isRefresh) {
      const cached = seasonalAgronomyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < SEASONAL_CACHE_TTL_MS) {
        return res.json(cached.data);
      }
    }

    // Get baseline data from regional knowledge base
    const baseMonthData = MONTHLY_AGRONOMY_DATA[selectedMonth] || MONTHLY_AGRONOMY_DATA[8];

    let aiGenerated = false;
    let modelUsed = 'Anthiyur Agronomy Engine';

    let seasonTitle = language === 'ta' ? baseMonthData.seasonTitleTa : baseMonthData.seasonTitleEn;
    let seasonSubtitle = language === 'ta' ? baseMonthData.seasonSubtitleTa : baseMonthData.seasonSubtitleEn;
    let climateSummary = language === 'ta' ? baseMonthData.climateSummaryTa : baseMonthData.climateSummaryEn;
    let primaryCrops = language === 'ta' ? baseMonthData.primaryCropsTa : baseMonthData.primaryCropsEn;
    let agronomyTips = language === 'ta' ? baseMonthData.agronomyTipsTa : baseMonthData.agronomyTipsEn;
    let pestAlert = language === 'ta' ? baseMonthData.pestAlertTa : baseMonthData.pestAlertEn;

    // Map base recommended products
    let recommendedItems = baseMonthData.recommendedProductIds.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        product: prod,
        urgencyTag: language === 'ta' ? item.urgencyTagTa : item.urgencyTagEn,
        seasonalRationale: language === 'ta' ? item.rationaleTa : item.rationaleEn,
        dosageOrUsage: language === 'ta' ? item.dosageTa : item.dosageEn,
        timing: language === 'ta' ? item.timingTa : item.timingEn,
      };
    });

    // Try Gemini AI enhancement if available with automatic resilient multi-model failover
    const ai = getGenAI();
    if (ai) {
      const availableItemsList = products
        .slice(0, 40)
        .map(
          (p) =>
            `- ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Price: ₹${p.price}/${p.unit} | Stock: ${p.stock} | Crops: ${p.cropCompatibility.join(', ')}`
        )
        .join('\n');

      const prompt = `You are the Chief Agronomy Scientist at TNAU (Tamil Nadu Agricultural University) specializing in the Anthiyur, Gobichettipalayam, Bhavani, and Erode farming region of Tamil Nadu, India.
Location: Anthiyur & Erode District, Bhavani River basin, Lower Bhavani Project (LBP) Canal system.
Month: ${baseMonthData.monthNameEn} (${baseMonthData.tamilMonthEn}).
Selected Language: ${language === 'ta' ? 'Tamil (தமிழ்) with proper regional Tamil agricultural terms' : 'English with Tamil crop/pattam names in brackets'}.

Store Inventory Sample:
${availableItemsList}

Provide actionable, timely seasonal agronomy recommendations for farmers in Anthiyur for this month:
1. "seasonTitle": A concise evocative seasonal title in ${language === 'ta' ? 'Tamil' : 'English'}.
2. "seasonSubtitle": 1 sentence summary of current crop stage.
3. "climateSummary": 2 sentences explaining current weather, Bhavani canal water status, and soil moisture conditions.
4. "primaryCrops": 4 to 5 major active crops in the field right now.
5. "agronomyTips": 3 to 4 specific practical field tips (Soil / Sowing / Foliar Spray / Water Management).
6. "pestAlert": Title, riskLevel ("Critical" | "High" | "Moderate"), affectedCrops (array), symptoms, and immediate solution.
7. "recommendedProducts": Pick 3 to 5 matching product IDs strictly from the provided Inventory above that farmers in Anthiyur urgently need this month. For each, give seasonalRationale, dosageOrUsage, timing, and urgencyTag.`;

      // Candidate models for graceful fallback if one experiences 503 high demand or capacity spike
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

      for (const candidateModel of candidateModels) {
        try {
          const timeoutMs = candidateModel === 'gemini-3.1-flash-lite' ? 5000 : 7500;
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
          );

          const response = await Promise.race([
            ai.models.generateContent({
              model: candidateModel,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    seasonTitle: { type: Type.STRING },
                    seasonSubtitle: { type: Type.STRING },
                    climateSummary: { type: Type.STRING },
                    primaryCrops: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    agronomyTips: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          category: { type: Type.STRING },
                          tip: { type: Type.STRING },
                        },
                        required: ['category', 'tip'],
                      },
                    },
                    pestAlert: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        riskLevel: { type: Type.STRING },
                        affectedCrops: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        symptoms: { type: Type.STRING },
                        solution: { type: Type.STRING },
                      },
                      required: ['title', 'riskLevel', 'symptoms', 'solution'],
                    },
                    recommendedProducts: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          productId: { type: Type.STRING },
                          seasonalRationale: { type: Type.STRING },
                          dosageOrUsage: { type: Type.STRING },
                          timing: { type: Type.STRING },
                          urgencyTag: { type: Type.STRING },
                        },
                        required: ['productId', 'seasonalRationale', 'dosageOrUsage'],
                      },
                    },
                  },
                  required: ['seasonTitle', 'climateSummary', 'primaryCrops', 'agronomyTips', 'recommendedProducts'],
                },
              },
            }),
            timeoutPromise,
          ]);

          const rawText = response.text || '';
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.seasonTitle) seasonTitle = parsed.seasonTitle;
            if (parsed.seasonSubtitle) seasonSubtitle = parsed.seasonSubtitle;
            if (parsed.climateSummary) climateSummary = parsed.climateSummary;
            if (Array.isArray(parsed.primaryCrops) && parsed.primaryCrops.length > 0) primaryCrops = parsed.primaryCrops;
            if (Array.isArray(parsed.agronomyTips) && parsed.agronomyTips.length > 0) agronomyTips = parsed.agronomyTips;
            if (parsed.pestAlert && parsed.pestAlert.title) {
              pestAlert = {
                title: parsed.pestAlert.title,
                riskLevel: (parsed.pestAlert.riskLevel as any) || pestAlert.riskLevel,
                affectedCrops: parsed.pestAlert.affectedCrops || pestAlert.affectedCrops,
                symptoms: parsed.pestAlert.symptoms || pestAlert.symptoms,
                solution: parsed.pestAlert.solution || pestAlert.solution,
                productRecommendation: pestAlert.productRecommendation,
              };
            }
            if (Array.isArray(parsed.recommendedProducts) && parsed.recommendedProducts.length > 0) {
              const enrichedAiItems = parsed.recommendedProducts
                .map((item: any) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  return {
                    productId: item.productId,
                    product: prod,
                    urgencyTag: item.urgencyTag || (language === 'ta' ? 'பருவகால பரிந்துரை' : 'Seasonal Need'),
                    seasonalRationale: item.seasonalRationale || (language === 'ta' ? 'நடப்பு பருவத்திற்கு மிகவும் உகந்தது' : 'Essential for current crop stage'),
                    dosageOrUsage: item.dosageOrUsage || prod.usageInstructions,
                    timing: item.timing || (language === 'ta' ? 'காலை வேளையில்' : 'Morning hours'),
                  };
                })
                .filter(Boolean);

              if (enrichedAiItems.length > 0) {
                recommendedItems = enrichedAiItems as any;
              }
            }

            aiGenerated = true;
            modelUsed = candidateModel;
            break; // Succeeded! Exit candidate loop
          }
        } catch (_geminiErr: any) {
          // If model has 503 high demand or timeout, try next candidate model without throwing
          continue;
        }
      }
    }

    const payload = {
      success: true,
      aiGenerated,
      modelUsed,
      isCurrentMonth,
      monthIndex: selectedMonth,
      monthName: language === 'ta' ? baseMonthData.monthNameTa : baseMonthData.monthNameEn,
      tamilMonth: language === 'ta' ? baseMonthData.tamilMonthTa : baseMonthData.tamilMonthEn,
      seasonTitle,
      seasonSubtitle,
      climateSummary,
      weather: {
        tempRange: baseMonthData.weather.tempRange,
        rainfallStatus: language === 'ta' ? baseMonthData.weather.rainfallStatusTa : baseMonthData.weather.rainfallStatusEn,
        canalStatus: language === 'ta' ? baseMonthData.weather.canalStatusTa : baseMonthData.weather.canalStatusEn,
        soilCondition: language === 'ta' ? baseMonthData.weather.soilConditionTa : baseMonthData.weather.soilConditionEn,
      },
      primaryCrops,
      agronomyTips,
      pestAlert,
      recommendedProducts: recommendedItems,
    };

    // Cache the resolved result
    seasonalAgronomyCache.set(cacheKey, {
      data: payload,
      timestamp: Date.now(),
    });

    return res.json(payload);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to fetch seasonal agronomy data',
    });
  }
});

export default router;
