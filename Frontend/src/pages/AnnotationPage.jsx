import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Square,
  Circle,
  ArrowUpRight,
  Pen,
  RotateCcw,
  Download,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { useAuth } from "../Contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";

const AnnotationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canvasRef = useRef(null);

  const [submission, setSubmission] = useState(null);
  const [selectedImage, setSelectedImage] = useState("upper");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen, rectangle, circle, arrow
  const [annotations, setAnnotations] = useState({
    upper: [],
    front: [],
    bottom: [],
  });
  const currentAnnotations = annotations[selectedImage] || [];
  const [currentPath, setCurrentPath] = useState([]);

  const penColors = [
    { name: "Inflamed/Red Gums", color: "#6B2B2B" },
    { name: "Malaligned", color: "#FFD700" },
    { name: "Receded Gums", color: "#A0522D" },
    { name: "Stains", color: "#FF0000" },
    { name: "Attrition", color: "#00FFFF" },
    { name: "Crowns", color: "#FF00FF" },
  ];

  const [selectedColor, setSelectedColor] = useState(penColors[0].color);

  // Fetch submission data
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/submissions/${id}`);
        setSubmission(response.data.submission);

        if (response.data.submission.annotationData) {
          setAnnotations(response.data.submission.annotationData);
        }
      } catch (error) {
        toast.error("Failed to fetch submission");
        navigate("/admin-dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [id, navigate]);

  // Initialize canvas on submission or image change
  useEffect(() => {
    if (submission) initializeCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission, selectedImage]);

  const getCurrentImageUrl = () => {
    return submission ? submission[`${selectedImage}ImageUrl`] : null;
  };

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const container = canvas.parentElement;
      const maxWidth = container.clientWidth - 40;
      const maxHeight = 600;

      const aspectRatio = img.width / img.height;
      let canvasWidth, canvasHeight;

      if (img.width > img.height) {
        canvasWidth = Math.min(maxWidth, img.width);
        canvasHeight = canvasWidth / aspectRatio;
      } else {
        canvasHeight = Math.min(maxHeight, img.height);
        canvasWidth = canvasHeight * aspectRatio;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      redrawAnnotations();
    };

    img.src = getCurrentImageUrl();
  };

  const redrawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      currentAnnotations.forEach((annotation) => {
        ctx.strokeStyle = annotation.color || "#ff0000";
        ctx.lineWidth = annotation.lineWidth || 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        switch (annotation.tool) {
          case "pen":
            if (annotation.points?.length > 1) {
              ctx.beginPath();
              ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
              annotation.points.forEach((p) => ctx.lineTo(p.x, p.y));
              ctx.stroke();
            }
            break;

          case "rectangle":
            if (annotation.startX !== undefined) {
              ctx.strokeRect(
                annotation.startX,
                annotation.startY,
                annotation.width,
                annotation.height
              );
            }
            break;

          case "circle":
            if (annotation.centerX !== undefined) {
              ctx.beginPath();
              ctx.arc(
                annotation.centerX,
                annotation.centerY,
                annotation.radius,
                0,
                2 * Math.PI
              );
              ctx.stroke();
            }
            break;

          case "arrow":
            if (annotation.startX !== undefined) {
              drawArrow(
                ctx,
                annotation.startX,
                annotation.startY,
                annotation.endX,
                annotation.endY
              );
            }
            break;

          default:
            break;
        }
      });
    };

    img.src = getCurrentImageUrl();
  };

  const drawArrow = (ctx, startX, startY, endX, endY) => {
    const headlen = 20;
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(
      endX - headlen * Math.cos(angle - Math.PI / 6),
      endY - headlen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - headlen * Math.cos(angle + Math.PI / 6),
      endY - headlen * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setCurrentPath([pos]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getMousePos(e);

    if (tool === "pen") {
      setCurrentPath((prev) => [...prev, pos]);

      if (currentPath.length > 1) {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(
          currentPath[currentPath.length - 2].x,
          currentPath[currentPath.length - 2].y
        );
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else {
      setCurrentPath([currentPath[0], pos]);
      redrawAnnotations();

      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = 3;

      if (tool === "rectangle") {
        const startX = Math.min(currentPath[0].x, pos.x);
        const startY = Math.min(currentPath[0].y, pos.y);
        const width = Math.abs(pos.x - currentPath[0].x);
        const height = Math.abs(pos.y - currentPath[0].y);
        ctx.strokeRect(startX, startY, width, height);
      } else if (tool === "circle") {
        const centerX = currentPath[0].x;
        const centerY = currentPath[0].y;
        const radius = Math.hypot(pos.x - centerX, pos.y - centerY);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === "arrow") {
        drawArrow(ctx, currentPath[0].x, currentPath[0].y, pos.x, pos.y);
      }
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const pos = getMousePos(e);
    let newAnnotation = {};

    if (tool === "pen" && currentPath.length > 1) {
      newAnnotation = {
        tool: "pen",
        points: currentPath,
        color: selectedColor,
        lineWidth: 7,
      };
    } else if (currentPath.length === 2) {
      const start = currentPath[0];
      switch (tool) {
        case "rectangle":
          newAnnotation = {
            tool: "rectangle",
            startX: Math.min(start.x, pos.x),
            startY: Math.min(start.y, pos.y),
            width: Math.abs(pos.x - start.x),
            height: Math.abs(pos.y - start.y),
            color: selectedColor,
            lineWidth: 7,
          };
          break;
        case "circle":
          newAnnotation = {
            tool: "circle",
            centerX: start.x,
            centerY: start.y,
            radius: Math.hypot(pos.x - start.x, pos.y - start.y),
            color: selectedColor,
            lineWidth: 7,
          };
          break;
        case "arrow":
          newAnnotation = {
            tool: "arrow",
            startX: start.x,
            startY: start.y,
            endX: pos.x,
            endY: pos.y,
            color: selectedColor,
            lineWidth: 5,
          };
          break;
        default:
          break;
      }
    }

    if (Object.keys(newAnnotation).length)
      setAnnotations((prev) => ({
        ...prev,
        [selectedImage]: [...currentAnnotations, newAnnotation],
      }));
    setCurrentPath([]);
    redrawAnnotations();
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    redrawAnnotations();
  };

  const saveAnnotations = async () => {
    try {
      setSaving(true);
      const canvas = canvasRef.current;
      const annotatedImageData = canvas.toDataURL("image/png");

      const response = await api.post(`/admin/annotate/${id}`, {
        annotationData: annotations,
        annotatedImageData,
        imageType: selectedImage,
      });

      toast.success("Annotations saved successfully!");
      setSubmission(response.data.submission);
    } catch (error) {
      toast.error("Failed to save annotations");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const downloadAnnotatedImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `annotated-${submission.patientName}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const tools = [
    {
      name: "pen",
      icon: Pen,
      label: "Freehand",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "rectangle",
      icon: Square,
      label: "Rectangle",
      color: "from-green-500 to-green-600",
    },
    {
      name: "circle",
      icon: Circle,
      label: "Circle",
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "arrow",
      icon: ArrowUpRight,
      label: "Arrow",
      color: "from-orange-500 to-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Submission not found
          </h2>
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex space-x-2 mb-4">
          {["upper", "front", "bottom"].map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedImage(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedImage === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} View
            </motion.button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/admin-dashboard")}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Annotation Tool
              </h1>
              <p className="text-gray-600">
                Review and annotate patient submission
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadAnnotatedImage}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveAnnotations}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Annotations</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Patient Info Sidebar */}
          <motion.div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Patient Info
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {submission.patientName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Patient ID
                  </label>
                  <p className="text-gray-900">{submission.patientId}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">{submission.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Upload Date
                  </label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      submission.status === "uploaded"
                        ? "bg-yellow-100 text-yellow-800"
                        : submission.status === "annotated"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {submission.status.toUpperCase()}
                  </span>
                </div>

                {submission.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Notes
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {submission.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tool Palette */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Annotation Tools
                </h3>

                <div className="flex space-x-2 mt-4 mb-2">
                  {penColors.map((c) => (
                    <button
                      key={c.color}
                      onClick={() => setSelectedColor(c.color)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full border-2 ${
                        selectedColor === c.color
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {tools.map((toolOption) => (
                    <motion.button
                      key={toolOption.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTool(toolOption.name)}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        tool === toolOption.name
                          ? `bg-gradient-to-r ${toolOption.color} text-white border-transparent shadow-lg`
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <toolOption.icon className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-xs font-medium">{toolOption.label}</p>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAnnotations}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-sm">Clear</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Canvas Area */}
          <motion.div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Image Annotation
                </h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Selected tool:</span>
                  <span className="font-medium capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {tool}
                  </span>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="max-w-full h-auto border border-gray-300 rounded-lg shadow-md cursor-crosshair bg-white"
                  style={{ display: "block", margin: "0 auto" }}
                />
              </div>

              <div className="mt-4 text-center text-sm text-gray-500">
                Click and drag on the image to create annotations using the
                selected tool
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationPage;
