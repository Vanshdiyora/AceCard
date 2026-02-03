export function ProfileTypeInlinePicker({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (type: number) => void;
}) {
  return (
    <div className="w-full bg-white/90 backdrop-blur rounded-2xl p-3 shadow-md">
      <p className="text-xs font-semibold text-gray-500 mb-2">
        Select Profile Layout
      </p>

    <div className="grid grid-cols-3 gap-3">

        {[1, 2, 3].map((t) => (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className={`border rounded-xl p-2 transition ${
              current === t
                ? "border-black ring-2 ring-gray-300"
                : "border-gray-200"
            }`}
          >
            <img
              src={
                t === 1
                  ? "/profileLayout/profile-1.jpg"
                  : t === 2
                  ? "/profileLayout/profile-2.jpg"
                  : "/profileLayout/profile-3.jpg"
              }
              className="w-full rounded"
            />
            <p className="text-xs text-center mt-2">
              {t === 1 && "Profile Picture"}
              {t === 2 && "Small Profile"}
              {t === 3 && "Cover + Profile"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
