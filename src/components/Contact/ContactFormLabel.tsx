export default function ContactFormLabel({
  htmlFor,
  label,
  required,
}: {
  htmlFor: string;
  label: string;
  required: boolean;
}) {
  return (
    <div className="flex items-center mb-2">
      <label htmlFor={htmlFor} className="font-medium text-gray-700">
        {label}
        {required && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-md">
            必須
          </span>
        )}
      </label>
    </div>
  );
}
