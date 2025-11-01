interface BirdPopupProps {
  stationName: string;
  date: string | null;
  uniqueSpecies: number;
  totalDetections: number | null;
  speciesList: Array<{
    count: number;
    species: {
      id: string;
      commonName: string;
      scientificName: string;
    };
  }>;
}

export default function BirdPopup({
  stationName,
  date,
  uniqueSpecies,
  speciesList,
}: BirdPopupProps) {
  const dateString = new Date(date as string).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-lg font-bold">{stationName}</h4>
        <p className="text-slate-400 text-xs">{dateString}</p>
      </div>

      <p className="text-slate-600 mb-1">
        <span className="font-semibold">Species:</span> {uniqueSpecies}
      </p>
      {/* <p className="text-slate-600 mb-2">
        <span className="font-semibold">Total Detections:</span>{" "}
        {totalDetections}
      </p> */}

      {speciesList && speciesList.length > 0 && (
        <div className="mt-2">
          <div className="max-h-48 overflow-y-auto">
            {speciesList.map((item, idx) => (
              <div
                key={idx}
                className="text-slate-600 py-1 border-b border-slate-200 last:border-b-0"
              >
                <div className="flex justify-between mr-1">
                  <span className="font-medium">{item.species.commonName}</span>
                  <span className="text-slate-500">{item.count}</span>
                </div>
                <div className="text-slate-400 italic text-[10px]">
                  {item.species.scientificName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
