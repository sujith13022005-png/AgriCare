import { ANTHIYUR_TRANSLATIONS_TA } from './anthiyurTranslationsTa';

export type Language = 'en' | 'ta';

export interface Translations {
  // Common
  close: string;
  stop: string;
  listenAloud: string;
  loadingVoice: string;
  free: string;
  total: string;
  deliveryFee: string;
  farmerDiscount: string;
  lowStock: string;
  inCart: string;
  featured: string;
  highestRated: string;
  suitableFor: string;
  usageAndDosage: string;

  // Cart Helpers
  cartTitle: string;
  emptyCart: string;
  emptyCartMessage: string;
  browseCatalog: string;

  // Brand & Nav
  brandName: string;
  brandTagline: string;
  home: string;
  catalog: string;
  cart: string;
  admin: string;
  advisor: string;
  searchPlaceholder: string;
  langEnglish: string;
  langTamil: string;
  selectLanguage: string;
  toggleTheme: string;

  // Categories
  allSupplies: string;
  seeds: string;
  fertilizers: string;
  pesticides: string;
  farmTools: string;
  organicNutrients: string;

  // Hero Section
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  exploreCatalog: string;
  askAdvisor: string;
  trustBadge1: string;
  trustBadge1Desc: string;
  trustBadge2: string;
  trustBadge2Desc: string;
  trustBadge3: string;
  trustBadge3Desc: string;

  // Filter Bar
  inStockOnly: string;
  sortBy: string;
  featuredFirst: string;
  priceLowHigh: string;
  priceHighLow: string;
  ratingHigh: string;
  showingProducts: string;
  matchingSearch: string;
  resetFilters: string;
  noProductsFound: string;
  noProductsDesc: string;

  // Product Card
  inStock: string;
  outOfStock: string;
  lowStockBadge: string;
  lowStockNotice: string;
  orderFast: string;
  addToCart: string;
  claimNow: string;
  inCartCount: string;
  maxStockReached: string;
  currentlyOutOfStock: string;
  specifications: string;
  bioCertified: string;
  topSeller: string;
  formulaMatch: string;
  listenDosage: string;

  // Product Detail Modal
  categoryLabel: string;
  packUnitLabel: string;
  availabilityLabel: string;
  unitsLeft: string;
  unitsAvailable: string;
  highDemandWarning: string;
  cropsSuitable: string;
  applicationUsage: string;
  activeComposition: string;
  safetyStorage: string;
  audioReader: string;
  poweredByGemini: string;
  listenToTips: string;
  stopAudio: string;
  loadingAudio: string;
  quantityLabel: string;
  addToCartTotal: string;

  // Cart Drawer
  yourCart: string;
  itemsInCart: string;
  emptyCartTitle: string;
  emptyCartDesc: string;
  browseSupplies: string;
  subtotal: string;
  delivery: string;
  freeDelivery: string;
  discount: string;
  totalAmount: string;
  proceedToCheckout: string;
  clearCart: string;

  // Checkout Modal
  checkoutTitle: string;
  checkoutSubtitle: string;
  farmerInfo: string;
  fullName: string;
  fullNamePlaceholder: string;
  phoneNumber: string;
  phonePlaceholder: string;
  villageTown: string;
  villagePlaceholder: string;
  deliveryAddress: string;
  addressPlaceholder: string;
  pincode: string;
  pincodePlaceholder: string;
  paymentMethod: string;
  codOption: string;
  codDesc: string;
  upiOption: string;
  upiDesc: string;
  netBankingOption: string;
  specialDeliveryNote: string;
  notePlaceholder: string;
  orderSummary: string;
  placeOrderBtn: string;
  placingOrder: string;
  orderSuccessTitle: string;
  orderSuccessMsg: string;
  orderIdLabel: string;
  continueShopping: string;

  // AI Advisor / Chatbot
  advisorTitle: string;
  advisorSubtitle: string;
  personaLabel: string;
  generalAgronomist: string;
  generalDesc: string;
  pathologist: string;
  pathologistDesc: string;
  fieldAssistant: string;
  fieldDesc: string;
  liveSearchToggle: string;
  mapsGroundingToggle: string;
  typeQuestionPlaceholder: string;
  voiceButtonTitle: string;
  listeningVoice: string;
  transcribingVoice: string;
  quickQuestionsTitle: string;
  sampleQ1: string;
  sampleQ2: string;
  sampleQ3: string;
  sampleQ4: string;
  copyGuidance: string;
  copied: string;
  listenAudio: string;
  sourcesLabel: string;
  clearConversation: string;

  // Admin Dashboard
  adminPanel: string;
  inventoryOverview: string;
  totalProducts: string;
  lowStockItems: string;
  outOfStockItems: string;
  totalOrders: string;
  addProduct: string;
  restockAlertTitle: string;
  backToStore: string;
  logout: string;
  changePassword: string;
}

