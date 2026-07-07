export interface ReviewResultTab {
  key: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: ReviewResultTab[];
  active: string;
  onChange: (key: string) => void;
}

export default function ReviewResultTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="no-print flex flex-wrap gap-1 border-b border-slate-200">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "text-teal-700" : "text-slate-500 hover:text-navy-700"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  isActive ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-teal-600" />}
          </button>
        );
      })}
    </div>
  );
}
