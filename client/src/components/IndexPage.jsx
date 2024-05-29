import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import DocumentCard from "./DocumentCard";
import { UserContext } from "../UserContext";

// const IndexPage = () => {
//   const { user } = useContext(UserContext);
//   const [documents, setDocuments] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     if (user) {
//       const fetchDocuments = async () => {
//         try {
//           const response = await axios.get("/documents", {
//             params: { userId: user._id },
//           });
//           setDocuments(response.data);
//         } catch (error) {
//           console.error("Error fetching documents:", error);
//         }
//       };

//       fetchDocuments(); // Invoke the fetchDocuments function
//     }
//   }, [user]); // Ensure that the effect runs again when `user` changes

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//   };

//   const handleFileUpload = async (event) => {
//     event.preventDefault();
//     if (!selectedFile || !user) return;

//     const formData = new FormData();
//     formData.append("file", selectedFile);
//     formData.append("userId", user._id);

//     try {
//       await axios.post("/upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       setSelectedFile(null);
//       fileInputRef.current.value = "";

//       const response = await axios.get("/documents", {
//         params: { userId: user._id },
//       });
//       setDocuments(response.data);
//     } catch (error) {
//       console.error("Error uploading file:", error);
//     }
//   };

//   if (!user) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Document Cards</h1>
//       <form onSubmit={handleFileUpload} className="mb-4">
//         <input
//           type="file"
//           onChange={handleFileChange}
//           ref={fileInputRef}
//           className="border border-gray-300 p-2 rounded mb-2"
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//         >
//           Upload
//         </button>
//       </form>
//       <div className="flex flex-wrap">
//         {documents.map((document) => (
//           <DocumentCard key={document._id} document={document} />
//         ))}
//       </div>
//     </div>
//   );
// };

function IndexPage() {
  return <div>index page here</div>;
}
export default IndexPage;