export type TranslationKey = keyof Translations;

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Common
    close: 'Close',
    stop: 'Stop',
    listenAloud: 'Listen Aloud',
    loadingVoice: 'Synthesizing voice...',
    free: 'FREE',
    total: 'Total Payable',
    deliveryFee: 'Village Delivery Fee',
    farmerDiscount: 'Special Farmer Discount',
    lowStock: 'Low Stock',
    inCart: 'In Cart',
    featured: 'Featured First',
    highestRated: 'Highest Rated',
    suitableFor: 'Recommended Crops',
    usageAndDosage: 'Application & Dosage Guidelines',

    // Cart Helpers
    cartTitle: 'Your Farm Cart',
    emptyCart: 'Your cart is empty',
    emptyCartMessage: 'Browse our high-quality certified seeds, fertilizers, and farm tools to add items to your cart.',
    browseCatalog: 'Browse Farm Catalog',

    // Brand & Nav
    brandName: 'AgriCare',
    brandTagline: 'Modern Agricultural Commerce & Agronomy Advisory',
    home: 'Home',
    catalog: 'Products',
    cart: 'Cart',
    admin: 'Admin',
    advisor: 'AI Advisor',
    searchPlaceholder: 'Search seeds, fertilizers, pesticides, tools, crop names...',
    langEnglish: 'English',
    langTamil: 'தமிழ்',
    selectLanguage: 'Select Language',
    toggleTheme: 'Toggle theme',

    // Categories
    allSupplies: 'All Supplies',
    seeds: 'Seeds',
    fertilizers: 'Fertilizers',
    pesticides: 'Pesticides',
    farmTools: 'Farm Tools',
    organicNutrients: 'Organic Nutrients',

    // Hero Section
    heroTitle: 'Premium Farm Supplies Delivered Directly to Your Village',
    heroHighlight: 'Farm-Fresh Productivity',
    heroSubtitle: 'Certified hybrid seeds, high-solubility fertilizers, organic bio-nutrients & equipment with instant bilingual AI agronomy guidance.',
    exploreCatalog: 'Explore Catalog',
    askAdvisor: 'Ask AI Agronomist',
    trustBadge1: '100% Certified Quality',
    trustBadge1Desc: 'Genuine laboratory-tested seeds & genuine bio-inputs.',
    trustBadge2: 'Village Direct Logistics',
    trustBadge2Desc: 'Direct delivery across 12,000+ agricultural PIN codes.',
    trustBadge3: 'Bilingual AI Advisory',
    trustBadge3Desc: 'Dosage calculations & crop disease diagnosis in English & Tamil.',

    // Filter Bar
    inStockOnly: 'In-Stock Only',
    sortBy: 'Sort By',
    featuredFirst: 'Featured First',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    ratingHigh: 'Highest Rated',
    showingProducts: 'Showing {count} verified farm products',
    matchingSearch: 'matching "{query}"',
    resetFilters: 'Reset Filters',
    noProductsFound: 'No Matching Products',
    noProductsDesc: "We couldn't find any products matching your filters. Try clearing your search or selecting a different category.",

    // Product Card
    inStock: 'In Stock',
    outOfStock: 'Sold Out',
    lowStockBadge: 'Low Stock ({count})',
    lowStockNotice: 'Only {count} left in depot!',
    orderFast: 'Order Fast',
    addToCart: 'Add to Cart',
    claimNow: 'Claim Now • Only {count} Left',
    inCartCount: '{count} in cart',
    maxStockReached: 'Max available stock ({count}) in cart',
    currentlyOutOfStock: 'Currently Out of Stock',
    specifications: 'Specifications & Usage',
    bioCertified: 'Bio Certified',
    topSeller: 'Top Seller',
    formulaMatch: 'Formula match:',
    listenDosage: 'Listen to usage dosage & crop tips via Gemini Voice',

    // Product Detail Modal
    categoryLabel: 'Category:',
    packUnitLabel: 'Pack / Unit:',
    availabilityLabel: 'Availability:',
    unitsLeft: 'Low Stock: Only {count} units remaining',
    unitsAvailable: '{count} units available',
    highDemandWarning: 'High Demand Item: Stock is under 5 units. Please complete your order promptly to secure your quantity.',
    cropsSuitable: 'Recommended Crops',
    applicationUsage: 'Application & Dosage Guidelines',
    activeComposition: 'Active Chemical / Organic Formula',
    safetyStorage: 'Safety, Handling & Storage',
    audioReader: 'Audio Farmer Reader',
    poweredByGemini: 'Powered by Gemini 3.1 TTS',
    listenToTips: 'Listen to Dosage Directions',
    stopAudio: 'Stop Audio Playback',
    loadingAudio: 'Synthesizing voice...',
    quantityLabel: 'Quantity:',
    addToCartTotal: 'Add {qty} to Cart • {price}',

    // Cart Drawer
    yourCart: 'Your Farm Cart',
    itemsInCart: '{count} items selected',
    emptyCartTitle: 'Your cart is empty',
    emptyCartDesc: 'Browse our high-quality certified seeds, fertilizers, and farm tools to add items to your cart.',
    browseSupplies: 'Browse Farm Catalog',
    subtotal: 'Subtotal',
    delivery: 'Village Delivery Fee',
    freeDelivery: 'FREE',
    discount: 'Special Farmer Discount',
    totalAmount: 'Total Payable',
    proceedToCheckout: 'Proceed to Checkout',
    clearCart: 'Clear Cart',

    // Checkout Modal
    checkoutTitle: 'Complete Your Order',
    checkoutSubtitle: 'Enter farm address for delivery and choose payment method',
    farmerInfo: 'Farmer / Delivery Details',
    fullName: 'Farmer Full Name',
    fullNamePlaceholder: 'e.g. Ramesh Patel / Murugan',
    phoneNumber: 'Mobile Phone Number',
    phonePlaceholder: '+91 98765 43210',
    villageTown: 'Village / Town / City',
    villagePlaceholder: 'e.g. Kotla / Thanjavur / Salem',
    deliveryAddress: 'Street / Land Landmark / Farm Address',
    addressPlaceholder: 'Near Panchayat Office, Main Road',
    pincode: 'PIN Code',
    pincodePlaceholder: '600001 or 422003',
    paymentMethod: 'Select Payment Method',
    codOption: 'Cash on Delivery (COD)',
    codDesc: 'Pay securely in cash when farm supplies are delivered.',
    upiOption: 'Instant UPI Payment',
    upiDesc: 'Pay instantly using Google Pay, PhonePe, or Paytm.',
    netBankingOption: 'Net Banking / Bank Transfer',
    specialDeliveryNote: 'Delivery Instructions / Notes (Optional)',
    notePlaceholder: 'e.g. Please call before reaching pump house or village gate.',
    orderSummary: 'Order Summary',
    placeOrderBtn: 'Confirm & Place Order',
    placingOrder: 'Processing your order...',
    orderSuccessTitle: 'Order Placed Successfully!',
    orderSuccessMsg: 'Thank you for choosing AgriCare. Your supplies will be dispatched to your village address shortly.',
    orderIdLabel: 'Order Tracking ID',
    continueShopping: 'Continue Shopping',

    // AI Advisor / Chatbot
    advisorTitle: 'AgriCare AI Agronomist',
    advisorSubtitle: 'Expert bilingual crop guidance, live Mandi rates, spray calculations & dealer finder',
    personaLabel: 'Consultation Mode:',
    generalAgronomist: 'General Agronomist',
    generalDesc: 'Crop care, seasonal sowing, NPK schedules, seed recommendations',
    pathologist: 'Plant Pathologist',
    pathologistDesc: 'Deep differential diagnosis of fungal, bacterial & pest diseases',
    fieldAssistant: 'Field Calculator',
    fieldDesc: 'Instant knapsack spray tank dilution & seed sowing rate calculations',
    liveSearchToggle: 'Google Search Mandi / Web Grounding',
    mapsGroundingToggle: 'Nearby APMC Mandis & Dealer Finder',
    typeQuestionPlaceholder: 'Ask a farming question (in English or தமிழ்)...',
    voiceButtonTitle: 'Hold or click to dictate in English or Tamil',
    listeningVoice: 'Listening... Speak now',
    transcribingVoice: 'Transcribing speech via Gemini 3.5...',
    quickQuestionsTitle: 'Frequently Asked Farming Inquiries',
    sampleQ1: 'Tomato leaf yellowing diagnosis & remedies',
    sampleQ2: 'NPK 19:19:19 dosage for 15L knapsack tank',
    sampleQ3: 'Paddy stem borer organic biological control',
    sampleQ4: 'Find nearest fertilizer dealers and APMC mandis',
    copyGuidance: 'Copy Advice',
    copied: 'Copied!',
    listenAudio: 'Listen to Advice',
    sourcesLabel: 'Verified Web Sources:',
    clearConversation: 'Clear Chat',

    // Admin Dashboard
    adminPanel: 'AgriCare Admin Inventory Management',
    inventoryOverview: 'Inventory Overview',
    totalProducts: 'Total Products',
    lowStockItems: 'Low Stock (< 5 units)',
    outOfStockItems: 'Out of Stock Items',
    totalOrders: 'Received Orders',
    addProduct: 'Add New Product',
    restockAlertTitle: 'Restock Attention Required',
    backToStore: 'Back to Storefront',
    logout: 'Logout',
    changePassword: 'Change Password',
  },

  ta: {
    // Common
    close: 'மூடு',
    stop: 'நிறுத்து',
    listenAloud: 'குரல் வழியே கேட்க',
    loadingVoice: 'குரல் உருவாக்கப்படுகிறது...',
    free: 'இலவசம்',
    total: 'செலுத்த வேண்டிய மொத்தத் தொகை',
    deliveryFee: 'கிராம டெலிவரி கட்டணம்',
    farmerDiscount: 'விவசாயி சிறப்பு தள்ளுபடி',
    lowStock: 'குறைந்த இருப்பு',
    inCart: 'கூடையில் உள்ளது',
    featured: 'முதன்மை பரிந்துரைகள்',
    highestRated: 'சிறந்த மதிப்பீடு',
    suitableFor: 'பொருத்தமான பயிர்கள்',
    usageAndDosage: 'பயன்பாட்டு அளவு மற்றும் தெளிக்கும் முறைகள்',

    // Cart Helpers
    cartTitle: 'உங்கள் விவசாய கூடை',
    emptyCart: 'உங்கள் கூடை காலியாக உள்ளது',
    emptyCartMessage: 'எங்கள் தரமான சான்றளிக்கப்பட்ட விதைகள், உரங்கள் மற்றும் கருவிகளைப் பார்வையிட்டு கூடையில் சேர்க்கவும்.',
    browseCatalog: 'பொருட்களைப் பார்க்க',

    // Brand & Nav
    brandName: 'அக்ரிகேர்',
    brandTagline: 'நவீன வேளாண் வணிகம் மற்றும் AI பயிர் ஆலோசனை மையம்',
    home: 'முகப்பு',
    catalog: 'பொருட்கள்',
    cart: 'கூடை',
    admin: 'நிர்வாகம்',
    advisor: 'AI ஆலோசகர்',
    searchPlaceholder: 'விதைகள், உரங்கள், பூச்சிக்கொல்லிகள், கருவிகள், பயிர்கள் தேடுக...',
    langEnglish: 'English',
    langTamil: 'தமிழ்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    toggleTheme: 'வண்ண அமைப்பை மாற்றவும்',

    // Categories
    allSupplies: 'அனைத்து பொருட்கள்',
    seeds: 'விதைகள்',
    fertilizers: 'உரங்கள்',
    pesticides: 'பூச்சிக்கொல்லிகள்',
    farmTools: 'விவசாய கருவிகள்',
    organicNutrients: 'இயற்கை ஊட்டச்சத்துக்கள்',

    // Hero Section
    heroTitle: 'உயர்தர விவசாயப் பொருட்கள் உங்கள் கிராமத்திற்கே நேரடி டெலிவரி',
    heroHighlight: 'விவசாயிகளின் நம்பகமான தளம்',
    heroSubtitle: 'சான்றளிக்கப்பட்ட கலப்பின விதைகள், நீரில் கரையும் உரங்கள், இயற்கை பூச்சிக்கொல்லிகள் மற்றும் உடனடி தமிழ் AI வேளாண் வழிகாட்டுதல்.',
    exploreCatalog: 'பொருட்களைப் பார்க்க',
    askAdvisor: 'AI வேளாண் நிபுணரிடம் கேட்க',
    trustBadge1: '100% சான்றளிக்கப்பட்ட தரம்',
    trustBadge1Desc: 'ஆய்வகப் பரிசோதனை செய்யப்பட்ட அசல் விதைகள் & மருந்துகள்.',
    trustBadge2: 'கிராம வாசற்படி டெலிவரி',
    trustBadge2Desc: '12,000+ கிராம அஞ்சல் குறியீடுகளுக்கு நேரடி விநியோகம்.',
    trustBadge3: 'தமிழ் & ஆங்கில AI ஆலோசனை',
    trustBadge3Desc: 'பயிர் நோய் தீர்வுகள், உரம் அளவு மற்றும் குரல் வழி விளக்கம்.',

    // Filter Bar
    inStockOnly: 'இருப்பில் உள்ளவை மட்டும்',
    sortBy: 'வரிசைப்படுத்துக',
    featuredFirst: 'முதன்மை பரிந்துரைகள்',
    priceLowHigh: 'விலை: குறைவிலிருந்து அதிகம்',
    priceHighLow: 'விலை: அதிகத்திலிருந்து குறைவு',
    ratingHigh: 'சிறந்த மதிப்பீடு',
    showingProducts: '{count} சரிபார்க்கப்பட்ட வேளாண் பொருட்கள் உள்ளன',
    matchingSearch: '"{query}" தேடலுக்குரியவை',
    resetFilters: 'வடிகட்டிகளை மீட்டமை',
    noProductsFound: 'பொருட்கள் எதுவும் கிடைக்கவில்லை',
    noProductsDesc: 'உங்கள் வடிகட்டிகளுக்கு ஏற்ப பொருட்கள் எதுவும் இல்லை. தேடலை மாற்றி முயற்சிக்கவும்.',

    // Product Card
    inStock: 'இருப்பில் உள்ளது',
    outOfStock: 'விற்றுத் தீர்ந்தது',
    lowStockBadge: 'குறைந்த இருப்பு ({count})',
    lowStockNotice: 'கிடங்கில் {count} மட்டுமே உள்ளது!',
    orderFast: 'உடனே ஆர்டர் செய்க',
    addToCart: 'கார்ட்டில் சேர்க்க',
    claimNow: 'உடனே வாங்கவும் • {count} மட்டுமே',
    inCartCount: '{count} கூடையில் உள்ளது',
    maxStockReached: 'முழு இருப்பும் ({count}) கூடையில் சேர்க்கப்பட்டது',
    currentlyOutOfStock: 'தற்போது இருப்பில் இல்லை',
    specifications: 'விவரக்குறிப்பு & பயன்பாடு',
    bioCertified: 'இயற்கை சான்றளிக்கப்பட்டது',
    topSeller: 'அதிக விற்பனை',
    formulaMatch: 'கூறு பொருத்தம்:',
    listenDosage: 'பயன்பாட்டு அளவை ஜெமினி குரல் வழியே கேட்க',

    // Product Detail Modal
    categoryLabel: 'பிரிவு:',
    packUnitLabel: 'அளவு / அலகு:',
    availabilityLabel: 'இருப்பு நிலை:',
    unitsLeft: 'குறைந்த இருப்பு: {count} மட்டுமே எஞ்சியுள்ளது',
    unitsAvailable: '{count} இருப்பு உள்ளது',
    highDemandWarning: 'அதிக தேவை உள்ள பொருள்: இருப்பு 5-க்கும் குறைவாக உள்ளது. உங்கள் ஆர்டரை உடனே பதிவு செய்யவும்.',
    cropsSuitable: 'பொருத்தமான பயிர்கள்',
    applicationUsage: 'பயன்பாட்டு அளவு மற்றும் தெளிக்கும் முறைகள்',
    activeComposition: 'செயலில் உள்ள வேதியியல் / இயற்கை கலவை',
    safetyStorage: 'பாதுகாப்பு, கையாளுதல் & சேமிப்பு முறைகள்',
    audioReader: 'விவசாயிகளுக்கான குரல் வாசிப்பாளர்',
    poweredByGemini: 'ஜெமினி 3.1 TTS குரல் வழியே',
    listenToTips: 'மருந்தளவு ஆடியோவை கேட்க',
    stopAudio: 'ஆடியோவை நிறுத்தவும்',
    loadingAudio: 'குரல் உருவாக்கப்படுகிறது...',
    quantityLabel: 'எண்ணிக்கை:',
    addToCartTotal: '{qty} கூடையில் சேர்க்க • {price}',

    // Cart Drawer
    yourCart: 'உங்கள் விவசாய கூடை',
    itemsInCart: '{count} பொருட்கள் தேர்ந்தெடுக்கப்பட்டுள்ளன',
    emptyCartTitle: 'உங்கள் கூடை காலியாக உள்ளது',
    emptyCartDesc: 'எங்கள் தரமான சான்றளிக்கப்பட்ட விதைகள், உரங்கள் மற்றும் கருவிகளைப் பார்வையிட்டு கூடையில் சேர்க்கவும்.',
    browseSupplies: 'பொருட்களைப் பார்க்க',
    subtotal: 'பொருட்களின் தொகை',
    delivery: 'கிராம டெலிவரி கட்டணம்',
    freeDelivery: 'இலவசம்',
    discount: 'விவசாயி சிறப்பு தள்ளுபடி',
    totalAmount: 'செலுத்த வேண்டிய மொத்தத் தொகை',
    proceedToCheckout: 'ஆர்டர் செய்ய தொடரவும்',
    clearCart: 'கூடையை காலியாக்கு',

    // Checkout Modal
    checkoutTitle: 'ஆர்டரை முடிக்கவும்',
    checkoutSubtitle: 'டெலிவரிக்கான உங்கள் பண்ணை முகவரியை உள்ளிடவும்',
    farmerInfo: 'விவசாயி / வாடிக்கையாளர் விவரங்கள்',
    fullName: 'விவசாயியின் முழு பெயர்',
    fullNamePlaceholder: 'எ.கா: முத்துக்குமார் / சுந்தரம்',
    phoneNumber: 'கைபேசி எண்',
    phonePlaceholder: '+91 98765 43210',
    villageTown: 'கிராமம் / வட்டம் / நகரம்',
    villagePlaceholder: 'எ.கா: தஞ்சாவூர் / சேலம் / மதுரை',
    deliveryAddress: 'தெரு / பண்ணை முகவரி / அடையாளக்குறி',
    addressPlaceholder: 'பஞ்சாயத்து அலுவலகம் அருகில், மெயின் ரோடு',
    pincode: 'அஞ்சல் குறியீடு (PIN)',
    pincodePlaceholder: '600001 அல்லது 636001',
    paymentMethod: 'பணம் செலுத்தும் முறை',
    codOption: 'பொருளைப் பெற்று பணம் செலுத்துதல் (COD)',
    codDesc: 'பொருட்கள் பண்ணைக்கு வந்தவுடன் பாதுகாப்பாக பணம் செலுத்தலாம்.',
    upiOption: 'உடனடி UPI பரிவர்த்தனை',
    upiDesc: 'Google Pay, PhonePe அல்லது Paytm மூலம் உடனே செலுத்தலாம்.',
    netBankingOption: 'வங்கி கணக்கு பரிவர்த்தனை',
    specialDeliveryNote: 'டெலிவரி குறிப்புகள் (விருப்பத்தேர்வு)',
    notePlaceholder: 'எ.கா: மோட்டார் கொட்டகை அல்லது ஊர் எல்லையில் கூப்பிடவும்.',
    orderSummary: 'ஆர்டர் விவரம்',
    placeOrderBtn: 'ஆர்டரை உறுதிப்படுத்துக',
    placingOrder: 'ஆர்டர் பதிவு செய்யப்படுகிறது...',
    orderSuccessTitle: 'ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது!',
    orderSuccessMsg: 'அக்ரிகேரைத் தேர்ந்தெடுத்தமைக்கு நன்றி. உங்கள் பொருட்கள் விரைவில் உங்கள் முகவரிக்கு அனுப்பப்படும்.',
    orderIdLabel: 'ஆர்டர் கண்காணிப்பு எண்',
    continueShopping: 'மீண்டும் வாங்க',

    // AI Advisor / Chatbot
    advisorTitle: 'அக்ரிகேர் AI வேளாண் ஆலோசகர்',
    advisorSubtitle: 'பயிர் நோய்கள், நேரடி மண்டி விலை, மருந்து அளவு & வானிலை வழிகாட்டி',
    personaLabel: 'ஆலோசனை முறை:',
    generalAgronomist: 'பொது வேளாண் ஆலோசகர்',
    generalDesc: 'பயிர் பராமரிப்பு, பருவகால விதைப்பு, NPK உர அட்டவணை, விதை பரிந்துரைகள்',
    pathologist: 'பயிர் நோய் வல்லுநர்',
    pathologistDesc: 'பூஞ்சை, பாக்டீரியா மற்றும் பூச்சித் தாக்குதல் நுண்ணிய தீர்வுகள்',
    fieldAssistant: 'வயல் கணக்கீட்டாளர்',
    fieldDesc: '15L ஸ்ப்ரே டேங்க் மருந்து அளவு மற்றும் விதை தேவை உடனடி கணக்கீடு',
    liveSearchToggle: 'கூகிள் நேரடி மண்டி விலை / இணைய தகவல்',
    mapsGroundingToggle: 'அருகிலுள்ள மண்டி & உரக் கடைகள் (கூகிள் மேப்ஸ்)',
    typeQuestionPlaceholder: 'உங்கள் விவசாய கேள்விகளை கேட்கவும் (தமிழ் அல்லது English)...',
    voiceButtonTitle: 'குரல் மூலம் பேச கிளிக் செய்யவும்',
    listeningVoice: 'கேட்கிறது... இப்போது பேசவும்',
    transcribingVoice: 'ஜெமினி மூலம் குரல் உரையாக மாற்றப்படுகிறது...',
    quickQuestionsTitle: 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
    sampleQ1: 'தக்காளி இலை மஞ்சள் நிறமாக மாறுவதற்கு தீர்வு என்ன?',
    sampleQ2: '15 லிட்டர் தெளிப்பானுக்கு NPK 19-19-19 உரம் அளவு எவ்வளவு?',
    sampleQ3: 'நெல் பயிரில் தண்டு துளைப்பான் இயற்கை கட்டுப்பாடு',
    sampleQ4: 'எனக்கு அருகில் உள்ள உரக் கடைகள் மற்றும் மண்டிகள் எங்கே உள்ளன?',
    copyGuidance: 'ஆலோசனையை நகலெடு',
    copied: 'நகலெடுக்கப்பட்டது!',
    listenAudio: 'குரல் வழியே கேட்க',
    sourcesLabel: 'சரிபார்க்கப்பட்ட தகவல் மூலங்கள்:',
    clearConversation: 'உரையாடலை அழிக்க',

    // Admin Dashboard
    adminPanel: 'அக்ரிகேர் சரக்கு இருப்பு நிர்வாகம்',
    inventoryOverview: 'சரக்கு இருப்பு கண்ணோட்டம்',
    totalProducts: 'மொத்த பொருட்கள்',
    lowStockItems: 'குறைந்த இருப்பு (< 5 அலகுகள்)',
    outOfStockItems: 'இருப்பில் இல்லாதவை',
    totalOrders: 'பெறப்பட்ட ஆர்டர்கள்',
    addProduct: 'புதிய பொருளைச் சேர்க்க',
    restockAlertTitle: 'உடனடி இருப்பு நிரப்ப வேண்டிய பொருட்கள்',
    backToStore: 'கடை முகப்புக்குச் செல்ல',
    logout: 'வெளியேறு',
    changePassword: 'கடவுச்சொல்லை மாற்ற',
  },
};

