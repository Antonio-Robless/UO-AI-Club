/* ─────────────────────────────────────────────────────────────
   data.js  —  All shared constants for the City Driving Tool
───────────────────────────────────────────────────────────── */

const DATA = {};

/* ── Hourly traffic indices (1=free → 9=gridlock) ── */
DATA.weekday = [1,1,1,1,1,2,3,8,9,6,5,5,6,5,5,6,7,9,8,5,4,3,2,1];
DATA.weekend = [1,1,1,1,1,1,1,2,3,4,5,6,7,7,6,6,6,5,4,3,2,2,1,1];
DATA.days    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ── Traffic level metadata ── */
DATA.trafficInfo = {
  1:{ label:'Very Light', color:'#34d399', pct:10,  advice:'Excellent time to drive. Roads are nearly empty — smooth and stress-free.' },
  2:{ label:'Light',      color:'#6ee7b7', pct:25,  advice:'Light traffic. Most routes will be quick. Minimal delays expected.' },
  3:{ label:'Mild',       color:'#fde68a', pct:38,  advice:'Mild traffic. Main arteries are moving well but some signals may stack.' },
  4:{ label:'Moderate',   color:'#fbbf24', pct:52,  advice:'Moderate congestion. Consider side streets or alternate routes.' },
  5:{ label:'Busy',       color:'#f97316', pct:63,  advice:'Busy roads. Even a 15-min shift in departure can save significant time.' },
  6:{ label:'Heavy',      color:'#ef4444', pct:74,  advice:'Heavy traffic. Use real-time GPS for rerouting. Add buffer to your arrival.' },
  7:{ label:'Very Heavy', color:'#dc2626', pct:85,  advice:'Very heavy traffic. Consider delaying 30–45 min if schedule allows.' },
  8:{ label:'Peak Rush',  color:'#b91c1c', pct:93,  advice:'Peak rush hour. Highway on-ramps will be backed up. Parallel streets may be faster.' },
  9:{ label:'Gridlock',   color:'#7f1d1d', pct:100, advice:'Gridlock. If optional — wait it out. Transit is your best alternative.' },
};

/* ── Decision helper matrix ── */
DATA.decisions = {
  short:{
    peak:{
      speed:  'Consider cycling, transit, or walking — city traffic cancels short-drive advantages.',
      fuel:   'Combine with another errand. Short cold-engine trips are the least fuel-efficient.',
      stress: 'Walk or bike if possible — zero stress, often faster than driving + searching for parking.',
    },
    midday:{
      speed:  'Drive surface streets directly. Skip the highway entirely for under 3 miles.',
      fuel:   'Consolidate with nearby errands so the engine is fully warm before this leg.',
      stress: 'Midday short trips are low-stress. Park on a side street, avoid main-road congestion.',
    },
    offpeak:{
      speed:  'Virtually no traffic. Most efficient window for any short trip.',
      fuel:   'Off-peak is ideal. No idling in traffic means MPG will be near optimal.',
      stress: 'Night/early-morning urban driving is almost always calm. Enjoy it.',
    },
  },
  medium:{
    peak:{
      speed:  'Use a real-time GPS app. Parallel streets often beat the main artery by 8–15 min.',
      fuel:   'Stop-and-go burns 30–40% extra fuel. Delay 30 min if flexible for near-highway speeds.',
      stress: 'Expect delays. Leave extra buffer. Put on a podcast — don\'t fight it.',
    },
    midday:{
      speed:  'Midday is the sweet spot. Surface streets + GPS gives speed and flexibility.',
      fuel:   'Midday traffic flows ~18–22 mph avg — close to the peak fuel-efficiency band.',
      stress: 'Best all-round window. Light signals, available parking, fewer pedestrians.',
    },
    offpeak:{
      speed:  'Highway is viable and free-flowing. Fastest possible trip at this distance.',
      fuel:   'Off-peak highway cruise (45–55 mph) is significantly more efficient than peak driving.',
      stress: 'Off-peak is ideal. Watch for late-night road hazards and early-morning delivery trucks.',
    },
  },
  long:{
    peak:{
      speed:  'Add 40–80% to free-flow time estimates. Highway may be faster despite being longer in miles.',
      fuel:   'Long rush-hour trips can waste 0.5–1.5 gallons extra in stop-and-go. Delay if possible.',
      stress: 'This is the hardest scenario. Audiobook, full coffee, and realistic expectations.',
    },
    midday:{
      speed:  'Midday is viable. Highways are moving. Allow for construction delays.',
      fuel:   'Midday highway at steady speed is the most fuel-efficient city-area option for long trips.',
      stress: 'Best midday strategy: leave by 10 AM, return before 3:30 PM to beat the PM rush.',
    },
    offpeak:{
      speed:  'Off-peak long trips are near free-flow. Optimal window if schedule allows.',
      fuel:   'Off-peak highway gives 15–25% better fuel economy than peak-congestion driving.',
      stress: 'Low-stress but stay alert — fatigue and occasional erratic drivers are off-peak risks.',
    },
  },
};

