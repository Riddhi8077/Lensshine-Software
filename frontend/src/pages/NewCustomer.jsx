import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import QRCode from "react-qr-code";

import {
  Glasses, User, Eye, FileText, CreditCard, CheckCircle, Check,
  Camera, Keyboard, Upload, ChevronRight, ChevronLeft, Printer, Mail,
  Plus, Minus, ArrowRight
} from "lucide-react";

import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { useRef } from "react";

const API = "http://localhost:5000"; // change later if needed

// simple replacement of cn()
const cn = (...classes) => classes.filter(Boolean).join(" ");

const STEPS = [
  { label: "Frame", icon: Glasses },
  { label: "Details", icon: User },
  { label: "Lens", icon: Eye },
  { label: "Summary", icon: FileText },
  { label: "Payment", icon: CreditCard },
  { label: "Confirm", icon: CheckCircle },
  { label: "Done", icon: Check },
];

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

function NewCustomer() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0: Frame
  const [frameMethod, setFrameMethod] = useState("manual");
  const [framePrice, setFramePrice] = useState("");
  const [scanActive, setScanActive] = useState(false);

  // Step 1: Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date());
  const [prescriptionType, setPrescriptionType] = useState("manual");
  const [prescriptionImage, setPrescriptionImage] = useState("");
  const [rightEye, setRightEye] = useState("");
  const [leftEye, setLeftEye] = useState("");

  // Step 2: Lens
  const [lenses, setLenses] = useState([]);
  const [selectedLens, setSelectedLens] = useState(null);

  // Step 3+: Order/Payment
  const [orderId, setOrderId] = useState(null);
  const [orderData, setOrderData] = React.useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState("qr");

  const totalAmount =
    (parseFloat(framePrice) || 0) + (selectedLens?.price || 0);

  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    axios.get(`${API}/lenses`).then(r => setLenses(r.data)).catch(() => {});
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPrescriptionImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSimulateScan = () => {
    setScanActive(true);
    setTimeout(() => {
      const prices = [500, 800, 1200, 1500, 2000, 2500, 3000];
      setFramePrice(String(prices[Math.floor(Math.random() * prices.length)]));
      setScanActive(false);
      toast.success("Frame QR scanned successfully!");
    }, 1500);
  };

  const createOrder = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        customer_name: customerName,
        mobile,
        address,
        booking_date: format(bookingDate, "yyyy-MM-dd"),
        prescription: {
          type: prescriptionType,
          image_data: prescriptionImage,
          right_eye: rightEye,
          left_eye: leftEye,
        },
        frame_price: parseFloat(framePrice) || 0,
        lens_name: selectedLens?.name || "",
        lens_price: selectedLens?.price || 0,
        total_amount: totalAmount,
        paid_amount: 0,
        remaining_amount: totalAmount,
        payment_status: "pending",
        payments: [],
      };
      const res = await axios.post(`${API}/orders`, payload);
      setOrderId(res.data.id);
      setOrderData(res.data);
      setPayAmount(totalAmount);
      setStep(4);
    } catch {
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  }, [customerName, mobile, address, bookingDate, prescriptionType, prescriptionImage, rightEye, leftEye, framePrice, selectedLens, totalAmount]);

  const confirmPayment = useCallback(async () => {
    if (!orderId || payAmount <= 0) return;
    setLoading(true);
    try {
      const res = await axios.patch(`${API}/orders/${orderId}/payment`, {
        amount: payAmount,
        method: payMethod,
      });
      setOrderData(res.data);
      setStep(5);
      toast.success("Payment recorded!");
    } catch {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  }, [orderId, payAmount, payMethod]);


  const canNext = () => {
    if (step === 0) return parseFloat(framePrice) > 0;
    if (step === 1) return customerName.trim() && mobile.trim().length >= 10;
    if (step === 2) return selectedLens !== null;
    return true;
  };

  const nextStep = () => {
    if (step === 3) { createOrder(); return; }
    if (step < 6) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // Auto-fill from existing customer
  const checkExistingCustomer = async (mobileNum) => {
    if (mobileNum.length < 10) return;
    try {
      const res = await axios.get(`${API}/customers/search?mobile=${mobileNum}`);
      if (res.data.length > 0) {
        const c = res.data[0];
        setCustomerName(c.full_name || "");
        setAddress(c.address || "");
        toast.info("Existing customer found - details auto-filled!");
      }
    } catch {}
  };

  // PRINT FUNCTION (clean + safe)
const handlePrint = () => {
  window.print();
};

const invoiceRef = useRef(null);

const sendInvoice = async () => {
  try {
    // STEP 1: Generate image
    const imageBlob = await generateInvoiceImage();
   console.log("Image Blob:", imageBlob);

    // 🔥 STEP 3 TEST
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      window.open(url); // opens image in new tab
    } else {
      alert("Image not generated");
      return;
    }

    // STEP 2: Convert Blob → File (VERY IMPORTANT)
    const imageFile = new File([imageBlob], "invoice.png", {
      type: "image/png",
    });

    // STEP 3: Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "lensshine_invoice");

    const uploadRes = await fetch(
      "https://api.cloudinary.com/v1_1/dtgkihdfl/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const uploadData = await uploadRes.json();
    console.log("Cloudinary response:", uploadData);

    // ❌ STOP if upload failed
    if (!uploadData.secure_url) {
      alert("Image upload failed");
      return;
    }

    const imageUrl = uploadData.secure_url;
    console.log("Image URL:", imageUrl);

    // STEP 4: Send email
    const res = await fetch("http://localhost:5000/send-invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: customerEmail,
        imageUrl,
      }),
    });

    const text = await res.text();
    console.log(text);

    alert("Invoice sent successfully!");
  } catch (err) {
    console.error("ERROR:", err);
    alert("Error sending email");
  }
};

