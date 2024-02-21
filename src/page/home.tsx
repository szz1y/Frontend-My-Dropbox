import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage, db } from "../firebase/firebase";

import file from "../../public/file.svg";
import file2 from "../../public/file2.svg";
import folder from "../../public/folder.svg";
import folder2 from "../../public/folder2.svg";
import close from "../../public/close.svg";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filesRef = collection(db, "files");
        const foldersRef = collection(db, "folders");
        const filesSnapshot = await getDocs(filesRef);
        const foldersSnapshot = await getDocs(foldersRef);
        const fileList = [];
        const folderList = [];
        filesSnapshot.forEach((doc) => {
          fileList.push({ id: doc.id, ...doc.data() });
        });
        foldersSnapshot.forEach((doc) => {
          folderList.push({ id: doc.id, ...doc.data() });
        });
        setFiles(fileList);
        setFolders(folderList);
      } catch (error) {
        console.error("Ma'lumotlarni olishda xatolik:", error);
      }
    };

    fetchData();
  }, [isFolderModalOpen]); // isFolderModalOpen o'zgaruvchisiga bog'liq useEffect

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadedFileName(e.target.files[0].name);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      return;
    }

    const storageRef = ref(storage, `files/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileUploadProgress(progress);
        if (progress === 100) {
          setIsModalOpen(true);
        }
      },
      (error) => {
        console.error("Faylni yuklashda xatolik:", error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedFileUrl(downloadURL);
          saveFileMetadata(selectedFile.name, downloadURL);
          setFiles((prevFiles) => [
            ...prevFiles,
            { name: selectedFile.name, url: downloadURL },
          ]);
        } catch (error) {
          console.error("Yuklash URL manzilini olishda xatolik:", error);
        }
      }
    );
  };

  const saveFileMetadata = async (fileName, fileUrl) => {
    try {
      const filesRef = collection(db, "files");
      const newFile = { name: fileName, url: fileUrl };
      await addDoc(filesRef, newFile);
    } catch (error) {
      console.error("Firestorega fayl metadatasini qo'shishda xatolik:", error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFileUploadProgress(0);
    setSelectedFile(null);
    setUploadedFileName("");
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    alert("Link nusxasi joylashtirildi!");
  };

  const handleDeleteFile = async (url, id) => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, "files", id));
      setFiles((prevFiles) => prevFiles.filter((file) => file.url !== url));
    } catch (error) {
      console.error("Faylni o'chirishda xatolik:", error);
    }
  };

  const handleDeleteFolder = async (id) => {
    try {
      await deleteDoc(doc(db, "folders", id));
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder.id !== id)
      );
    } catch (error) {
      console.error("Papkani o'chirishda xatolik:", error);
    }
  };

  const createFolder = async () => {
    if (folderName.trim() === "") {
      return;
    }

    try {
      const foldersRef = collection(db, "folders");
      await addDoc(foldersRef, { name: folderName });
      setIsFolderModalOpen(false);
      setFolderName("");
    } catch (error) {
      console.error("Papka yaratishda xatolik:", error);
    }
  };

  return (
    <header>
      <div className="container-home flex justify-between">
        <div>
          <h3 className="text-xl font-bold text-center py-5">Faylni yuklash</h3>
          <label className="custum-file-upload" htmlFor="file">
            <div className="icon">
              <img src={file} alt="file" />
            </div>
            <input type="file" id="file" onChange={handleFileChange} />
            {uploadedFileName && (
              <h3 className="font-bold flex items-center pr-2">
                {uploadedFileName}
              </h3>
            )}
          </label>
          <div className="flex justify-between items-center">
            <button
              onClick={handleFileUpload}
              className="rounded-full bg-blue-500 text-white px-3 py-2 m-3 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Yuklash
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-center py-5">Papka yuklash</h3>
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="custum-file-upload"
          >
            <div className="icon">
              <img src={folder} alt="folder" />
            </div>
          </button>
        </div>

        {isFolderModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white relative p-8 rounded-lg">
              <button
                className="absolute top-1 right-1 text-red-500"
                onClick={() => setIsFolderModalOpen(false)}
              >
                <img src={close} alt="close" />
              </button>
              <input
                type="text"
                placeholder="Papka nomini kiriting"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <button
                onClick={createFolder}
                className="rounded-full bg-blue-500 text-white px-3 py-2 m-3 hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
              >
                Papka yaratish
              </button>
            </div>
          </div>
        )}
      </div>
      <hr className="mt-8 border-2" />

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white relative p-8 rounded-lg">
            <button
              className="absolute top-1 right-1 text-red-500"
              onClick={closeModal}
            >
              <img src={close} alt="close" />
            </button>
            <p className="font-bold p-3 text-green-500">
              Fayl muvaffaqiyatli yuklandi!
            </p>
            <div className="flex justify-center p-3">
              <a
                href={uploadedFileUrl}
                className="text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h2 className="font-bold">Faylni ochish</h2>
              </a>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-around file-list">
        <table className="border-collapse ml-5">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="px-4 py-2 text-left">Fayl nomi</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr
                key={index}
                className="flex items-center border-b border-gray-300"
              >
                <td className="flex items-center px-4 py-2">
                  <img src={file2} alt="file2" />
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <h3 className="font-bold">{file.name}</h3>
                  </a>
                </td>
                <td className=" flex items-center px-4 py-2">
                  <button
                    className="px-3 py-1 bg-teal-400 text-white rounded hover:bg-teal-500"
                    onClick={() => handleCopy(file.url)}
                  >
                    Nusxalash
                  </button>
                  <button
                    className="px-3 py-1 ml-3 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => handleDeleteFile(file.url, file.id)}
                  >
                    O'chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="border-collapse ml-5">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="px-4 py-2 text-left">Papka nomi</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((folder, index) => (
              <tr key={index} className="flex items-center justify-between border-b border-gray-300">
                <td className="flex items-center px-4 py-2">
                  <img src={folder2} alt="folder2" />
                  <h3 className="font-bold">{folder.name}</h3>
                </td>
                <td className=" flex items-center px-4 py-2">
                  <button
                    className="px-3 py-1 ml-3 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => handleDeleteFolder(folder.id)}
                  >
                    O'chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </header>
  );
};

export default Home;
