import React, { Fragment, useEffect, useState, ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { auth, db, InFolderCreateFolder, storage } from "../firebase/firebase";
import file from "../../public/file.svg";
import file2 from "../../public/file2.svg";
import folder from "../../public/folder.svg";
import folder2 from "../../public/folder2.svg";
import closes from "../../public/close.svg";

import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

interface Folder {
  name: string;
  id: string;
}

const FolderPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const userId = auth.currentUser?.uid || "";
  const [folderName, setFolderName] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [folderCall, setFolderCall] = useState<Folder[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string }[]
  >([]);

  useEffect(() => {
    const fetchFolderName = async () => {
      try {
        if (folderId) {
          const folderDoc = await getDoc(
            doc(db, "folders", userId, "folder", folderId)
          );
          if (folderDoc.exists()) {
            const folderData = folderDoc.data();
            if (folderData) {
              setFolderName(folderData.name);
            }
          } else {
            console.log("Folder not found");
          }
        }
      } catch (error) {
        console.error("Error fetching folder name:", error);
      }
    };

    fetchFolderName();
  }, [folderId, userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (folderId) {
          const foldersRef = collection(
            db,
            "folders",
            userId,
            "folder",
            folderId,
            "newFolder"
          );
          const foldersSnapshot = await getDocs(foldersRef);
          const folderList: Folder[] = [];
          foldersSnapshot.forEach((doc) => {
            folderList.push({ id: doc.id, ...doc.data() } as Folder);
          });
          setFolderCall(folderList);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [folderCall, userId, folderId]);

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      const storageRef = ref(storage, `${folderId}/uploads`);
      try {
        const filesList = await listAll(storageRef);
        const promises = filesList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return { name: item.name, url };
        });
        const files = await Promise.all(promises);
        setUploadedFiles(files);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };

    fetchUploadedFiles();
  }, [folderId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles) {
      const storageRef = ref(storage, `${folderId}/uploads`);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileRef = ref(storageRef, file.name);

        try {
          await uploadBytes(fileRef, file);
          console.log("File uploaded successfully");
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      }

      const filesList = await listAll(storageRef);
      const promises = filesList.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return { name: item.name, url };
      });
      const files = await Promise.all(promises);
      setUploadedFiles(files);

      setSelectedFiles(null);
    }
  };

  const handleFileDelete = async (fileName: string) => {
    const storageRef = ref(storage, `${folderId}/uploads/${fileName}`);
    try {
      await deleteObject(storageRef);
      console.log("File deleted successfully");
      setUploadedFiles((prevFiles) =>
        prevFiles.filter((file) => file.name !== fileName)
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const createFolder = async () => {
    if (folderName.trim() === "") {
      return;
    }
    if (folderId) {
      try {
        await InFolderCreateFolder(folderId, folderName);
        setIsFolderModalOpen(false);
        setFolderName("");
      } catch (error) {
        console.error("Error creating folder:", error);
      }
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const openFolderModal = () => {
    setFolderName("");
    setIsFolderModalOpen(true);
  };

  const handleFolderNameChange = (e: { target: { value: string } }) => {
    setFolderName(e.target.value);
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      if (folderId)
        await deleteDoc(
          doc(db, "folders", userId, "folder", folderId, "newFolder", id)
        );
      setFolderCall((prevFolders) =>
        prevFolders.filter((folder) => folder.id !== id)
      );
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  return (
    <Fragment>
      <header className="py-5 bg-slate-700">
        <h1 className="text-2xl font-bold text-center capitalize text-white">
          Folder Name: <span>👉</span> {folderName}
        </h1>
      </header>
      <div className="container-home">
        <div>
          <h3 className="py-5 text-xl font-bold text-center">Upload File</h3>

          <div className="flex justify-between">
            <div>
              <label
                className="custum-file-upload folder-file-upload"
                htmlFor="file"
              >
                <div className="icon">
                  <img src={file} alt="file" />
                </div>
                <input type="file" id="file" onChange={handleFileChange} />
                {selectedFiles && (
                  <div className="flex items-center pr-2 font-bold">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index}>{file.name}</div>
                    ))}
                  </div>
                )}
              </label>
              <div>
                <button
                  onClick={handleFileUpload}
                  className="px-3 py-2 m-3 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Upload
                </button>
              </div>
            </div>
            <div className="-mt-7">
              <h3 className="py-5 text-xl font-bold text-center">
                Create Folder
              </h3>
              <button onClick={openFolderModal} className="custum-file-upload">
                <div className="icon">
                  <img src={folder} alt="folder" />
                </div>
              </button>
            </div>
          </div>

          {isFolderModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="relative p-8 bg-white rounded-lg">
                <button
                  className="absolute text-red-500 top-1 right-1"
                  onClick={() => setIsFolderModalOpen(false)}
                >
                  <img src={closes} alt="close" />
                </button>
                <input
                  type="text"
                  placeholder="Enter Folder Name"
                  value={folderName}
                  onChange={handleFolderNameChange}
                  className="px-3 py-2 mb-3 border border-gray-300 rounded"
                />
                <button
                  onClick={createFolder}
                  className="px-3 py-2 m-3 text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                  Create Folder
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-5 uploaded-files">
            <table className="overflow-hidden bg-white rounded-lg shadow-md">
              <thead className="text-gray-700 bg-gray-200">
                <tr>
                  <th className="px-4 py-2 font-bold">File Name</th>
                  <th className="px-4 py-2 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file, index) => (
                  <tr
                    className="bg-gray-100 border-b border-gray-200"
                    key={index}
                  >
                    <td className="flex items-center px-4 py-2">
                      <img src={folder2} alt="folder" className="mr-2" />
                      <h3 className="mr-1 font-bold">+</h3>
                      <img src={file2} alt="file" className="mr-2" />
                      <a
                        className="font-bold text-blue-700"
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {file.name}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="px-2 py-1 mr-2 font-semibold text-blue-700 bg-transparent border border-blue-500 rounded hover:bg-blue-500 hover:text-white hover:border-transparent"
                        onClick={() => handleCopyLink(file.url)}
                      >
                        Copy Link
                      </button>
                      <button
                        className="px-2 py-1 font-semibold text-red-700 bg-transparent border border-red-500 rounded hover:bg-red-500 hover:text-white hover:border-transparent"
                        onClick={() => handleFileDelete(file.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className=" bg-white border-collapse rounded-lg shadow-md verflow-hidden">
              <thead className="text-gray-700 bg-gray-200">
                <tr className="border-b-2 border-gray-400">
                  <th className="px-4 py-2 text-left">Folder Name</th>
                </tr>
              </thead>
              <tbody>
                {folderCall.map((folder, index) => (
                  <tr
                    key={index}
                    className="flex items-center justify-between border-b border-gray-300"
                  >
                    <td className="flex items-center px-4 py-2">
                      <img className="mr-2" src={folder2} alt="folder2" />
                      <Link to={`/folder/${folder.id}`}>
                        <h3 className="font-bold text-yellow-500">
                          {folder.name}
                        </h3>
                      </Link>
                    </td>
                    <td className="flex items-center px-4 py-2 ">
                      <button
                        className="px-3 py-1 ml-3 text-white bg-red-600 rounded hover:bg-red-700"
                        onClick={() => handleDeleteFolder(folder.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div> 
    </Fragment>
  );
};

export default FolderPage;
