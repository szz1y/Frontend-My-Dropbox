import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebase/firebase"; // Import storage from Firebase
const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const [folderName, setFolderName] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false); // State to track uploading status

  useEffect(() => {
    const fetchFolderName = async () => {
      try {
        const folderDoc = await getDoc(doc(db, "folders", folderId));
        if (folderDoc.exists()) {
          const folderData = folderDoc.data();
          if (folderData) {
            setFolderName(folderData.name);
          }
        } else {
          console.log("Folder not found");
        }
      } catch (error) {
        console.error("Error fetching folder name:", error);
      }
    };

    fetchFolderName();
  }, [folderId]);

  // Function to handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const storageRef = storage.ref(`${folderId}/${file.name}`);
      try {
        await storageRef.put(file);
        console.log("File uploaded successfully");
        // You can add additional logic here, such as updating UI or state
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <Fragment>
      <header className="bg-slate-700 py-5">
        <h1 className="text-center text-white text-2xl capitalize font-bold">
          Folder Name: <span>👉</span> {folderName}
        </h1>
      </header>

      <div className="file-folder-create">
        <input type="file" onChange={handleFileUpload} disabled={uploading} />
        <button disabled={uploading}>Uploading file</button>
        {uploading && <p>Uploading...</p>}
      </div>
    </Fragment>
  );
};

export default FolderPage;
