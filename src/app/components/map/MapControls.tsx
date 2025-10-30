interface LayerToggle {
  id: string;
  name: string;
  isVisible: boolean;
  toggle: () => void;
}

interface MapControlsProps {
  layerToggles: LayerToggle[];
}

/**
 * Dynamic map controls that automatically render based on layer registry
 */
export function MapControls({ layerToggles }: MapControlsProps) {
  return (
    <div className="absolute left-4 top-20 flex flex-col space-y-2">
      {layerToggles.map((layer) => (
        <button
          key={layer.id}
          onClick={layer.toggle}
          className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
            layer.isVisible
              ? "bg-gray-600 text-white hover:bg-gray-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {layer.isVisible ? `${layer.name} On` : `${layer.name} Off`}
        </button>
      ))}
    </div>
  );
}
