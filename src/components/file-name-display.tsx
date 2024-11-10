import { useState } from "react";

function FilenameDisplay({
  initialName,
  onSave,
}: {
  initialName: string;
  onSave: (name: string) => void;
}) {
  const fileNameWithoutExtension = initialName.replace(/\.[^/.]+$/, "");
  const fileExtension = initialName.split(".").pop() ?? "";

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(fileNameWithoutExtension);

  const handleSave = () => {
    const updatedName = `${tempName}.${fileExtension}`;
    setIsEditing(false);
    onSave(updatedName);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempName(fileNameWithoutExtension);
  };

  return (
    <div className="flex items-center space-x-2">
      {isEditing ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="rounded border border-gray-300 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSave}
            className="rounded bg-blue-500 px-2 py-1 text-sm font-medium text-white hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="rounded bg-gray-200 px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex cursor-pointer items-center space-x-1 rounded px-2 py-1">
          <span>Name: </span>
          <span
            onClick={() => setIsEditing(true)}
            className="underline-dashed underline hover:bg-gray-800"
          >
            {initialName}
          </span>
        </div>
      )}
    </div>
  );
}

export default FilenameDisplay;
