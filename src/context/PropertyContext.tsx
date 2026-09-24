import React, { createContext, useContext, useState, useEffect } from 'react';
import { PropertyListing, FilterState, ChatMessage, TenancyAgreementData } from '../types';
import { INITIAL_PROPERTIES } from '../data/mockProperties';

interface PropertyContextType {
  properties: PropertyListing[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedProperty: PropertyListing | null;
  setSelectedProperty: (prop: PropertyListing | null) => void;
  activeChatProperty: PropertyListing | null;
  setActiveChatProperty: (prop: PropertyListing | null) => void;
  activeAgreementProperty: PropertyListing | null;
  setActiveAgreementProperty: (prop: PropertyListing | null) => void;
  chatMessages: Record<string, ChatMessage[]>;
  sendMessage: (propertyId: string, text: string, isInspection?: boolean, date?: string) => void;
  addNewProperty: (prop: Omit<PropertyListing, 'id' | 'dateAdded' | 'monthlyEquivalent'>) => PropertyListing;
  totalSavingsNgn: number;
  activeView: 'feed' | 'landlord_studio' | 'agreement_vault' | 'savings_calculator';
  setActiveView: (view: 'feed' | 'landlord_studio' | 'agreement_vault' | 'savings_calculator') => void;
  awsConnection: {
    connected: boolean;
    region: string;
    accountId: string;
    agentStatus: string;
    model: string;
  };
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  selectedCity: 'all',
  selectedArea: 'all',
  maxRent: 6000000,
  solarInverterOnly: false,
  dedicatedPrepaidOnly: false,
  treatedBoreholeOnly: false,
  gatedSecurityOnly: false,
  bedrooms: 'all'
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_CHATS: Record<string, ChatMessage[]> = {
  'prop-yaba-01': [
    {
      id: 'msg-01',
      propertyId: 'prop-yaba-01',
      senderRole: 'landlord',
      senderName: 'Engr. Babatunde O.',
      text: 'Welcome to 28 Commercial Ave! I am the direct owner. No agency or legal fees here. Feel free to ask about the 5kVA solar inverter setup.',
      timestamp: '10:15 AM'
    }
  ]
};

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<PropertyListing[]>(INITIAL_PROPERTIES);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [activeChatProperty, setActiveChatProperty] = useState<PropertyListing | null>(null);
  const [activeAgreementProperty, setActiveAgreementProperty] = useState<PropertyListing | null>(null);
  const [activeView, setActiveView] = useState<'feed' | 'landlord_studio' | 'agreement_vault' | 'savings_calculator'>('feed');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(DEFAULT_CHATS);

  // Load from localStorage on client mount only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProps = localStorage.getItem('lockhouse_properties');
      if (savedProps) {
        try { setProperties(JSON.parse(savedProps)); } catch (e) { console.error(e); }
      }
      const savedChats = localStorage.getItem('lockhouse_chats');
      if (savedChats) {
        try { setChatMessages(JSON.parse(savedChats)); } catch (e) { console.error(e); }
      }
    }
  }, []);

  // Calculate total savings: 20% average agent cut (10% Agency + 10% Legal) across all active listings
  const totalSavingsNgn = properties.reduce((acc, p) => acc + (p.annualRent * 0.20), 0);

  // Sync properties to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lockhouse_properties', JSON.stringify(properties));
    }
  }, [properties]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lockhouse_chats', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  const sendMessage = (propertyId: string, text: string, isInspection = false, date?: string) => {
    const targetProp = properties.find(p => p.id === propertyId);
    const landlordName = targetProp ? targetProp.landlord.name : 'Landlord';

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      propertyId,
      senderRole: 'tenant',
      senderName: 'You (Prospective Tenant)',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInspectionRequest: isInspection,
      inspectionDate: date
    };

    setChatMessages(prev => ({
      ...prev,
      [propertyId]: [...(prev[propertyId] || []), newMsg]
    }));

    // Realistic automated Landlord reply after 1.2 seconds
    setTimeout(() => {
      let replyText = `Thank you for reaching out! As the direct owner of this property, I can confirm everything in the listing is 100% accurate. 0% agency fees.`;
      
      if (text.toLowerCase().includes('solar') || text.toLowerCase().includes('light') || text.toLowerCase().includes('inverter')) {
        replyText = `Regarding power: Yes! The system handles your workstation, fans, lighting, and fridge. It switches automatically without laptop reboot.`;
      } else if (text.toLowerCase().includes('inspection') || isInspection) {
        replyText = `Inspection scheduled for ${date || 'this weekend'}! You will meet me directly at the gate. No inspection fee.`;
      } else if (text.toLowerCase().includes('rent') || text.toLowerCase().includes('negotiat')) {
        replyText = `The rent is direct owner rate. Because there is no ₦300k agent fee, you are already saving hundreds of thousands.`;
      }

      const landlordReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        propertyId,
        senderRole: 'landlord',
        senderName: landlordName,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => ({
        ...prev,
        [propertyId]: [...(prev[propertyId] || []), landlordReply]
      }));
    }, 1200);
  };

  const addNewProperty = (propData: Omit<PropertyListing, 'id' | 'dateAdded' | 'monthlyEquivalent'>): PropertyListing => {
    const newId = `prop-custom-${Date.now()}`;
    const newProp: PropertyListing = {
      ...propData,
      id: newId,
      monthlyEquivalent: Math.round(propData.annualRent / 12),
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setProperties(prev => [newProp, ...prev]);
    return newProp;
  };

  const awsConnection = {
    connected: true,
    region: 'us-east-1',
    accountId: '226579698869',
    agentStatus: 'AWS Bedrock Active',
    model: 'Claude 3.5 Sonnet'
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        filters,
        setFilters,
        selectedProperty,
        setSelectedProperty,
        activeChatProperty,
        setActiveChatProperty,
        activeAgreementProperty,
        setActiveAgreementProperty,
        chatMessages,
        sendMessage,
        addNewProperty,
        totalSavingsNgn,
        activeView,
        setActiveView,
        awsConnection
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};