// Tamil product translations mapping by Product ID
export const PRODUCT_TRANSLATIONS_TA: Record<string, {
  name: string;
  shortDescription: string;
  category: string;
  unit: string;
  cropCompatibility: string[];
  usageInstructions: string;
}> = {
  ...ANTHIYUR_TRANSLATIONS_TA,
  'prod-seed-1': {
    name: 'சூப்பர்கோல்ட் ஹைபிரிட் பாசுமதி நெல் விதைகள் (பூசா 1121)',
    shortDescription: 'அதிக மகசூல், நோய் எதிர்ப்புத் திறன் கொண்ட நீண்ட தானிய பாசுமதி நெல் விதை.',
    category: 'விதைகள்',
    unit: '5 கிலோ பை',
    cropCompatibility: ['நெல் / பாசுமதி', 'காரிப் தானியங்கள்'],
    usageInstructions: 'நாற்றங்கால் விதைப்புக்கு முன் விதைகளை 24 மணி நேரம் சுத்தமான தண்ணீரில் ஊற வைக்கவும். நடவு நெல்லுக்கு ஏக்கருக்கு 5 கிலோ விதை அளவு தேவை.',
  },
  'prod-seed-2': {
    name: 'டியூரம் கோதுமை விதைகள் (HD-2967 உயர் ரகம்)',
    shortDescription: 'துரு நோய் எதிர்ப்புத் திறன் மற்றும் அதிக புரதச்சத்து கொண்ட உயர் ரக கோதுமை விதை.',
    category: 'விதைகள்',
    unit: '10 கிலோ பை',
    cropCompatibility: ['கோதுமை', 'பார்லி', 'ரபி தானியங்கள்'],
    usageInstructions: 'நவம்பர் 1 முதல் 25-க்குள் விதைக்கவும். ஏக்கருக்கு 40 கிலோ விதை தேவை. அசோடோபாக்டர் கொண்டு விதை நேர்த்தி செய்யவும்.',
  },
  'prod-seed-3': {
    name: 'F1 ஹைபிரிட் ரெட் டிலைட் தக்காளி விதைகள்',
    shortDescription: 'இலை சுருட்டு வைரஸ் எதிர்ப்புத் திறன் கொண்ட அடர் சிவப்பு நிற உறுதியான தக்காளி விதை.',
    category: 'விதைகள்',
    unit: '10 கிராம் பாக்கெட் (~3000 விதைகள்)',
    cropCompatibility: ['தக்காளி', 'கத்தரி & மிளகாய் பயிர்கள்'],
    usageInstructions: 'ப்ரோ-ட்ரேக்களில் நாற்று விட்டு 25 நாள் நாற்றுகளை சொட்டுநீர்ப் பாசன வசதியுடன் மேட்டுப்பாத்திகளில் நடவு செய்யவும்.',
  },
  'prod-seed-4': {
    name: 'கோல்டன் காப் ஹைபிரிட் இனிப்பு மக்காச்சோளம் விதைகள்',
    shortDescription: 'அதிக இனிப்புச் சுவை கொண்ட மென்மையான மஞ்சள் மக்காச்சோள கலப்பின விதை.',
    category: 'விதைகள்',
    unit: '1 கிலோ பை',
    cropCompatibility: ['மக்காச்சோளம்', 'இனிப்பு சோளம்', 'ஊடுபயிர்கள்'],
    usageInstructions: 'வரிசைக்கு வரிசை 60 செ.மீ மற்றும் செடிக்கு செடி 20 செ.மீ இடைவெளியில் 3-4 செ.மீ ஆழத்தில் விதைக்கவும்.',
  },
  'prod-fert-1': {
    name: 'அக்ரிகுரோ நீரில் கரையும் NPK 19:19:19 + நுண்சத்துக்கள்',
    shortDescription: 'பயிர் வளர்ச்சி ஊக்கி, இலைவழி மற்றும் சொட்டுநீர்ப் பாசனத்திற்கு 100% நீரில் கரையும் சமச்சீர் உரம்.',
    category: 'உரங்கள்',
    unit: '1 கிலோ பாக்கெட்',
    cropCompatibility: ['காய்கறிகள்', 'நெல்', 'கோதுமை', 'பருத்தி', 'பழத்தோட்டங்கள்'],
    usageInstructions: 'இலைவழித் தெளிப்பு: 1 லிட்டர் தண்ணீருக்கு 5 கிராம். சொட்டுநீர்ப் பாசனம்: ஏக்கருக்கு 2-3 கிலோ வீதம் 7-10 நாட்களுக்கு ஒருமுறை.',
  },
  'prod-fert-2': {
    name: 'நைட்ரோபவர் கால்சியம் நைட்ரேட் + போரான் உரம்',
    shortDescription: 'பூ உதிர்வதைத் தடுத்து, காய் பிடிப்பு மற்றும் காய் வெடிப்பைத் தடுக்கும் சிறந்த ஊட்டச்சத்து உரம்.',
    category: 'உரங்கள்',
    unit: '5 கிலோ பை',
    cropCompatibility: ['தக்காளி', 'உருளைக்கிழங்கு', 'மிளகாய்', 'மாதுளை', 'ஆப்பிள்'],
    usageInstructions: 'பூக்கும் மற்றும் பிஞ்சு பிடிக்கும் தருணத்தில் 1 லிட்டர் தண்ணீருக்கு 3-4 கிராம் கலந்து தெளிக்கவும்.',
  },
  'prod-fert-3': {
    name: 'கிராப்ளூம் மோனோ பொட்டாசியம் பாஸ்பேட் (0:52:34 - MKP)',
    shortDescription: 'பூக்கள் அதிகம் பூக்கவும், காய்கள் திரட்சியாகவும், பழங்கள் இனிப்பு சுவை பெறவும் உதவும் உரம்.',
    category: 'உரங்கள்',
    unit: '1 கிலோ பாக்கெட்',
    cropCompatibility: ['திராட்சை', 'மாதுளை', 'பருத்தி', 'கரும்பு', 'தக்காளி'],
    usageInstructions: 'பூக்கும் தருணம் மற்றும் காய் வளர்ச்சி நிலையில் 1 லிட்டர் தண்ணீருக்கு 5-7 கிராம் தெளிக்கவும்.',
  },
  'prod-pest-1': {
    name: 'வேம்பு ஷீல்டு சுத்தமான வேப்ப எண்ணெய் (10,000 PPM)',
    shortDescription: 'அசுவினி, வெள்ளை ஈ, இலைப்பேன் கட்டுப்படுத்தும் இயற்கை பூச்சி விரட்டி.',
    category: 'பூச்சிக்கொல்லிகள்',
    unit: '500 மிலி பாட்டில்',
    cropCompatibility: ['அனைத்து காய்கறிகள்', 'பழ மரங்கள்', 'மசாலா பயிர்கள்'],
    usageInstructions: '1 லிட்டர் தண்ணீருக்கு 3-4 மிலி வேப்ப எண்ணெய் மற்றும் சில துளிகள் சோப்பு திரவம் கலந்து மாலை வேளையில் தெளிக்கவும்.',
  },
  'prod-pest-2': {
    name: 'பங்கிஸ்டாப் சிஸ்டமிக் & காண்டாக்ட் பூஞ்சாணக்கொல்லி',
    shortDescription: 'இலைக்கருகல், சாம்பல் நோய் மற்றும் இலைப்புள்ளி நோய்களைக் கட்டுப்படுத்தும் இரட்டைப் பாதுகாப்பு மருந்து.',
    category: 'பூச்சிக்கொல்லிகள்',
    unit: '250 கிராம் பாக்கெட்',
    cropCompatibility: ['நெல் (குலை நோய்)', 'உருளை (இலைக்கருகல்)', 'திராட்சை', 'மிளகாய்'],
    usageInstructions: '1 லிட்டர் தண்ணீருக்கு 2 கிராம் கலந்து நோய் அறிகுறிகள் கண்டவுடன் தெளிக்கவும். 10-12 நாள் கழித்து மீண்டும் தெளிக்கலாம்.',
  },
  'prod-pest-3': {
    name: 'மைட்க்ளியர் சிலந்திப் பேன் தடுப்பு மருந்து',
    shortDescription: 'சிவப்பு மற்றும் மஞ்சள் சிலந்திப் பேன்களை உடனே கட்டுப்படுத்தும் சிறப்பு மருந்து.',
    category: 'பூச்சிக்கொல்லிகள்',
    unit: '200 மிலி பாட்டில்',
    cropCompatibility: ['மிளகாய்', 'தேயிலை', 'ரோஜா & பூக்கள்', 'கத்தரி'],
    usageInstructions: '1 லிட்டர் தண்ணீருக்கு 1.5 மிலி கலந்து இலைகளின் அடிப்பகுதியில் படுமாறு நன்கு தெளிக்கவும்.',
  },
  'prod-tool-1': {
    name: 'அக்ரிப்ரோ 16 லிட்டர் ரீசார்ஜபிள் பேட்டரி ஸ்ப்ரேயர்',
    shortDescription: 'நீடித்து உழைக்கும் 12V பேட்டரி கொண்ட தெளிப்பான், இரட்டை நாசில்கள் மற்றும் ஸ்டெயின்லெஸ் ஸ்டீல் கம்பி.',
    category: 'விவசாய கருவிகள்',
    unit: '1 முழு கருவி + சார்ஜர்',
    cropCompatibility: ['விவசாய பயிர்கள்', 'பழத்தோட்டங்கள்', 'பசுமைக்குடில்கள்'],
    usageInstructions: 'முதல் முறை பயன்படுத்தும் முன் 6 மணி நேரம் முழுமையாக சார்ஜ் செய்யவும். பயன்பாட்டிற்குப் பின் சுத்தமான நீரால் கழுவவும்.',
  },
  'prod-tool-2': {
    name: 'மண் pH & ஈரப்பதம் கண்டறியும் 3-in-1 கருவி',
    shortDescription: 'மண்ணின் கார-அமிலத்தன்மை மற்றும் ஈரப்பதத்தை உடனடியாகக் காட்டும் பேட்டரி தேவையில்லாத கருவி.',
    category: 'விவசாய கருவிகள்',
    unit: '1 கருவி',
    cropCompatibility: ['அனைத்து விவசாய & தோட்டக்கலை மண்கள்'],
    usageInstructions: 'சென்சார் முனைகளை ஈரப்பதமுள்ள மண்ணில் 4-6 அங்குலம் ஆழத்தில் நுழைத்து அளவீடுகளை உடனே சரிபார்க்கவும்.',
  },
  'prod-tool-3': {
    name: 'பாரம்பரிய இரும்பு அறுவடை அரிவாள் & களையெடுப்பான்',
    shortDescription: 'நெல், கோதுமை, தீவனப்புல் அறுவடைக்கு கூர்மையான வளைந்த பல்வரிசை அரிவாள்.',
    category: 'விவசாய கருவிகள்',
    unit: '1 கருவி',
    cropCompatibility: ['நெல்', 'கோதுமை', 'கரும்பு', 'புல் அறுவடை'],
    usageInstructions: 'மரக் கைப்பிடியுடன் கைக்கு வசதியானது. ஈரமில்லாமல் துடைத்து எண்ணெய் தடவி வைக்கவும்.',
  },
  'prod-org-1': {
    name: 'பயோகோல்ட் மண்புழு உரம் + ஹியூமிக் அமிலம் (செறிவூட்டப்பட்டது)',
    shortDescription: 'மண் வளத்தை பெருக்கும் நுண்ணுயிர்கள் மற்றும் ஹியூமிக் அமிலத்துடன் கூடிய மண்புழு உரம்.',
    category: 'இயற்கை ஊட்டச்சத்துக்கள்',
    unit: '25 கிலோ பை',
    cropCompatibility: ['அனைத்து பயிர்கள்', 'காய்கறிகள்', 'தென்னை', 'பழத்தோட்டம்'],
    usageInstructions: 'அடி உரமாக ஏக்கருக்கு 50-100 கிலோ இடவும். மரப்பயிர்களுக்கு மரம் ஒன்றுக்கு 2-5 கிலோ இடலாம்.',
  },
  'prod-org-2': {
    name: 'சீவீட் மேக்ஸ் கடற்பாசி அக்வா சாறு (அஸ்கோபில்லம் நோடோசம்)',
    shortDescription: 'பயிர் வறட்சியைத் தாங்கவும், வேர் வளர்ச்சி மற்றும் அதிக மகசூலுக்கும் உதவும் இயற்கை சாறு.',
    category: 'இயற்கை ஊட்டச்சத்துக்கள்',
    unit: '1 லிட்டர் கேன்',
    cropCompatibility: ['அனைத்து பயிர்கள்', 'மலர் சாகுபடி', 'காய்கறிகள்'],
    usageInstructions: '1 லிட்டர் தண்ணீருக்கு 2.5 மிலி கலந்து 15-20 நாட்களுக்கு ஒருமுறை தெளிக்கவும்.',
  },
  'prod-org-3': {
    name: 'ரூட்மேக்ஸ் வேர் வளர்ச்சி மைக்கோரைசா உயிர் உரம்',
    shortDescription: 'வேர் அமைப்பை 300% விரிவுபடுத்தி, பாஸ்பரஸ் மற்றும் நீர் கிரகிப்பை அதிகரிக்கும் உயிரி உரம்.',
    category: 'இயற்கை ஊட்டச்சத்துக்கள்',
    unit: '1 கிலோ பை',
    cropCompatibility: ['கரும்பு', 'வாழை', 'மஞ்சள்', 'நெல்', 'பருத்தி'],
    usageInstructions: 'விதை நேர்த்தி அல்லது நடவு சமயம் ஏக்கருக்கு 4-5 கிலோ வீதம் தொழு உரத்துடன் கலந்து இடவும்.',
  },
};
