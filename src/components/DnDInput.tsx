export const DnDInput = ({
  onChange,
  accept,
}: {
  onChange: (file: File | undefined) => void;
  accept?: string;
}) => {
  const handleDragOver: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
  };
  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange(e.target.files?.[0]);
    e.target.value = ""; // clear input
  };

  return (
    <label
      className="w-full max-w-lg p-6 bg-white border-2 border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-50 transition"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="cursor-pointer flex flex-col items-center text-center">
        <p className="text-gray-500 text-lg">Drag & Drop your file here</p>
        <p className="text-gray-400 text-sm mt-2">or click to select a file</p>

        <input
          type="file"
          onChange={handleFileChange}
          accept={accept ?? "images/*"}
          className="hidden"
        />
      </div>
    </label>
  );
};
