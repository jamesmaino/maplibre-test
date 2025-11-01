interface DefaultPopupProps {
  properties: Record<string, any>;
}

/**
 * Generic popup for non-bird features
 */
export function DefaultPopup({ properties }: DefaultPopupProps) {
  return (
    <div className="max-h-60 overflow-y-auto">
      <h4 className="font-bold mb-1">Feature Info</h4>
      {Object.entries(properties)
        .filter(([key]) => !key.startsWith("_"))
        .map(([key, value]) => (
          <p key={key} className="text-slate-600">
            <span className="font-semibold">{key}:</span> {String(value)}
          </p>
        ))}
    </div>
  );
}
