import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

export const DragUpload = ({ store }: { store: any }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () =>
        store.setBackground({ type: "image", image: reader.result as string });
      reader.onerror = () => toast.error("Could not read background image.");
      reader.readAsDataURL(file);
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-dashed border-2 p-4 rounded-lg text-center cursor-pointer"
    >
      <input {...getInputProps()} />
      <p>Drag & drop an image or click to upload</p>
    </div>
  );
};
