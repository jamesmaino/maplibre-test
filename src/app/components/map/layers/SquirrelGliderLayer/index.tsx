
import { memo } from "react";
import { RMarker } from "maplibre-react-components";
import { LayerComponentProps, LayerConfig } from "../../config/layerRegistry";
import * as Colors from "../../../shared/constants/Colors";

// ==========================================
// 1. Type Definitions
// ==========================================

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

// ==========================================
// 2. Child Components
// ==========================================

const CustomMarker = memo(({ baseColor, opacity }: { baseColor: string, opacity: number }) => (
    <svg
      height={50}
      viewBox="0 0 200 250"
      style={{ cursor: "pointer" }}
    >
       <path 
         stroke="black"
         strokeWidth={10}
         strokeOpacity={opacity} 
         fill={baseColor} 
         opacity={opacity} 
         d="m 84.686854,63.23772 c -10.829618,1.132428 -20.769697,7.608234 -31.513331,7.476086 -4.464582,3.342422 10.76041,3.641915 7.044206,10.548905 -1.332266,12.080165 -13.562669,16.772265 -21.417806,24.097189 -7.027678,8.5543 -16.355486,0.54169 -24.238108,2.60501 -0.502234,4.3607 10.977258,4.73493 14.963655,8.39239 12.593924,6.47784 25.337686,13.5129 34.226418,24.88372 5.170574,7.20812 12.08003,13.64057 15.565629,21.66879 2.275609,7.83574 -13.602593,11.2216 -5.816743,16.84115 10.081179,-1.4105 18.497742,-7.19604 27.545646,-11.13257 5.66937,-2.78554 17.1864,-10.71728 15.10647,1.26806 1.0373,10.71731 3.34506,22.19393 -0.58834,32.53531 -3.03127,7.65962 -21.166119,1.1221 -14.70617,13.27966 8.75929,5.75605 22.61365,8.15703 30.43036,-0.87619 6.14476,-7.28385 6.99557,-17.39456 9.25546,-26.22503 1.33068,-7.85104 1.12249,-15.73023 0.67024,-23.51073 -4.83731,-11.57231 9.98055,-7.48555 16.47413,-7.87646 10.37172,-0.46424 20.45058,1.3302 30.49326,3.70379 4.59669,0.41657 9.17825,1.04475 7.98014,-4.06422 -4.86657,-6.3309 -18.26282,-6.08322 -22.99909,-14.83238 -6.80849,-10.55921 -9.89798,-22.97275 -13.96013,-34.73373 -3.77197,-13.757008 -4.04178,-28.381827 -0.49245,-42.204296 0.60251,-7.722534 -12.49059,0.641812 -13.92362,5.551251 -7.28339,7.552401 -19.15038,2.768968 -28.45019,3.961918 -11.20035,0.253437 -16.378377,-10.240506 -22.576783,-16.810535 -3.921733,-0.0601 -5.181755,5.250212 -9.072812,5.452748 m 64.096235,2.030504 -0.0677,0.06768 z m -39.59482,7.512865 -0.0677,0.06768 z m 30.38987,0.631707 -0.0226,0.02257 z m -83.792121,18.31966 -0.06768,0.0677 z m 102.540441,12.386078 -0.0677,0.0677 z m -117.904586,17.80075 -0.06768,0.0677 z m 138.074256,25.71972 -0.0677,0.0677 z m 16.71781,7.3775 -0.0677,0.0677 z m -10.78422,5.12139 -0.0226,0.0451 z m -43.63327,0.83476 -0.0677,0.0677 z m -30.99903,3.72259 -0.0677,0.0677 z m -23.892263,11.37082 -0.06768,0.0677 z m 53.515053,11.88972 -0.0225,0.0451 z m -22.04224,3.88053 -0.0677,0.0677 z"
       />
    </svg>
));
CustomMarker.displayName = 'CustomMarker';

// ==========================================
// 3. Data Transformation
// ==========================================

function transformToObservations(data: any[]): Observation[] {
    return data.map((row) => ({
        observation_id: row.observation_id,
        parent_record_id: row.parent_record_id,
        common_name: row.common_name,
        scientific_name: row.scientific_name,
        number_of_individuals: row.number_of_individuals,
        behaviour_notes: row.behaviour_notes,
        _latitude: row._latitude,
        _longitude: row._longitude,
        _geometry: row._geometry,
    }));
}

// ==========================================
// 4. Main Layer Component
// ==========================================

function SquirrelGliderComponent({ data, onPopupOpen }: LayerComponentProps<Observation[]>) {
    const handleSquirrelGliderClick = (point: any) => {
        onPopupOpen({
            longitude: point._longitude,
            latitude: point._latitude,
            properties: point,
        });
    };

    return (
        <>
            {data.map((point) => (
                <RMarker
                    key={point.observation_id}
                    longitude={point._longitude}
                    latitude={point._latitude}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSquirrelGliderClick(point);
                    }}
                >
                    <CustomMarker
                        baseColor={Colors.normal2}
                        opacity={Colors.foreground_opacity}
                    />
                </RMarker>
            ))}
        </>
    );
}

// ==========================================
// 5. Layer Configuration
// ==========================================

export const squirrelGliderLayer: LayerConfig<Observation[]> = {
    id: "squirrelGliders",
    name: "Squirrel Gliders",
    defaultVisible: true,
    Component: SquirrelGliderComponent,
    dataSource: {
        type: "fulcrum",
        requiresAuth: "admin",
        query: `
            SELECT
                _child_record_id AS observation_id,
                _parent_id AS parent_record_id,
                common_name,
                scientific_name,
                number_of_individuals,
                behaviour_notes,
                _latitude,
                _longitude,
                _geometry
            FROM
                "Project Platypus field crew logging/animals_observed"
            WHERE
                common_name = 'Squirrel Glider '
            ORDER BY
                _parent_id;
        `,
        transform: transformToObservations,
    },
    shouldShow: (data) => data.length > 0,
};
