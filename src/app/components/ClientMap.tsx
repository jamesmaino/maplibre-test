'use client';

import dynamic from 'next/dynamic';

import { Geometry } from 'geojson';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
});

export interface Observation {
    observation_id: string;
    parent_record_id: string;
    common_name: string;
    scientific_name: string;
    number_of_individuals: number;
    behaviour_notes: string;
    _latitude: number;
    _longitude: number;
    _geometry: string;
}

export interface Transect {
  _record_id: string;
  _geometry: Geometry;
}

export interface HistoricalData {
  _record_id: string;
  _latitude: number;
  _longitude: number;
  _geometry: Geometry;
  polygon_points: string;
  site_name: string;
}

export interface MapData {
  squirrel_glider_data: Observation[];
  transect_data: Transect[];
  historical_data: HistoricalData[];
}

export default function ClientMap({ data }: { data: MapData }) {
  return <Map data={data} />;
}