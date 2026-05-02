import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { Html5Qrcode } from "html5-qrcode";

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
import { useLocation } from "react-router-dom";
import { API } from "../config/api";

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
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); 
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
  const lensPrice = Number(selectedLens?.price) || 0;
  const frameAmount = Number(framePrice) || 0;

const totalAmount = frameAmount + lensPrice;

console.log("LENS:", selectedLens);
console.log("TOTAL:", totalAmount);
console.log("ENTERED FRAME:", framePrice);

useEffect(() => {
  let scanner;

  if (showScanner) {
    scanner = new Html5Qrcode("reader");

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 220,
        },
        (decodedText) => {
          setFramePrice(Number(decodedText));
          setShowScanner(false);

          scanner.stop().then(() => {
            scanner.clear();
          });
        },
        () => {}
      )
      .catch((err) => {
        console.log(err);
      });
  }

  return () => {
    if (scanner) {
      scanner.stop().catch(() => {});
    }
  };
}, [showScanner]);

useEffect(() => {
  const storedFrame = localStorage.getItem("framePrice");

  if (storedFrame) {
    setFramePrice(Number(storedFrame));
  }

  if (location.state) {

    // Restore lens
    if (location.state.selectedLens) {
      setSelectedLens(location.state.selectedLens);
    }

    // Restore customer data
    setCustomerName(location.state.customerName || "");
    setMobile(location.state.mobile || "");
    setAddress(location.state.address || "");

    // Restore prescription
    setRightEye(location.state.rightEye || "");
    setLeftEye(location.state.leftEye || "");
    setPrescriptionType(
      location.state.prescriptionType || "manual"
    );
    setPrescriptionImage(
      location.state.prescriptionImage || ""
    );

    // Restore booking date
    if (location.state.bookingDate) {
      setBookingDate(new Date(location.state.bookingDate));
    }

    // Go back to summary
    if (location.state.selectedLens) {
      setStep(3);
    }
  }
}, [location.state]); 

  // Step 3+: Order/Payment
  const [orderId, setOrderId] = useState(null);
  const [orderData, setOrderData] = React.useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState("qr");

  const [couponApplied, setCouponApplied] = useState(false);


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
      console.log("ORDER RESPONSE:", res.data);
      setOrderId(res.data.id);
      setOrderData(res.data);
      setPayAmount(totalAmount);
      setStep(4);
      return res.data;
    } catch (err) {
  console.error("CREATE ORDER ERROR:", err);
  console.log("SERVER RESPONSE:", err?.response?.data);

  toast.error(
    err?.response?.data?.message || "Failed to create order"
  );
  return null;
} finally {
      setLoading(false);
    }
  }, [customerName, mobile, address, bookingDate, prescriptionType, prescriptionImage, rightEye, leftEye, framePrice, selectedLens, totalAmount]);

  const confirmPayment = useCallback(async (amountToPay = payAmount) => {
    if (!orderId || amountToPay <= 0) return;
    setLoading(true);
    try {
      const res = await axios.patch(`${API}/orders/${orderId}/payment`, {
        amount: amountToPay,
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
  if (step === 3) {
    createOrder();
    return;
  }
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

// PRINT FUNCTION - Clean print with full professional styling preserved
  const handlePrint = useCallback(async () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;
    
    // Clone the invoice element to preserve all computed styles
    const clone = printContent.cloneNode(true);
    
    // Ensure inline styles for background colors
    clone.style.backgroundColor = '#ffffff';
    clone.style.borderRadius = '12px';
    clone.style.overflow = 'hidden';
    
    // Create a temporary container
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '700px';
    tempDiv.appendChild(clone);
    document.body.appendChild(tempDiv);
    
    try {
      await waitForImagesInElement(clone);
      // Generate image with html-to-image preserving styles
      const imageBlob = await import("html-to-image").then(module => 
        module.toBlob(clone, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          style: { 
            transform: 'none',
            transformOrigin: 'top left'
          }
        })
      );
      
      if (!imageBlob) {
        throw new Error('Failed to generate image');
      }
      
      // Open print window with the image
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups for printing');
        return;
      }
      
      const imageUrl = URL.createObjectURL(imageBlob);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Lensshine Invoice</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
            }
            @page { margin: 0; size: auto; }
            img {
              max-width: 100%;
              height: auto;
              display: block;
              box-shadow: none;
            }
            @media print {
              body { padding: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="Lensshine Invoice" />
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        URL.revokeObjectURL(imageUrl);
      }, 500);
      
    } catch (err) {
      console.error('Print error:', err);
      alert('Failed to generate print. Using fallback.');
    } finally {
      // Clean up temp element
      document.body.removeChild(tempDiv);
    }
  }, []);

const invoiceRef = React.useRef(null);

const waitForImagesInElement = async (element) => {
  if (!element) return;
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const sendInvoice = async () => {
  try {
    const imageBlob = await generateInvoiceImage();
    if (!imageBlob) {
      alert("Image not generated");
      return;
    }

    const invoiceDataUrl = await blobToDataUrl(imageBlob);

    const res = await fetch(`${API}/send-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: customerEmail,
        invoiceDataUrl,
        imageUrl: invoiceDataUrl,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let parsedMessage = "Failed to send invoice email";
      try {
        const parsed = JSON.parse(errorText);
        parsedMessage = parsed?.message || parsedMessage;
      } catch {}
      throw new Error(parsedMessage);
    }

    alert("Invoice sent successfully!");
  } catch (err) {
    console.error("ERROR:", err);
    alert(err?.message || "Error sending email");
  }
};

const generateInvoiceImage = async () => {
  if (!invoiceRef.current) return null;

  const htmlToImage = await import("html-to-image");

  try {
    await waitForImagesInElement(invoiceRef.current);
    return await htmlToImage.toBlob(invoiceRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#ffffff",

      // This line fixes your error - white background for clean PDF
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
<div
  data-testid="step-indicator"
  className="w-full overflow-x-auto scrollbar-hide mb-8"
>
  <div className="flex items-center justify-start sm:justify-center min-w-max px-4">
    {STEPS.map((s, i) => {
      const Icon = s.icon;
      const isActive = i === step;
      const isCompleted = i < step;

      return (
        <div key={i} className="flex items-center flex-shrink-0">
          
          <div className="flex flex-col items-center min-w-[70px] sm:min-w-[90px]">
            <div
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                isActive && "bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/30",
                isCompleted &&
                  "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]",
                !isActive &&
                  !isCompleted &&
                  "bg-card text-white/30 border border-white/10"
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
                "text-[10px] sm:text-xs mt-2 text-center whitespace-nowrap",
                isActive
                  ? "text-[#d4af37]"
                  : isCompleted
                  ? "text-[#d4af37]/70"
                  : "text-white/40"
              )}
            >
              {s.label}
            </span>
          </div>

          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "w-8 sm:w-14 h-[1px] mx-1 sm:mx-2 transition-colors",
                i < step ? "bg-[#d4af37]/50" : "bg-white/10"
              )}
            />
          )}
        </div>
      );
    })}
  </div>
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
          setShowScanner(true);
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

        {showScanner && (
  <div className="max-w-md mx-auto mt-6">
    
    <div
      id="reader"
      className="overflow-hidden rounded-xl border border-white/10"
    />

  </div>
)}
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
  onChange={(e) => {
  const value = Number(e.target.value);
  setFramePrice(value);

  localStorage.setItem("framePrice", value);
}}
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

{step === 2 && (
  <div className="flex flex-col items-center justify-center h-[60vh]">

    <h2 className="text-3xl text-white mb-6">
      Choose Lens Type
    </h2>

    <button
    onClick={() =>
  navigate("/lens-selection", {
  state: {
    framePrice: Number(framePrice) || 0,
    from: "new-customer",

    customerName,
    mobile,
    address,
    bookingDate,
    rightEye,
    leftEye,
    prescriptionType,
    prescriptionImage,
  }
})
}
    className="bg-[#d4af37] text-black px-6 py-3 rounded-lg"
    >
      Select Lens
    </button>
    
    {selectedLens && (
  <div className="bg-[#111] p-4 rounded-lg mt-6">
    <h3 className="text-white text-lg mb-2">Selected Lens</h3>
    <p>{selectedLens.name}</p>
    <p className="text-[#d4af37] font-semibold">
      ₹{selectedLens.price}
    </p>
  </div>
)}

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
              {orderData?.customer_name || customerName || "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/50">Mobile</span>
            <span className="text-white">
              {orderData?.mobile || mobile || "—"}
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
              ₹{lensPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Total */}
        <div className="flex justify-between items-center text-lg font-semibold">
  <span className="text-white">Total</span>
  <span className="text-[#d4af37]">
    ₹{totalAmount.toLocaleString()}
  </span>
</div>

{/* 🔥 BUTTON FIXED POSITION */}
<div className="flex justify-end mt-6">
  <button
    onClick={createOrder}
    className="bg-[#d4af37] text-black px-6 py-3 rounded-lg hover:bg-[#f3e5ab]"
  >
    Confirm Order →
  </button>
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
                  value={`upi://pay?pa=7668368181@okbizaxis&pn=Lensshine&am=${finalAmount}&cu=INR`}
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
              onClick={() => confirmPayment(finalAmount)}
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
        Order #{String(orderId)?.slice(0, 8) || "----"}
      </p>
    </div>

    {/* Invoice - Professional White Premium Design */}
    <div
      ref={invoiceRef}
      id="invoice"
      className="bg-white rounded-xl overflow-hidden shadow-xl"
    >
      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
        <div className="flex justify-between items-start">
          <div>
            <img
              src="/logo.png"
              alt="Lensshine logo"
              className="h-8 sm:h-9 w-auto object-contain"
              loading="eager"
            />
            <p className="text-white/60 text-xs mt-0.5">Premium Optical Store</p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/60 text-xs">INVOICE</span>
              {orderData?.payment_status === "paid" ? (
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">PAID</span>
              ) : (
                <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">PENDING</span>
              )}
            </div>
            <p className="text-white text-sm font-mono">
              #{String(orderId)?.slice(0, 8) || "----"}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {bookingDate ? format(new Date(bookingDate), "dd MMM yyyy") : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Body */}
      <div className="p-6">
        {/* Customer Information Card */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-[#d4af37]" />
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Customer Information</span>
          </div>
          <p className="text-slate-900 font-semibold">
            {orderData?.customer_name || orderData?.full_name || customerName || "N/A"}
          </p>
          <p className="text-slate-600 text-sm">
            {orderData?.mobile?.toString() || mobile?.toString() || "N/A"}
          </p>
          {(orderData?.address || address) && (
            <p className="text-slate-500 text-sm mt-1">
              {orderData?.address || address}
            </p>
          )}
        </div>

        {/* Invoice Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Product</th>
                <th className="text-center py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Qty</th>
                <th className="text-right py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Price</th>
                <th className="text-right py-3 px-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <td className="py-3 px-4 text-slate-900">Frame</td>
                <td className="py-3 px-4 text-center text-slate-600">1</td>
                <td className="py-3 px-4 text-right text-slate-600">₹{framePrice ? Number(framePrice).toLocaleString() : "0"}</td>
                <td className="py-3 px-4 text-right text-slate-900 font-medium">₹{framePrice ? Number(framePrice).toLocaleString() : "0"}</td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="py-3 px-4 text-slate-900">
                  {selectedLens ? selectedLens.name : "Lens"}
                </td>
                <td className="py-3 px-4 text-center text-slate-600">1</td>
                <td className="py-3 px-4 text-right text-slate-600">
                  ₹{selectedLens?.price ? Number(selectedLens.price).toLocaleString() : "0"}
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-medium">
                  ₹{selectedLens?.price ? Number(selectedLens.price).toLocaleString() : "0"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pricing Summary Box */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-900">₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Paid</span>
              <span className="text-green-600 font-medium">₹{Number(orderData?.paid_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-600">Remaining</span>
              <span className="text-amber-600 font-medium">₹{Number(orderData?.remaining_amount || 0).toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between">
              <span className="text-slate-900 font-semibold">Grand Total</span>
              <span className="text-[#d4af37] font-bold text-lg">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-slate-200">
          <p className="text-slate-600 text-sm font-medium">Thank you for your business!</p>
          <p className="text-slate-400 text-xs mt-1">
            For support: contact@lensshine.com | +91 98765 43210
          </p>
        </div>
      </div>
    </div>

    {/* Email Input */}
    <input
      type="email"
      placeholder="Enter customer email"
      value={customerEmail}
      onChange={(e) => setCustomerEmail(e.target.value)}
      className="w-full mb-4 p-3 bg-[#141414] border border-white/20 text-white rounded-lg"
    />

    {/* Action Buttons */}
    <div className="flex gap-3">
      <button
        onClick={handlePrint}
        className="flex-1 bg-[#d4af37] text-black h-11 flex items-center justify-center gap-2 rounded-lg hover:bg-[#f3e5ab] transition-colors"
      >
        <Printer size={16} /> Print Invoice
      </button>

      <button
        onClick={sendInvoice}
        className="flex-1 border border-white/20 text-white h-11 flex items-center justify-center gap-2 rounded-lg hover:border-[#d4af37] transition-colors"
      >
        <Mail size={16} /> Email Invoice
      </button>
    </div>

    {/* New Order Button */}
    <button
      onClick={() => navigate(0)}
      className="w-full border border-white/20 text-white h-11 rounded-lg hover:border-[#d4af37] transition-colors"
    >
      Start New Order →
    </button>
  </div>
)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step <= 2 && (
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
  nextStep();
}}
  disabled={
    loading ||
    !canNext()
  }
  className="bg-[#d4af37] text-black hover:bg-[#f3e5ab] rounded-none px-8 h-11 font-medium disabled:opacity-30 flex items-center"
>
  {loading
    ? "Creating..."
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