const generateInvoiceImage = async () => {
  if (!invoiceRef.current) return null;

  const htmlToImage = await import("html-to-image");

  try {
    return await htmlToImage.toBlob(invoiceRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#121212",

      // 🔥 THIS LINE FIXES YOUR ERROR
      skipFonts: true,
    });
  } catch (err) {
    console.error("Image generation error:", err);
    return null;
  }
};

  return (
  <div data-testid="new-customer-page" className="pt-20 pb-12 px-4 sm:px-6 min-h-screen bg-background text-foreground">
    <div className="max-w-4xl mx-auto">
      
      {/* Step Indicator */}
      <div data-testid="step-indicator" className="flex items-center justify-center mb-10 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isCompleted = i < step;

          return (
            <div key={i} className="flex items-center">
              
              <div className="flex flex-col items-center min-w-[56px]">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                    isActive && "bg-[#d4af37] text-black",
                    isCompleted && "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]",
                    !isActive && !isCompleted && "bg-card border-border/5 text-white/30 border border-white/10"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>

                <span
                  className={cn(
                    "text-[10px] mt-1.5 tracking-wide",
                    isActive
                      ? "text-[#d4af37]"
                      : isCompleted
                      ? "text-[#d4af37]/60"
                      : "text-white/30"
                  )}
                >
                  {s.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-6 sm:w-10 h-px mx-1 transition-colors",
                    i < step ? "bg-[#d4af37]/40" : "bg-card border-border/10"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.25 }}
  >
    {/* Step 0: Frame Selection */}
{step === 0 && (
  <div className="space-y-6">
    
    {/* Heading */}
    <div className="text-center mb-8">
      <h2 className="text-3xl sm:text-4xl tracking-tight font-serif">
        Frame Selection
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Scan frame QR or enter price manually
      </p>
    </div>

    {/* Options */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
      
      {/* QR Scan */}
      <div
        data-testid="frame-qr-option"
        onClick={() => {
          setFrameMethod("qr");
          handleSimulateScan();
        }}
        className={`cursor-pointer rounded-xl border p-6 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1
        ${
          frameMethod === "qr"
            ? "bg-card border-primary"
            : "bg-card border-border hover:border-primary"
        }`}
      >
        <Camera
          className={`h-10 w-10 mb-3 ${
            scanActive ? "text-primary animate-pulse" : "text-muted-foreground"
          }`}
        />
        <p className="text-foreground font-medium">Scan QR Code</p>
        <p className="text-muted-foreground text-sm">
          Auto-detect frame price
        </p>

        {scanActive && (
          <p className="text-primary text-xs mt-2 animate-pulse">
            Scanning...
          </p>
        )}
      </div>

      {/* Manual Entry */}
      <div
        data-testid="frame-manual-option"
        onClick={() => setFrameMethod("manual")}
        className={`cursor-pointer rounded-xl border p-6 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1
        ${
          frameMethod === "manual"
            ? "bg-card border-primary"
            : "bg-card border-border hover:border-primary"
        }`}
      >
        <Keyboard className="h-10 w-10 mb-3 text-muted-foreground" />
        <p className="text-foreground font-medium">Manual Entry</p>
        <p className="text-muted-foreground text-sm">
          Type frame price
        </p>
      </div>
    </div>

    {/* Frame Price Input (ONLY when manual selected) */}
    {frameMethod === "manual" && (
      <div className="max-w-md mx-auto mt-6">
        <Label className="text-muted-foreground text-xs tracking-wider uppercase mb-2 block">
          Frame Price
        </Label>

        <div className="relative">
          <span className="absolute left-1 top-1/2 -translate-y-1/2 text-primary font-medium">
            ₹
          </span>

          <Input
  data-testid="frame-price-input"
  type="number"
  placeholder="0"
  value={framePrice}
  onChange={(e) => setFramePrice(e.target.value)}
  className="pl-20 h-12 left-7 text-lg bg-card border border-border text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
  style={{ backgroundColor: "hsl(var(--card))" }}
/>
        </div>
      </div>
    )}
  </div>
)}

       {/* Step 1: Customer Details */}
{step === 1 && (
  <div className="space-y-8 max-w-3xl mx-auto">
    
    {/* Heading */}
    <div className="text-center">
      <h2
        className="text-3xl sm:text-4xl tracking-tight text-white"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Customer Details
      </h2>
      <p className="text-white/50 mt-2 text-sm">
        Enter customer information
      </p>
    </div>

    {/* Form */}
    <div className="space-y-6">
      
      {/* Name + Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label className="text-white/60 text-xs tracking-wider uppercase mb-2 block">
            Full Name
          </Label>
          <input
            data-testid="customer-name-input"
            placeholder="Enter full name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full h-11 px-3 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>

        <div>
          <Label className="text-white/60 text-xs tracking-wider uppercase mb-2 block">
            Mobile Number
          </Label>
          <input
            data-testid="mobile-input"
            placeholder="10-digit mobile"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              if (e.target.value.length >= 10)
                checkExistingCustomer(e.target.value);
            }}
            className="w-full h-11 px-3 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <Label className="text-white/60 text-xs tracking-wider uppercase mb-2 block">
          Address
        </Label>
        <textarea
          data-testid="address-input"
          placeholder="Customer address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full min-h-[90px] px-3 py-2 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
        />
      </div>

      {/* Booking Date */}
      <div>
        <Label className="text-white/60 text-xs tracking-wider uppercase mb-2 block">
          Booking Date
        </Label>

        <Popover>
          <PopoverTrigger asChild>
            <button
              data-testid="booking-date-btn"
              className="w-full h-11 px-3 rounded-md bg-[#0f0f0f] border border-white/10 text-white text-left hover:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
            >
              {format(bookingDate, "PPP")}
            </button>
          </PopoverTrigger>
        </Popover>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10" />

      {/* Prescription */}
      <div>
        <Label className="text-white/60 text-xs tracking-wider uppercase mb-3 block">
          Prescription
        </Label>

        {/* Buttons */}
        <div className="flex gap-3 mb-5">
          <button
            data-testid="prescription-upload-btn"
            onClick={() => setPrescriptionType("image")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm border transition ${
              prescriptionType === "image"
                ? "bg-[#d4af37] text-black border-[#d4af37]"
                : "bg-transparent text-white border-white/10 hover:border-[#d4af37]"
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>

          <button
            data-testid="prescription-manual-btn"
            onClick={() => setPrescriptionType("manual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm border transition ${
              prescriptionType === "manual"
                ? "bg-[#d4af37] text-black border-[#d4af37]"
                : "bg-transparent text-white border-white/10 hover:border-[#d4af37]"
            }`}
          >
            <Keyboard className="h-4 w-4" />
            Manual Input
          </button>
        </div>

        {/* Content */}
        {prescriptionType === "image" ? (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#d4af37] file:text-black hover:file:bg-[#f3e5ab] file:cursor-pointer"
            />

            {prescriptionImage && (
              <img
                src={prescriptionImage}
                alt="Prescription"
                className="mt-4 max-h-40 rounded-lg border border-white/10"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-white/40 text-xs mb-1 block">
                Right Eye (OD)
              </Label>
              <input
                data-testid="right-eye-input"
                placeholder="e.g. -2.50 / -1.25 x 180"
                value={rightEye}
                onChange={(e) => setRightEye(e.target.value)}
                className="w-full h-11 px-3 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>

            <div>
              <Label className="text-white/40 text-xs mb-1 block">
                Left Eye (OS)
              </Label>
              <input
                data-testid="left-eye-input"
                placeholder="e.g. -3.00 / -0.75 x 90"
                value={leftEye}
                onChange={(e) => setLeftEye(e.target.value)}
                className="w-full h-11 px-3 rounded-md bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Step 2: Lens Selection */}
{step === 2 && (
  <div className="space-y-10 max-w-6xl mx-auto">

    {/* Heading */}
    <div className="text-center">
      <h2
        className="text-3xl sm:text-4xl tracking-tight text-white"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Choose a Lens
      </h2>
      <p className="text-white/50 mt-2 text-sm">
        Select the perfect lens for your customer
      </p>
    </div>

    {/* 👇 FALLBACK DATA (IMPORTANT FIX) */}
    {(() => {
      const fallbackLenses = [
        {
          id: 1,
          name: "Blue Cut Lens",
          description: "Blocks harmful blue light from digital screens",
          price: 800,
          image: "https://images.unsplash.com/photo-1583394838336-acd977736f90",
          pros: ["Reduces eye strain", "Better sleep quality", "UV protection"],
          cons: ["Slight yellow tint", "Higher cost"]
        },
        {
          id: 2,
          name: "Anti-Glare Lens",
          description: "Minimizes reflections for crystal clear vision",
          price: 600,
          image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
          pros: ["Reduced glare", "Better aesthetics", "Easier cleaning"],
          cons: ["Scratches visible", "Needs care"]
        },
        {
          id: 3,
          name: "Photochromic Lens",
          description: "Automatically adapts to changing light",
          price: 1500,
          image: "https://images.unsplash.com/photo-1577803645773-f96470509666",
          pros: ["Indoor/outdoor", "UV protection", "Convenient"],
          cons: ["Slower in cold", "Not great in cars"]
        },
        {
          id: 4,
          name: "Progressive Lens",
          description: "Seamless vision for all distances",
          price: 2500,
          image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
          pros: ["No visible line", "All distances", "Modern"],
          cons: ["Adaptation needed", "Peripheral distortion"]
        }
      ];

      const data = lenses && lenses.length > 0 ? lenses : fallbackLenses;

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((lens) => {
            const isSelected = selectedLens?.id === lens.id;

            return (
              <div
                key={lens.id}
                data-testid={`lens-card-${lens.id}`}
                onClick={() => setSelectedLens(lens)}
                className={`relative cursor-pointer rounded-xl border p-5 transition-all duration-300 bg-[#111111] hover:-translate-y-1 hover:border-[#d4af37]/40
                  ${isSelected ? "border-[#d4af37] ring-1 ring-[#d4af37]" : "border-white/10"}
                `}
              >
                {/* Selected Tick */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-[#d4af37] rounded-full flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-black" />
                    </div>
                  </div>
                )}

                {/* Image */}
                <div className="w-full h-36 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={lens.image}
                    alt={lens.name}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Title */}
                <h3 className="text-white font-semibold text-sm mb-1">
                  {lens.name}
                </h3>

                {/* Description */}
                <p className="text-white/40 text-xs mb-3 line-clamp-2">
                  {lens.description}
                </p>

                {/* Pros */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {lens.pros.map((p, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-[2px] rounded-md border border-green-500/30 text-green-400 bg-green-500/5"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Cons */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {lens.cons.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-[2px] rounded-md border border-red-500/30 text-red-400 bg-red-500/5"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* Price */}
                <p className="text-[#d4af37] font-semibold text-lg">
                  ₹{lens.price.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      );
    })()}
  </div>
)}

         {/* Step 3: Order Summary */}
{step === 3 && (
  <div className="max-w-5xl mx-auto space-y-10">

    {/* Heading */}
    <div className="text-center">
      <h2
        className="text-3xl sm:text-4xl tracking-tight text-white"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Order Summary
      </h2>
      <p className="text-white/50 mt-2 text-sm">
        Review before confirming
      </p>
    </div>

    {/* Card */}
    <div className="flex justify-center">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] p-6 shadow-lg space-y-5">

        {/* Customer Info */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/50">Customer</span>
            <span className="text-white font-medium uppercase">
              {customerName || "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/50">Mobile</span>
            <span className="text-white">
              {mobile || "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/50">Booking Date</span>
            <span className="text-white">
              {bookingDate ? format(bookingDate, "dd MMM yyyy") : "—"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Pricing */}
        <div className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span className="text-white/50">Frame</span>
            <span className="text-white">
              ₹{framePrice ? Number(framePrice).toLocaleString() : "0"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/50">
              Lens {selectedLens ? `- ${selectedLens.name}` : ""}
            </span>
            <span className="text-white">
              ₹{selectedLens?.price
                ? Number(selectedLens.price).toLocaleString()
                : "0"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Total */}
        <div className="flex justify-between items-center text-lg font-semibold">
          <span className="text-white">Total</span>
          <span className="text-[#d4af37]">
            ₹
            {(
              (Number(framePrice) || 0) +
              (Number(selectedLens?.price) || 0)
            ).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  </div>
)}

{/* Step 4: Payment */}
{step === 4 && (
  <div className="max-w-5xl mx-auto space-y-10">

    {/* Heading */}
    <div className="text-center">
      <h2 className="text-3xl sm:text-4xl text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Payment
      </h2>
      <p className="text-white/50 mt-2 text-sm">
        Total: ₹{(Number(totalAmount) || 0).toLocaleString()}
      </p>
    </div>

    {/* SAFE CALCULATIONS */}
    {(() => {
      const total = Number(totalAmount) || 0;
      const amount = Number(payAmount) || 0;
      const isFullPayment = amount === total;

      const discount = (couponApplied && isFullPayment)
        ? Math.floor(total * 0.05)
        : 0;

      const finalAmount = Math.max(0, amount - discount);

      return (
        <>
{/* Amount Box */}
<div className="max-w-md mx-auto bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-xl p-6 space-y-5">

  <p className="text-xs text-white/50 uppercase tracking-wider">
    Amount to Pay
  </p>

  {/* Controls */}
  <div className="flex items-center gap-3">

    {/* Decrease */}
    <button
      onClick={() => setPayAmount(Math.max(0, payAmount - 100))}
      className="w-10 h-10 rounded-full border border-white/20 text-white hover:border-[#d4af37]"
    >
      -
    </button>

    {/* Manual Input */}
    <div className="relative flex-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]">
        ₹
      </span>
      <input
        type="number"
        value={payAmount}
        onChange={(e) => {
          const value = Number(e.target.value) || 0;
          setPayAmount(Math.min(totalAmount, Math.max(0, value)));
        }}
        className="w-full bg-black border border-white/20 text-white pl-8 h-12 text-center text-lg focus:border-[#d4af37] outline-none"
      />
    </div>

    {/* Increase */}
    <button
      onClick={() => setPayAmount(Math.min(totalAmount, payAmount + 100))}
      className="w-10 h-10 rounded-full border border-white/20 text-white hover:border-[#d4af37]"
    >
      +
    </button>
  </div>

  {/* Coupon Button (MANUAL CONTROL) */}
  <div className="flex justify-between items-center">

    <span className="text-white/50 text-xs">
      Apply Coupon (5% OFF)
    </span>

    <button
      onClick={() => setCouponApplied(!couponApplied)}
      className={`px-4 py-1 text-xs border rounded-full transition ${
        couponApplied
          ? "bg-green-500/10 text-green-400 border-green-500/30"
          : "border-white/20 text-white/60 hover:border-[#d4af37]"
      }`}
    >
      {couponApplied ? "Remove" : "Apply"}
    </button>
  </div>

  {/* Discount (only when applied) */}
  {couponApplied && (
    <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs p-2 text-center rounded">
      Coupon Applied: 5% OFF (-₹{Math.round(totalAmount * 0.05).toLocaleString()})
    </div>
  )}

  {/* Remaining */}
  {payAmount < totalAmount && (
    <p className="text-amber-400 text-xs text-center">
      Remaining: ₹{(totalAmount - payAmount).toLocaleString()}
    </p>
  )}

  {/* Final Payable */}
  <div className="text-center text-lg font-semibold text-[#d4af37]">
    Payable: ₹
    {(
      (couponApplied ? totalAmount - Math.round(totalAmount * 0.05) : totalAmount)
    ).toLocaleString()}
  </div>
</div>

          {/* QR CENTER FIXED */}
          {finalAmount > 0 && (
            <div className="flex justify-center">
              <div className="bg-black border border-white/10 rounded-xl p-6 flex flex-col items-center">

                <QRCode
                  value={`upi://pay?pa=devchaudharym@okicici&pn=Lensshine&am=${finalAmount}&cu=INR`}
                  size={200}
                />

                <p className="text-white/50 text-xs mt-4">
                  Scan to pay ₹{finalAmount}
                </p>
              </div>
            </div>
          )}

          {/* CONFIRM */}
          <div className="max-w-md mx-auto">
            <button
              onClick={() => {
                const remaining = total - amount;

                setOrderData({
                  total_amount: total,
                  paid_amount: finalAmount,
                  remaining_amount: remaining > 0 ? remaining : 0,
                  payment_status: remaining <= 0 ? "paid" : "partial",
                  discount: discount,
                });

                setStep(5);
              }}
              disabled={finalAmount <= 0}
              className="w-full bg-[#d4af37] text-black h-12 font-semibold disabled:opacity-30"
            >
              Confirm Payment
            </button>
          </div>
        </>
      );
    })()}
  </div>
)}

