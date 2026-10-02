import React from 'react';
import PropertyDetailView from '../../../components/PropertyDetailView';
import { INITIAL_PROPERTIES } from '../../../data/mockProperties';

export function generateStaticParams() {
  return INITIAL_PROPERTIES.map((property) => ({
    id: property.id,
  }));
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PropertyDetailView propertyId={id} />;
}
