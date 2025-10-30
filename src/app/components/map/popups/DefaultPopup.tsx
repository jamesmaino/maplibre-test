interface DefaultPopupProps {
  properties: Record<string, any>;
}

/**
 * Generic popup for non-bird features
 */
export function DefaultPopup({ properties }: DefaultPopupProps) {
  return (
    <>
      <h4 className="font-bold mb-1">Feature Info</h4>
      {Object.entries(properties)
        .filter(([key]) => !key.startsWith("_"))
        .map(([key, value]) => (
          <p key={key} className="text-slate-600">
            <span className="font-semibold">{key.replaceAll("_", " ")}:</span>{" "}
            {String(value)}
          </p>
        ))}
    </>
  );
}
