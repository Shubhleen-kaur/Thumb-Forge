
import React, { useState, useEffect } from "react";

import {
  FaCloudUploadAlt,
  FaDownload,
  FaImage,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

function App() {

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [thumbnail, setThumbnail] = useState([]);

  const [thumbnailSize,
    setThumbnailSize] =
    useState("medium");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [history, setHistory] =
    useState([]);

  const API_URL =
    "https://d5f8t52cr7.execute-api.us-east-1.amazonaws.com/upload";

  const HISTORY_API =
    "https://d5f8t52cr7.execute-api.us-east-1.amazonaws.com/history";

  // FETCH HISTORY
  const fetchHistory = async () => {

    try {

      const response =
        await fetch(HISTORY_API);

      const data =
        await response.json();

      const parsed =
        data.body
          ? JSON.parse(data.body)
          : data;

      setHistory(
        Array.isArray(parsed)
          ? parsed
          : []
      );

    } catch (error) {

      console.error(
        "History error:",
        error
      );

      setHistory([]);
    }
  };

  useEffect(() => {

    fetchHistory();

  }, []);

  // FILE CHANGE
  const handleFileChange = (e) => {

    const selectedFiles =
      Array.from(e.target.files);

    setFiles(selectedFiles);

    const previewUrls =
      selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );

    setPreview(previewUrls);

    setThumbnail([]);

    setMessage("");
  };

  // BASE64
  const convertToBase64 = (file) => {

    return new Promise(
      (resolve, reject) => {

        const reader =
          new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () =>
          resolve(reader.result);

        reader.onerror = (err) =>
          reject(err);
      }
    );
  };

  // UPLOAD FILE
  const uploadFile = async () => {

    if (files.length === 0) {

      setMessage(
        "Please select image"
      );

      return;
    }

    setLoading(true);

    setMessage(
      "Generating thumbnails..."
    );

    try {

      const generatedThumbs = [];

      for (const file of files) {

        const base64Image =
          await convertToBase64(file);

        const response =
          await fetch(API_URL, {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              image: base64Image,

              fileName: file.name,

              thumbnailSize:
                thumbnailSize,
            }),
          });

        const data =
          await response.json();

        let parsedData = data;

        if (
          typeof data.body ===
          "string"
        ) {

          try {

            parsedData =
              JSON.parse(
                data.body
              );

          } catch (e) {

            parsedData = data;
          }
        }

        const thumbUrl =

          parsedData.thumbnailUrl ||

          parsedData.thumbnail_url ||

          parsedData.thumbUrl;

        console.log(
          "Thumbnail URL:",
          thumbUrl
        );

        // WAIT FOR IMAGE
        if (thumbUrl) {

          let success = false;

          for (
            let retry = 0;
            retry < 20;
            retry++
          ) {

            try {

              const imageCheck =
                await fetch(
                  `${thumbUrl}?t=${Date.now()}`
                );

              if (
                imageCheck.ok
              ) {

                generatedThumbs.push(
                  `${thumbUrl}?t=${Date.now()}`
                );

                success = true;

                break;
              }

            } catch (err) {

              console.log(
                "Waiting..."
              );
            }

            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  1000
                )
            );
          }

          if (!success) {

            console.log(
              "Thumbnail timeout"
            );
          }
        }
      }

      setThumbnail(
        [...generatedThumbs]
      );

      setMessage(
        "Thumbnails generated successfully!"
      );

      fetchHistory();

    } catch (error) {

      console.error(error);

      setMessage(
        "Upload failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div style={styles.page}>

      <div style={styles.overlay}>

        {/* HEADER */}

        <div style={styles.header}>

          <h1 style={styles.title}>
            Thumb Forge
          </h1>

          <p style={styles.subtitle}>
            AWS Serverless Smart
            Thumbnail Compression
            System
          </p>

        </div>

        {/* UPLOAD */}

        <div style={styles.uploadSection}>

          <div style={styles.uploadBox}>

            <FaCloudUploadAlt
              size={80}
              color="#60a5fa"
            />

            <h2 style={styles.uploadTitle}>
              Upload Images
            </h2>

            <p style={styles.uploadText}>
              Upload single or
              multiple images
            </p>

            <input
              type="file"
              multiple
              onChange={
                handleFileChange
              }
              style={
                styles.fileInput
              }
            />

          </div>

          {/* SIZE OPTIONS */}

          <div
            style={
              styles.sizeContainer
            }
          >

            {[
              "small",
              "medium",
              "large",
            ].map((size) => (

              <div
                key={size}
                onClick={() =>
                  setThumbnailSize(
                    size
                  )
                }
                style={{
                  ...styles.sizeCard,

                  background:
                    thumbnailSize ===
                    size
                      ? "#2563eb"
                      : "#1e293b",
                }}
              >

                <h3>
                  {size.toUpperCase()}
                </h3>

              </div>

            ))}

          </div>

          {/* BUTTON */}

          <button
            onClick={uploadFile}
            style={styles.button}
          >

            {loading ? (

              <>
                <FaSpinner />

                Generating...
              </>

            ) : (

              <>
                <FaCheckCircle />

                Generate
                Thumbnails
              </>

            )}

          </button>

          <p style={styles.message}>
            {message}
          </p>

        </div>

        {/* GALLERY */}

        {(preview.length > 0 ||
          thumbnail.length > 0) && (

          <div style={styles.gallery}>

            {/* ORIGINAL */}

            {preview.map(
              (img, i) => (

                <div
                  key={i}
                  style={styles.card}
                >

                  <div
                    style={
                      styles.cardHeader
                    }
                  >

                    <FaImage />

                    <h3>
                      Original
                    </h3>

                  </div>

                  <img
                    src={img}
                    alt="original"
                    style={
                      styles.image
                    }
                  />

                </div>

              )
            )}

            {/* GENERATED */}

            {thumbnail.map(
              (img, i) => (

                <div
                  key={i}
                  style={styles.card}
                >

                  <div
                    style={
                      styles.cardHeader
                    }
                  >

                    <FaImage />

                    <h3>
                      Generated
                    </h3>

                  </div>

                  <img
                    src={img}
                    alt="thumbnail"
                    style={
                      styles.image
                    }
                  />

                  <a
                    href={img}
                    download
                    style={
                      styles.downloadButton
                    }
                  >

                    <FaDownload />

                    Download

                  </a>

                </div>

              )
            )}

          </div>

        )}

        {/* HISTORY */}

        <div
          style={
            styles.historySection
          }
        >

          <h2
            style={
              styles.historyTitle
            }
          >
            Recent Thumbnails
          </h2>

          <div
            style={
              styles.historyGrid
            }
          >

            {history.map(
              (item, i) => (

                <div
                  key={i}
                  style={
                    styles.historyCard
                  }
                >

                  <img
                    src={
                      `${item.thumbnail_url}?t=${Date.now()}`
                    }
                    alt="history"
                    style={
                      styles.historyImage
                    }
                  />

                  <div
                    style={
                      styles.historyInfo
                    }
                  >

                    <p
                      style={
                        styles.infoText
                      }
                    >
                      <strong>
                        Size:
                      </strong>{" "}
                      {
                        item.thumbnail_size
                      }
                    </p>

                    <p
                      style={
                        styles.infoText
                      }
                    >
                      <strong>
                        Original:
                      </strong>{" "}
                      {
                        item.original_size
                      } KB
                    </p>

                    <p
                      style={
                        styles.infoText
                      }
                    >
                      <strong>
                        Compressed:
                      </strong>{" "}
                      {
                        item.compressed_size
                      } KB
                    </p>

                    <p
                      style={
                        styles.infoText
                      }
                    >
                      <strong>
                        Compression:
                      </strong>{" "}
                      {
                        item.compression_percent
                      }%
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// STYLES
const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(to right, #020617, #0f172a)",
    padding: "40px",
    fontFamily: "Arial",
  },

  overlay: {
    maxWidth: "1400px",
    margin: "auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "50px",
  },

  title: {
    color: "white",
    fontSize: "70px",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#cbd5e1",
    fontSize: "24px",
  },

  uploadSection: {
    background:
      "rgba(30,41,59,0.95)",
    borderRadius: "25px",
    padding: "40px",
    marginBottom: "50px",
  },

  uploadBox: {
    border:
      "2px dashed rgba(255,255,255,0.2)",
    borderRadius: "20px",
    padding: "50px",
    textAlign: "center",
  },

  uploadTitle: {
    color: "white",
    marginTop: "20px",
    fontSize: "35px",
  },

  uploadText: {
    color: "#94a3b8",
    fontSize: "18px",
  },

  fileInput: {
    marginTop: "20px",
    color: "white",
    fontSize: "17px",
  },

  sizeContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px",
    flexWrap: "wrap",
  },

  sizeCard: {
    padding: "20px 35px",
    borderRadius: "14px",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  button: {
    width: "100%",
    marginTop: "30px",
    padding: "18px",
    border: "none",
    borderRadius: "15px",
    background: "#2563eb",
    color: "white",
    fontSize: "22px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    fontWeight: "bold",
  },

  message: {
    color: "white",
    textAlign: "center",
    marginTop: "20px",
    fontSize: "18px",
  },

  gallery: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(350px,1fr))",
    gap: "30px",
    marginTop: "50px",
  },

  card: {
    background:
      "rgba(30,41,59,0.95)",
    borderRadius: "20px",
    padding: "20px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "white",
    marginBottom: "15px",
  },

  image: {
    width: "100%",
    height: "320px",
    objectFit: "contain",
    borderRadius: "15px",
    background: "#0f172a",
  },

  downloadButton: {
    marginTop: "15px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "#2563eb",
    color: "white",
    padding: "12px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  historySection: {
    marginTop: "70px",
  },

  historyTitle: {
    color: "white",
    textAlign: "center",
    fontSize: "45px",
    marginBottom: "30px",
  },

  historyGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "25px",
  },

  historyCard: {
    background:
      "rgba(30,41,59,0.95)",
    borderRadius: "18px",
    padding: "15px",
  },

  historyImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "15px",
  },

  historyInfo: {
    marginTop: "15px",
  },

  infoText: {
    color: "white",
    fontSize: "15px",
    marginBottom: "8px",
  },
};

export default App;