/* ── Tips library ── */
DATA.tips = [
  { tag:'time',    label:'Timing',  text:'Shift departure by 30 min outside 7–9 AM and 4–7 PM to cut average commute time by 20–40%.' },
  { tag:'time',    label:'Timing',  text:'Tuesday–Thursday mornings often have lighter traffic than Monday/Friday.' },
  { tag:'time',    label:'Timing',  text:'School holidays reduce traffic 10–15% on residential corridors. Note local school calendars.' },
  { tag:'route',   label:'Routing', text:'Use a mix of GPS + local knowledge: apps miss new road work and shortcut side streets you know.' },
  { tag:'route',   label:'Routing', text:'Parallel streets one block off the main artery are often 30–50% faster during rush hour.' },
  { tag:'route',   label:'Routing', text:'Right turns keep you moving. Design routes to minimize left-turn waits at busy intersections.' },
  { tag:'route',   label:'Routing', text:'Avoid highway on-ramps between 7:30–8:30 AM — queue back-ups add 5–15 min even for short merges.' },
  { tag:'fuel',    label:'Fuel',    text:'Maintain steady 25–35 mph where possible. Stop-and-go driving cuts fuel economy by up to 40%.' },
  { tag:'fuel',    label:'Fuel',    text:'Anticipate red lights and coast to a stop rather than braking hard — saves fuel and brake pads.' },
  { tag:'fuel',    label:'Fuel',    text:'Cold engines burn ~15% more fuel. Combine errands into one trip rather than multiple cold starts.' },
  { tag:'fuel',    label:'Fuel',    text:'Every 10 mph over 50 mph decreases fuel economy roughly 7–14%. City driving rarely requires speed.' },
  { tag:'parking', label:'Parking', text:'Research parking before you leave. Circling for a spot adds avg 8–12 min and wastes fuel.' },
  { tag:'parking', label:'Parking', text:'Park one block further away — almost always cheaper, faster to reach, and easy to exit.' },
  { tag:'parking', label:'Parking', text:'Garages fill from the top down. Enter and go directly to upper floors for open spots.' },
  { tag:'stress',  label:'Stress',  text:'Build in 15% buffer time on congested routes. Arriving calm is worth the extra minutes.' },
  { tag:'stress',  label:'Stress',  text:'Merge early and confidently — last-second lane changes create phantom traffic jams behind you.' },
  { tag:'stress',  label:'Stress',  text:'Keep a 3-second following distance in traffic. It gives glide room and reduces constant braking.' },
];

/* ── Efficiency score factors ── */
DATA.scoreFactors = [
  { id:'timing',  label:'Departure timing',  desc:'Do you avoid peak hours?' },
  { id:'route',   label:'Route awareness',   desc:'Do you use alternate routes?' },
  { id:'smooth',  label:'Smooth driving',    desc:'Minimal hard braking/accelerating?' },
  { id:'plan',    label:'Trip planning',     desc:'Do you plan trips in advance?' },
  { id:'parking', label:'Parking strategy',  desc:'Do you pre-research parking?' },
];

/* ── Fuel / speed lookup tables ── */
DATA.trafficSpeeds  = { free:35, light:25, moderate:18, heavy:10, gridlock:5 };
DATA.trafficMpgMult = { free:1.0, light:0.88, moderate:0.72, heavy:0.55, gridlock:0.40 };
DATA.trafficTips    = {
  free:     'Free-flow driving. Maintain steady speed for best efficiency.',
  light:    'Light traffic. Anticipate signals to minimize braking.',
  moderate: 'Consider departing 30 min later or using side streets.',
  heavy:    'Heavy congestion cuts your MPG nearly in half. Delay if possible.',
  gridlock: 'Gridlock is very costly in time and fuel. Consider transit or waiting it out.',
};

