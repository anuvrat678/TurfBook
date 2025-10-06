import React, { useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Printer, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Receipt = () => {
  const componentRef = useRef();
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  // Print handler
  const handlePrint = () => {
    window.print(); 
  };

  // PDF download handler
  const handleDownloadPDF = async () => {
    if (!componentRef.current) {
      console.error('No content to download');
      return;
    }

    try {
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      let heightLeft = imgHeight - pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`BookingReceipt_${booking._id.slice(-8)}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (!booking) {
    navigate('/');
    return null;
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Printable content */}
        <div ref={componentRef} className="bg-white p-8 rounded-xl shadow-lg">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="text-green-500">Turf</span>
              <span className="text-gray-800">Book</span>
            </h1>
            <p className="text-gray-600 mt-2">Booking Confirmation Receipt</p>
          </div>

          {/* Booking Details */}
          
          <div className="space-y-6 print:space-y-4">
            <div className="flex justify-between items-center border-b pb-4 print:pb-2">
              <div>
                <h2 className="text-xl font-semibold print:text-lg">{booking.ground.name}</h2>
                <p className="text-gray-600 print:text-sm">{booking.ground.location.address}</p>
              </div>
              <div className="text-right">
                <p className="font-medium print:text-sm">Booking ID</p>
                <p className="text-gray-600 print:text-sm">
                  {booking._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <p className="font-medium print:text-sm">User Details</p>
                <p className="text-gray-600 print:text-sm">{booking.user.name}</p>
                <p className="text-gray-600 print:text-sm">{booking.user.email}</p>
              </div>
              <div>
                <p className="font-medium print:text-sm">Booking Date</p>
                <p className="text-gray-600 print:text-sm">{formatDate(booking.date)}</p>
              </div>
            </div>

            <div>
              <p className="font-medium print:text-sm">Time Slots</p>
              <div className="grid grid-cols-2 gap-2 mt-2 print:mt-1">
                {booking.timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 p-2 rounded text-center print:text-sm print:p-1"
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right border-t pt-4 print:pt-2">
              <p className="text-lg font-bold print:text-base">
                Total Amount: ₹{booking.totalAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 print:text-xs">
                Includes all applicable taxes
              </p>
            </div>
          </div>

         
        </div>

        {/* Action Section - Non printable */}
        <div className="print:hidden no-print flex flex-col-reverse sm:flex-row justify-between items-center gap-6 mt-8">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto text-center text-green-600 hover:text-green-700 underline"
          >
             Continue to Dashboard
          </Link>
          
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="bg-green-500 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-green-600 flex-1 justify-center"
            >
              <Printer className="w-5 h-5" />
              Print Receipt
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-gray-800 text-white px-6 py-2 rounded-full flex items-center gap-2 hover:bg-gray-900 flex-1 justify-center"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;