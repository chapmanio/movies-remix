// Types
type TabButtonProps = {
  current: boolean;
  value: 'all' | 'movie' | 'tv' | 'person';
};

// Component
const TabButton: React.FC<TabButtonProps> = ({ current, value, children }) => {
  // Render
  return (
    <button
      type="submit"
      id={`tab-${value}`}
      name="tab"
      value={value}
      className={
        `whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium` +
        (current
          ? ` border-indigo-500 text-indigo-600`
          : ` border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`)
      }
      aria-current={current}
    >
      {children}
    </button>
  );
};

export default TabButton;