/* ─────────────────────────────────────────────────────────────
   INCIDENT DATA
───────────────────────────────────────────────────────────── */

/* Base delays (minutes) keyed by traffic level: free/light/moderate/heavy/peak */
DATA.incidents = {
  shoulder_fender: {
    name: 'Minor Fender-Bender (Shoulder)',
    icon: 'car',
    desc: 'Vehicle pulled to shoulder; slow-and-look effect from passing drivers.',
    baseDelays: { free:5, light:10, moderate:18, heavy:32, peak:45 },
    capacityLoss: 0.15, clearanceMin: 30,
    actions: ['Keep moving at normal speed — pulling over to watch adds to the jam.','Stay in your lane; do not merge unnecessarily.','"Rubberneck-neck" effect typically fades 0.5 miles past the scene.'],
    alternate: 'No lane is blocked. All routes are usable. Expect a brief 5–10 mph slow zone.',
  },
  major_1lane: {
    name: 'Major Crash — 1 Lane Blocked',
    icon: 'alert-circle',
    desc: 'Active collision scene; police/fire on scene. One travel lane closed.',
    baseDelays: { free:20, light:35, moderate:55, heavy:90, peak:130 },
    capacityLoss: 0.50, clearanceMin: 90,
    actions: ['Expect full stop-and-go for 1–3 miles back.','Exit the highway at least 2 exits early if possible.','Keep emergency lane clear — move hard right to the travel lane.'],
    alternate: 'Use the nearest parallel surface road. Add ~10 min but avoid the queue entirely.',
  },
  pileup: {
    name: 'Multi-Vehicle Pile-Up (Full Closure)',
    icon: 'flame',
    desc: 'Multiple vehicles involved; road fully closed. Jaws of life and investigators on scene.',
    baseDelays: { free:60, light:100, moderate:150, heavy:210, peak:270 },
    capacityLoss: 1.0, clearanceMin: 240,
    actions: ['Turn around if you have not yet entered the queue — this could last 3–5 hours.','Activate alternative navigation immediately.','If already in queue: engine off to save fuel, stay in your vehicle.'],
    alternate: 'Full detour required. Add 15–25 min via surface streets. Check Waze/Google for live rerouting.',
  },
  police_stop: {
    name: 'Police Traffic Stop (Roadside)',
    icon: 'shield',
    desc: 'Officer conducting a stop on the shoulder. Flashing lights visible.',
    baseDelays: { free:3, light:6, moderate:12, heavy:20, peak:28 },
    capacityLoss: 0.12, clearanceMin: 20,
    actions: ['Slow to the posted "Move Over" speed (usually 20–25 mph below limit).','Merge away from the stop if an adjacent lane is clear.','Do not stop to watch — keep moving.'],
    alternate: 'No alternate needed. Slow zone clears within 0.25 miles. Brief delay only.',
  },
  dui_checkpoint: {
    name: 'DUI / Safety Checkpoint',
    icon: 'octagon',
    desc: 'All vehicles slowed or stopped for brief inspection. Announced checkpoints are legal in most states.',
    baseDelays: { free:12, light:18, moderate:28, heavy:42, peak:60 },
    capacityLoss: 0.60, clearanceMin: 180,
    actions: ['Have license and registration ready to reduce your stop time.','If legal in your state, a legal U-turn to avoid the checkpoint is allowed.','Expect officers to be professional — cooperate and move through quickly.'],
    alternate: 'Many GPS apps now warn of checkpoints. Legal routes around checkpoints are posted on local social media.',
  },
  road_closure: {
    name: 'Emergency Road Closure (Water Main / Sinkhole)',
    icon: 'ban',
    desc: 'Entire roadway closed by public works or emergency services. Indefinite duration.',
    baseDelays: { free:25, light:45, moderate:70, heavy:110, peak:150 },
    capacityLoss: 1.0, clearanceMin: 300,
    actions: ['Reroute immediately — do not approach the closure point.','Check city public works social accounts for estimated reopening time.','Expect 1–4 hours minimum; some closures last 12–48 hours.'],
    alternate: 'Find a parallel street at least 2 blocks away. Avoid the immediate surrounding grid — it will be flooded with diverted traffic.',
  },
  construction_surge: {
    name: 'Active Construction Zone (Unexpected Lane Merge)',
    icon: 'construction',
    desc: 'Surprise lane reduction due to unscheduled paving, striping, or utility work.',
    baseDelays: { free:10, light:20, moderate:38, heavy:65, peak:90 },
    capacityLoss: 0.45, clearanceMin: 120,
    actions: ['Merge early — late merging is illegal in many states and delays everyone.','Fines double in work zones in most states; slow down.','Watch for flaggers and sudden stop signals.'],
    alternate: 'Parallel routes usually have no construction. Side streets add 5–10 min but flow freely.',
  },
  emergency_vehicle: {
    name: 'Active Emergency Vehicle Response',
    icon: 'activity',
    desc: 'Ambulance, fire engine, or police vehicle moving through traffic with lights and sirens.',
    baseDelays: { free:1, light:3, moderate:5, heavy:8, peak:10 },
    capacityLoss: 0.30, clearanceMin: 5,
    actions: ['Pull to the right and stop until the vehicle passes — it is the law in all 50 states.','Do not follow behind an emergency vehicle — dangerous and illegal.','Resume normal speed after the vehicle passes; the road clears within 30 seconds.'],
    alternate: 'No alternate needed. Delay is minimal and mandatory. Your pullover could save a life.',
  },
  severe_weather: {
    name: 'Severe Weather (Heavy Rain / Ice / Fog)',
    icon: 'cloud-rain',
    desc: 'Reduced visibility and traction. All drivers slow significantly regardless of conditions ahead.',
    baseDelays: { free:15, light:28, moderate:48, heavy:80, peak:120 },
    capacityLoss: 0.55, clearanceMin: 180,
    actions: ['Increase following distance to 6–8 seconds (triple normal).','Headlights on — it\'s the law in rain in most states.','If visibility drops below 100 ft, pull off and wait it out.','Avoid bridges and overpasses first — they ice before road surfaces.'],
    alternate: 'All routes are equally affected by weather. Delay departure if storm is brief.',
  },
  debris: {
    name: 'Road Debris / Tire Shred / Hazard',
    icon: 'alert-triangle',
    desc: 'Obstacle in the travel lane. Drivers swerving and slowing to avoid it.',
    baseDelays: { free:6, light:12, moderate:22, heavy:38, peak:52 },
    capacityLoss: 0.25, clearanceMin: 40,
    actions: ['Flash hazard lights briefly to warn trailing vehicles, then move around it safely.','Do not stop in a travel lane to pick up debris unless you are a first responder.','Call 511 or your state\'s road hazard line to report — it could prevent an accident.'],
    alternate: 'Debris is usually cleared within 30–40 min by highway patrol. Normal conditions resume quickly.',
  },
};

