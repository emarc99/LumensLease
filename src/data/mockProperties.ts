import { PropertyListing } from '../types';

export const INITIAL_PROPERTIES: PropertyListing[] = [
  {
    id: 'prop-bodija-01',
    title: 'Executive 2-Bedroom Flat in Old Bodija with 5kVA Solar Inverter',
    description: 'Serene, secure residential flat located in Old Bodija. Fully fitted with a 5kVA solar inverter system guaranteeing 24/7 power for remote workstation and domestic appliances. Clean treated borehole water, dedicated prepaid meter, and paved compound with uniformed night guard.',
    area: 'Bodija',
    city: 'Ibadan, Oyo State',
    address: '12 Osuntokun Avenue, Old Bodija',
    annualRent: 1600000,
    monthlyEquivalent: 133333,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'two_bedroom',
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    utility: {
      gridHoursPerDay: 16,
      backupPowerType: 'solar_inverter',
      inverterCapacityKva: 5.0,
      waterSource: 'treated_borehole',
      meterType: 'dedicated_prepaid',
      compoundSecurity: 'gated_night_guard',
      floodRiskLevel: 'zero_flood_zone',
      verifiedByAi: true,
      communityRating: 4.9
    },
    preferences: {
      employmentStatus: 'working_professional',
      maritalStatusPreference: 'singles_welcome',
      religiousPreference: 'any',
      smokingAllowed: false,
      maxOccupants: 3
    },
    landlord: {
      name: 'Chief Babatunde Adeleke',
      verifiedOwner: true,
      yearsAsOwner: 16,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      phoneMasked: '+234 803 *** 4109',
      bio: 'Retired university administrator residing in Bodija. I installed this solar backup so young professionals can work peacefully. Zero caretaker or agent commission.'
    },
    aiAuditNotes: [
      '✓ IBEDC Feeder Line verified: Average 16.2 hours grid power/day',
      '✓ 5kVA Solar Inverter + Lithium Battery bank inspected and verified',
      '✓ Dedicated Conlog prepaid meter installed inside flat',
      '✓ Deep industrial borehole with automated overhead pressure pumping'
    ],
    dateAdded: '2026-09-28'
  },
  {
    id: 'prop-akobo-02',
    title: 'Modern 1-Bedroom Apartment off General Gas, Akobo',
    description: 'Perfect for tech professionals and creatives. Newly tiled self-contained apartment with POP ceiling, dedicated kitchen cabinet, and private prepaid meter. Constant IBEDC supply backed by hybrid solar inverter. Located in a secure gated close off General Gas road.',
    area: 'Akobo',
    city: 'Ibadan, Oyo State',
    address: '8 Kolapo Ishola GRA Extension, Akobo',
    annualRent: 950000,
    monthlyEquivalent: 79166,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'one_bedroom',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80'
    ],
    utility: {
      gridHoursPerDay: 18,
      backupPowerType: 'hybrid',
      inverterCapacityKva: 3.5,
      waterSource: 'treated_borehole',
      meterType: 'dedicated_prepaid',
      compoundSecurity: 'gated_night_guard',
      floodRiskLevel: 'zero_flood_zone',
      verifiedByAi: true,
      communityRating: 4.8
    },
    preferences: {
      employmentStatus: 'working_professional',
      maritalStatusPreference: 'singles_welcome',
      religiousPreference: 'any',
      smokingAllowed: false,
      maxOccupants: 2
    },
    landlord: {
      name: 'Mrs. Folashade Alabi',
      verifiedOwner: true,
      yearsAsOwner: 8,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      phoneMasked: '+234 805 *** 8820',
      bio: 'Secondary school principal. I manage my own property directly. No ₦150k agent cut from students or young workers.'
    },
    aiAuditNotes: [
      '✓ Dedicated prepaid meter verified: complete personal billing autonomy',
      '✓ Paved driveway with 0 flood vulnerability during heavy Ibadan rains',
      '✓ Gated close with community vigilante security post'
    ],
    dateAdded: '2026-09-29'
  },
  {
    id: 'prop-oluyole-03',
    title: 'Luxury 3-Bedroom Semi-Detached in Oluyole Estate',
    description: 'Spacious family home in prime Oluyole Estate. Large compound, ample parking for 3 cars, perimeter electric fence, automated water treatment plant, and heavy-duty 7.5kVA solar backup for whole-house lighting, fans, and refrigeration.',
    area: 'Oluyole',
    city: 'Ibadan, Oyo State',
    address: 'Plot 15 Industrial Layout Road, Oluyole Estate',
    annualRent: 2400000,
    monthlyEquivalent: 200000,
    bedrooms: 3,
    bathrooms: 3,
    propertyType: 'three_bedroom',
    photos: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80'
    ],
    utility: {
      gridHoursPerDay: 19,
      backupPowerType: 'solar_inverter',
      inverterCapacityKva: 7.5,
      waterSource: 'treated_borehole',
      meterType: 'dedicated_prepaid',
      compoundSecurity: 'gated_night_guard',
      floodRiskLevel: 'zero_flood_zone',
      verifiedByAi: true,
      communityRating: 5.0
    },
    preferences: {
      employmentStatus: 'business_owner',
      maritalStatusPreference: 'married_preferred',
      religiousPreference: 'any',
      smokingAllowed: false,
      maxOccupants: 5
    },
    landlord: {
      name: 'Dr. Kunle Oladipo',
      verifiedOwner: true,
      yearsAsOwner: 12,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      phoneMasked: '+234 802 *** 3311',
      bio: 'Surgeon at UCH. I believe in direct contractual transparency and fair tenancy agreements under Oyo State law.'
    },
    aiAuditNotes: [
      '✓ High-reliability Oluyole commercial feeder: 19 hours daily light average',
      '✓ Industrial water filtration system with laboratory-grade purity',
      '✓ Dedicated prepaid meter inside the duplex'
    ],
    dateAdded: '2026-09-30'
  },
  {
    id: 'prop-samonda-04',
    title: 'Self-Contained Studio Apartment near UI, Samonda',
    description: 'Cozy, modern self-contained studio just 5 minutes from the University of Ibadan front gate. Pop ceiling, kitchenette, water heater, and shared standby solar inverter for continuous workstation power. High demand among tech trainees and academic researchers.',
    area: 'Samonda',
    city: 'Ibadan, Oyo State',
    address: '4 Polytechnic Road, Samonda',
    annualRent: 650000,
    monthlyEquivalent: 54166,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'self_contained',
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    utility: {
      gridHoursPerDay: 15,
      backupPowerType: 'solar_inverter',
      inverterCapacityKva: 2.5,
      waterSource: 'treated_borehole',
      meterType: 'dedicated_prepaid',
      compoundSecurity: 'gated_only',
      floodRiskLevel: 'zero_flood_zone',
      verifiedByAi: true,
      communityRating: 4.7
    },
    preferences: {
      employmentStatus: 'student_allowed',
      maritalStatusPreference: 'singles_welcome',
      religiousPreference: 'any',
      smokingAllowed: false,
      maxOccupants: 1
    },
    landlord: {
      name: 'Pa Johnson Makinde',
      verifiedOwner: true,
      yearsAsOwner: 22,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      phoneMasked: '+234 814 *** 7712',
      bio: 'Retired civil servant living next door. I don’t allow caretakers to exploit students or young graduates with illegal fees.'
    },
    aiAuditNotes: [
      '✓ Dedicated prepaid meter inside the unit: no landlord interference',
      '✓ Solar inverter backup keeps router and laptop running throughout night',
      '✓ Gated compound locked by 10 PM'
    ],
    dateAdded: '2026-09-27'
  },
  {
    id: 'prop-jericho-05',
    title: 'Peaceful 2-Bedroom Apartment in Jericho / Agodi GRA Axis',
    description: 'Serene, tree-lined residential street in Jericho GRA. High-ceiling rooms, cross-ventilation, individual prepaid meter, continuous borehole water, and 24-hour estate gate security patrol.',
    area: 'Jericho',
    city: 'Ibadan, Oyo State',
    address: '7 Onireke Layout, Jericho Axis',
    annualRent: 1900000,
    monthlyEquivalent: 158333,
    bedrooms: 2,
    bathrooms: 2,
    propertyType: 'two_bedroom',
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
    ],
    utility: {
      gridHoursPerDay: 20,
      backupPowerType: 'hybrid',
      inverterCapacityKva: 3.5,
      waterSource: 'treated_borehole',
      meterType: 'dedicated_prepaid',
      compoundSecurity: 'gated_night_guard',
      floodRiskLevel: 'zero_flood_zone',
      verifiedByAi: true,
      communityRating: 4.9
    },
    preferences: {
      employmentStatus: 'working_professional',
      maritalStatusPreference: 'any',
      religiousPreference: 'any',
      smokingAllowed: false,
      maxOccupants: 3
    },
    landlord: {
      name: 'Alhaja Sikirat Bello',
      verifiedOwner: true,
      yearsAsOwner: 15,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
      phoneMasked: '+234 803 *** 1900',
      bio: 'Direct owner residing in Jericho. Looking for respectful working tenants who value quiet living.'
    },
    aiAuditNotes: [
      '✓ Premium Jericho GRA grid line with continuous 20h average power',
      '✓ Dedicated prepaid meter verified: 0 communal electric bill disputes',
      '✓ Guarded perimeter gate with visitor logbook'
    ],
    dateAdded: '2026-09-26'
  }
];
