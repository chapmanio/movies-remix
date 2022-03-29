// Types
type PaginationButtonProps = {
  current: boolean;
  value: number;
};

// Component
const PaginationButton: React.FC<PaginationButtonProps> = ({ current, value, children }) => {
  // Render
  return (
    <button
      type="submit"
      name="page"
      value={value}
      className={
        `inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium` +
        (current
          ? ` border-indigo-500 text-indigo-600`
          : ` border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`)
      }
    >
      {children}
    </button>
  );
};

export default PaginationButton;