/* Road type multipliers on delay */
DATA.roadTypes = {
  highway:    { label:'Highway / Freeway',      mult:1.6, desc:'High-speed, few exits — incidents trap large queues.' },
  arterial:   { label:'Main Arterial Road',     mult:1.0, desc:'Base reference. Intersections allow partial bypass.' },
  side_street:{ label:'Side Street / Local',    mult:0.5, desc:'Low volume; incidents clear quickly and rerouting is easy.' },
  intersection:{ label:'Intersection / On-Ramp',mult:1.3, desc:'Blockage causes intersection gridlock cascade.' },
};

/* Demand levels (vehicles/hr per direction) for queue math */
DATA.demandVph = { free:600, light:1200, moderate:1800, heavy:2200, peak:2400 };

/* ─────────────────────────────────────────────────────────────
   REAL-WORLD IMPACT DATA
───────────────────────────────────────────────────────────── */

DATA.realWorld = [
  /* ── Economic ── */
  {
    cat:'economic', icon:'dollar-sign',
    stat:'$81 Billion',
    title:'Annual US Congestion Cost',
    body:'INRIX estimates US traffic congestion costs the economy approximately $81 billion per year in wasted fuel and lost productive time — roughly $1,000 per commuter annually.',
    source:'INRIX Global Traffic Scorecard 2022',
  },
  {
    cat:'economic', icon:'clock',
    stat:'51 hours',
    title:'Average US Driver Time Lost Per Year',
    body:'The average American driver loses 51 hours per year sitting in traffic — equivalent to more than two full work weeks. Boston leads the US at 79 hours lost per driver in 2023.',
    source:'INRIX 2023 Global Traffic Scorecard',
  },
  {
    cat:'economic', icon:'building-2',
    stat:'$2,072/driver',
    title:'Chicago Annual Congestion Cost Per Driver',
    body:'Chicago commuters pay roughly $2,072 per driver each year in extra fuel, time, and vehicle wear. San Francisco ($1,996) and New York ($1,800+) are close behind.',
    source:'INRIX 2023, Chicago Metropolitan Agency for Planning',
  },
  {
    cat:'economic', icon:'truck',
    stat:'30% freight surcharge',
    title:'Trucking & Supply Chain Premium',
    body:'Freight carriers add an average 25–35% urban delivery surcharge to account for city congestion delays. In peak conditions, a 10-mile urban delivery can take longer than a 100-mile interstate haul.',
    source:'American Transportation Research Institute (ATRI) 2022',
  },
  {
    cat:'economic', icon:'heart-pulse',
    stat:'+4.4 minutes',
    title:'Emergency Response Delay in Dense Traffic',
    body:'Studies show that every 10% increase in traffic congestion adds approximately 4–5 minutes to ambulance response times in urban areas. For cardiac arrest patients, each minute without CPR reduces survival by ~10%.',
    source:'Journal of Emergency Medical Services / NHTSA',
  },

  /* ── Health & Environment ── */
  {
    cat:'health', icon:'wind',
    stat:'6 billion gallons',
    title:'Fuel Wasted Idling Per Year (US)',
    body:'The EPA estimates Americans waste approximately 6 billion gallons of fuel every year from unnecessary idling — including traffic jams, drive-throughs, and warming up vehicles. That\'s ~$21B at average prices.',
    source:'US Environmental Protection Agency (EPA)',
  },
  {
    cat:'health', icon:'cloud',
    stat:'40x more particles',
    title:'Stop-and-Go Pollution vs. Steady Driving',
    body:'Vehicles in stop-and-go congestion emit up to 40 times more ultrafine particles per mile than those traveling at a steady 35 mph. People who live within 300 meters of a congested highway have 30% higher rates of asthma.',
    source:'University of Southern California Environmental Health Study',
  },
  {
    cat:'health', icon:'brain',
    stat:'10+ points',
    title:'Blood Pressure Spike From Commute Stress',
    body:'Studies show a long congested commute raises cortisol and blood pressure comparably to being a fighter pilot or riot police officer. Commutes over 90 minutes/day are linked to increased rates of anxiety, depression, and divorce.',
    source:'Texas A&M Transportation Institute / American Journal of Preventive Medicine',
  },
  {
    cat:'health', icon:'leaf',
    stat:'60% drop',
    title:'Air Quality Improvement During COVID Lockdowns (2020)',
    body:'When traffic dropped 60–80% globally during 2020 lockdowns, NO₂ levels fell 40–60% in major cities within weeks. Los Angeles had its longest streak of "Good" air quality days in recorded history — 23 consecutive days.',
    source:'NASA Earth Observatory / AQICN.org / South Coast AQMD',
  },

  /* ── Emergency Services ── */
  {
    cat:'emergency', icon:'flame',
    stat:'3.7 minutes',
    title:'Fire Response Time Penalty in Traffic',
    body:'Urban fire departments report that heavy peak-hour traffic adds an average of 3–4 minutes to response times. The NFPA standard for first-arrival is 4 minutes — meaning gridlock can double the acceptable response window.',
    source:'National Fire Protection Association (NFPA) / IAFC',
  },
  {
    cat:'emergency', icon:'alert-circle',
    stat:'1 in 3',
    title:'Police Unable to Respond at Full Speed',
    body:'A survey of US urban police departments found that approximately 1 in 3 emergency calls during peak hours result in officers unable to navigate traffic fast enough to meet response time goals, even with lights and sirens.',
    source:'Police Executive Research Forum (PERF) 2021',
  },
  {
    cat:'emergency', icon:'activity',
    stat:'9 minutes vs. 5',
    title:'Cardiac Arrest: Time Lost to Traffic',
    body:'The chain of survival for cardiac arrest depends on defibrillation within 5 minutes. In congested urban cores during rush hour, average EMS on-scene time stretches to 8–9 minutes — significantly impacting outcomes.',
    source:'Resuscitation Journal / American Heart Association',
  },

  /* ── Notable Events ── */
  {
    cat:'events', icon:'flag',
    stat:'62 miles',
    title:'Beijing 2010: The Longest Traffic Jam in History',
    body:'In August 2010, a traffic jam near Beijing stretched 62 miles (100 km) on the China National Highway 110. It lasted 12 days. Drivers were stranded for up to 5 days. Vendors walked the queue selling food and water at inflated prices.',
    source:'China Daily / BBC News',
  },
  {
    cat:'events', icon:'flag',
    stat:'50 lanes',
    title:'China\'s 50-Lane Highway Gridlock (2015)',
    body:'During China\'s National Day Golden Week in 2015, the G4 Beijing–Hong Kong–Macau Expressway — which has 50 lanes near a toll plaza — was converted into a 9-day parking lot. An estimated 30 million vehicles were affected.',
    source:'The Guardian / People\'s Daily',
  },
  {
    cat:'events', icon:'flag',
    stat:'3+ days',
    title:'Hurricane Katrina Evacuation (2005)',
    body:'The contraflow evacuation of New Orleans in advance of Hurricane Katrina turned all lanes outbound. Even so, traffic was backed up for 3+ days on I-10. Thousands ran out of gas on the highway; some never made it out.',
    source:'Louisiana DOTD / FHWA After-Action Report',
  },
  {
    cat:'events', icon:'flag',
    stat:'700 km',
    title:'Belgium "Snow Chaos" Traffic Jam (2010)',
    body:'A sudden November snowstorm in Belgium created a nationwide traffic jam of over 700 km (435 miles) of backed-up vehicles simultaneously. Thousands of drivers slept in their cars overnight on the highway.',
    source:'Belga News Agency / Brussels Times',
  },
  {
    cat:'events', icon:'flag',
    stat:'Hours of phantom jams',
    title:'I-95 Corridor "Rolling Shutdown" (Common)',
    body:'The I-95 corridor between Washington D.C. and New York City regularly experiences "rolling shutdowns" where no single accident causes a jam — just too many cars. On bad days, congestion waves propagate backward at ~15 mph and can last 6+ hours with no triggering event.',
    source:'FHWA Traffic Flow Fundamentals / MIT Traffic Studies',
  },

  /* ── City Spotlights ── */
  {
    cat:'cities', icon:'tree-pine',
    stat:'95 hours/year',
    title:'Los Angeles — Traffic Capital of the US',
    body:'LA drivers waste approximately 95 hours per year in traffic (down from a pre-COVID peak of 119 hours in 2019). The 405 Freeway near the Sepulveda Pass averages 379,000 vehicles per day, making it one of the busiest highways on Earth.',
    source:'INRIX 2023 / Caltrans',
  },
  {
    cat:'cities', icon:'landmark',
    stat:'117 hours/year',
    title:'New York City — Pre-COVID Peak',
    body:'At its 2019 peak, NYC drivers lost 117 hours per year to congestion, costing the average driver $2,800+. Congestion pricing launched in 2024 aims to cut central Manhattan traffic by 15–20% and raise $1B/year for transit.',
    source:'INRIX 2019 / MTA Congestion Pricing EIS',
  },
  {
    cat:'cities', icon:'map-pin',
    stat:'17% time reduction',
    title:'Atlanta 1996 Olympics — Traffic Engineering Success',
    body:'Before the 1996 Olympics, Atlanta braced for traffic catastrophe. Instead, a combination of staggered work hours, expanded transit, and media campaigns cut total vehicle trips by 17% — a template still cited in transportation planning today.',
    source:'Georgia DOT / Transportation Research Record',
  },
  {
    cat:'cities', icon:'coffee',
    stat:'55 hours/year',
    title:'Seattle — Fastest-Growing Congestion City',
    body:'Seattle\'s traffic congestion grew faster than any other US metro for a decade straight. Drivers lose ~55 hours/year. The SR-520 bridge and I-5/I-90 interchange are among the most consistently congested corridors in the Pacific Northwest.',
    source:'INRIX 2023 / WSDOT Annual Congestion Report',
  },
];