{/* Step 6: Order Confirmation & Invoice */}
{step === 6 && (
  <div className="max-w-xl mx-auto space-y-6">

    {/* Header */}
    <div className="text-center mb-2">
      <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="h-7 w-7 text-green-400" />
      </div>

      <h2
        className="text-3xl tracking-tight text-white"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Order Confirmed
      </h2>

      <p className="text-white/40 text-sm mt-1">
        Order #{orderId?.slice(0, 8) || "----"}
      </p>
    </div>

    {/* Invoice */}
    <div
       ref={invoiceRef} id="invoice"
      className="bg-[#121212] border border-white/10 rounded-lg p-6"
    >
      {/* Top */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Lens<span className="text-[#d4af37]">shine</span>
          </h3>
          <p className="text-white/40 text-xs">Premium Optical Shop</p>
        </div>

        <div className="text-right">
          <p className="text-white/40 text-xs">Invoice</p>
          <p className="text-white text-sm font-mono">
            #{orderId?.slice(0, 8) || "----"}
          </p>
          <p className="text-white/40 text-xs mt-1">
            {bookingDate
              ? format(new Date(bookingDate), "dd MMM yyyy")
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 mb-4" />

      {/* Bill To */}
      <div className="mb-4">
        <p className="text-white/40 text-xs uppercase mb-1">Bill To</p>
        <p className="text-white font-medium">
          {customerName || "N/A"}
        </p>
        <p className="text-white/60 text-sm">
          {mobile || "N/A"}
        </p>
        {address && (
          <p className="text-white/40 text-sm">{address}</p>
        )}
      </div>

      {/* Items */}
      <div className="text-sm">

        <div className="flex justify-between py-2 border-b border-white/10 text-white/40">
          <span>Item</span>
          <span>Amount</span>
        </div>

        {/* Frame */}
        <div className="flex justify-between py-3 border-b border-white/5 text-white">
          <span>Frame</span>
          <span>
            ₹{framePrice ? Number(framePrice).toLocaleString() : "0"}
          </span>
        </div>

        {/* Lens */}
        <div className="flex justify-between py-3 border-b border-white/5 text-white">
          <span>
            {selectedLens ? selectedLens.name : "Lens"}
          </span>
          <span>
            ₹{selectedLens?.price
              ? Number(selectedLens.price).toLocaleString()
              : "0"}
          </span>
        </div>

        {/* Total */}
        <div className="flex justify-between py-3 border-t border-white/20 font-semibold">
          <span className="text-white">Total</span>
          <span className="text-[#d4af37] text-lg">
            ₹
            {(
              (Number(framePrice) || 0) +
              (Number(selectedLens?.price) || 0)
            ).toLocaleString()}
          </span>
        </div>

        {/* Paid */}
        <div className="flex justify-between text-sm mt-1">
          <span className="text-green-400">Paid</span>
          <span className="text-green-400">
            ₹
            {(
              (Number(framePrice) || 0) +
              (Number(selectedLens?.price) || 0)
            ).toLocaleString()}
          </span>
        </div>

        {/* Balance (always 0 for now) */}
        <div className="flex justify-between text-amber-400 text-sm">
          <span>Balance</span>
          <span>₹0</span>
        </div>

      </div>
    </div>

    <input
  type="email"
  placeholder="Enter customer email"
  value={customerEmail}
  onChange={(e) => setCustomerEmail(e.target.value)}
  className="w-full mb-4 p-3 bg-[#141414] border border-white/20 text-white"
/>


    {/* Buttons */}
    <div className="flex gap-3">
      <button
        onClick={handlePrint}
        className="flex-1 bg-[#d4af37] text-black h-11 flex items-center justify-center gap-2"
      >
        <Printer size={16} /> Print Invoice
      </button>

      <button
         onClick={sendInvoice}
        className="flex-1 border border-white/20 text-white h-11 flex items-center justify-center gap-2"
      >
        <Mail size={16} /> Email Invoice
      </button>
    </div>

    <button  onClick={sendInvoice}>
  Send Invoice
</button>

    <button
      onClick={() => navigate(0)}
      className="w-full border border-white/20 text-white h-11"
    >
      Start New Order →
    </button>
  </div>
)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step <= 3 && (
          <div className="flex justify-between items-center max-w-4xl mx-auto mt-10">
            <button
              data-testid="step-back-btn"
              onClick={prevStep}
              variant="outline"
              disabled={step === 0}
              className="bg-transparent border-white/20 text-white hover:border-[#d4af37] rounded-none px-6 h-11 disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </button>
           <button
  data-testid="step-next-btn"
onClick={() => {
  if (step === 3) {
    try {
      const finalData = {
        customer_name: customerName,
        mobile: mobile,
        address: address || "",
        bookingDate: bookingDate,

        frame_price: Number(framePrice) || 0,

        lens_name: selectedLens?.name || "Lens",
        lens_price: Number(selectedLens?.price) || 0,

        total_amount:
          (Number(framePrice) || 0) +
          (Number(selectedLens?.price) || 0),

        paid_amount:
          (Number(framePrice) || 0) +
          (Number(selectedLens?.price) || 0),

        remaining_amount: 0,
      };

      console.log("FINAL ORDER DATA:", finalData);

      setOrderData(finalData);

      setStep(4);
    } catch (err) {
      console.error("Order Error:", err);
    }
  } else {
    nextStep();
  }
}}
  disabled={
    loading ||
    (step === 3
      ? !selectedLens || !customerName || !mobile
      : !canNext())
  }
  className="bg-[#d4af37] text-black hover:bg-[#f3e5ab] rounded-none px-8 h-11 font-medium disabled:opacity-30 flex items-center"
>
  {loading
    ? "Creating..."
    : step === 3
    ? "Confirm Order"
    : "Next"}

  {!loading && <ChevronRight className="h-4 w-4 ml-1" />}
</button>
          </div>
        )}

        {step === 5 && (
          <div className="flex justify-center mt-8">
            <Button
              data-testid="proceed-invoice-btn"
              onClick={() => setStep(6)}
              className="bg-[#d4af37] text-black hover:bg-[#f3e5ab] rounded-none px-10 h-12 font-medium"
            >
              View Invoice <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewCustomer;
