// src/app/paybox/page.tsx


"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PhoneVerification from "@/components/users-section/paybox/PhoneVerification";
import BoxList from "@/components/users-section/paybox/BoxList";
import BoxPayment from "@/components/users-section/paybox/BoxPayment";
import { Box, UserData } from "@/components/users-section/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function PayBoxPage() {
  const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [pageState, setPageState] = useState<"verification" | "boxList" | "payment" | "editProfile">("verification");
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const router=useRouter()

  // Handle session-based authentication and role check
  useEffect(() => {
    console.log("Session:", session, "Status:", status);

    if (status === "authenticated" && session?.user?.role === "BoxHolder" && session?.user?.phone) {
      setVerifiedPhoneNumber(session.user.phone); // Set phone from session
      setPageState("boxList"); // Skip verification, go to boxList
    } else if (status === "authenticated" && session?.user?.role !== "BoxHolder") {
      setPageState("verification"); // Non-BoxHolder authenticated users still need verification
    } else if (status === "unauthenticated") {
      setPageState("verification"); // Unauthenticated users go to verification
    }
  }, [session, status]);

  // Fetch user data and boxes when phone is verified
  useEffect(() => {
    if (verifiedPhoneNumber) {
      fetchUserData(verifiedPhoneNumber);
    }
    }, [ verifiedPhoneNumber]);
  // Fetch user data for the verified phone number
  const fetchUserData = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/boxes/userData?phoneNumber=${encodeURIComponent(phoneNumber)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }

      const userData: UserData = await response.json();
      setUserData(userData);
      fetchBoxes(phoneNumber);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch boxes for the verified phone number
  const fetchBoxes = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/boxes/findmybox?phone=${encodeURIComponent(phoneNumber)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch boxes");
      }

      const data: Box[] = await response.json();
      setBoxes(data);
      console.log("vbbbbbbbbbbbbbbors",data);
      
      setPageState("boxList");
    } catch (error) {
      console.error("Error fetching boxes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone verification completion
  const handleVerificationComplete = (phoneNumber: string) => {
    setVerifiedPhoneNumber(phoneNumber);
    setPageState("boxList"); // Move to boxList after verification
  };

  // Handle box selection
  const handleBoxSelect = (box: Box) => {
    setSelectedBox(box);
    setPageState("payment");
  };

  // Handle back to box list
  const handleBackToBoxList = () => {
    setSelectedBox(null);
    setPageState("boxList");
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    if (selectedBox) {
      const updatedBoxes = boxes.map((box) =>
        box.id === selectedBox.id
          ? {
              ...box,
              status: "active" as const,
              lastPayment: new Date().toISOString().split("T")[0],
            }
          : box
      );
      setBoxes(updatedBoxes);
    }
    setSelectedBox(null);
    setPageState("boxList");
  };

  // Handle logout
  const handleLogout = () => {
    signOut({ redirect: false }).then(() => {
          router.push("/paybox");
        });
   
    setVerifiedPhoneNumber(null);
    setUserData(null);
    setBoxes([]);
    setSelectedBox(null);
    setPageState("verification");
  };

  // Handle edit profile
  const handleEditProfile = () => {
    alert("Edit profile functionality would be implemented here");
  };

  return (
    <>
      {/* Page Header */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="inline-flex items-center text-indigo-200 hover:text-white transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>

            {status === "authenticated" && (
              <button
                onClick={handleLogout}
                className="text-indigo-200 hover:text-white transition-colors flex items-center"
              >
                <span className="mr-2">Logout</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Pay-Box Collection</h1>
          <p className="text-xl text-indigo-200 max-w-3xl">
            Easily pay your regular contributions or check your payment status with our simple Pay-Box system.
          </p>

          {status === "authenticated" && userData && (
            <div className="mt-6 bg-white/10 px-4 py-2 rounded-lg inline-flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-green-100">Welcome, {userData.name}</span>
            </div>
          )}
        </div>
        
      </section>

      <section className="py-16 px-6 bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-800 font-medium">Loading...</p>
              </div>
            ) : (
              <>
                {(pageState === "verification" || status === "loading") && (
                  <PhoneVerification onVerificationComplete={handleVerificationComplete} />
                )}

                {pageState === "boxList" && userData && (
                  <BoxList
                    boxes={boxes}
                    userData={userData}
                    onBoxSelect={handleBoxSelect}
                    onEditProfile={handleEditProfile}
                  />
                )}

                {pageState === "payment" && selectedBox && verifiedPhoneNumber && (
                  <BoxPayment
                    box={selectedBox}
                    phoneNumber={verifiedPhoneNumber}
                    onBack={handleBackToBoxList}
                    onPaymentComplete={handlePaymentComplete}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}














// "use client";

// import Link from "next/link";
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import PhoneVerification from "@/components/users-section/paybox/PhoneVerification";
// import BoxList from "@/components/users-section/paybox//BoxList";
// import BoxPayment from "@/components/users-section/paybox/BoxPayment";
// import { Box, UserData } from "@/components/users-section/types";
// import { useSession } from "next-auth/react";


// export default function PayBoxPage() {
//   const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [boxes, setBoxes] = useState<Box[]>([]);
//   const [selectedBox, setSelectedBox] = useState<Box | null>(null);
//   const [pageState, setPageState] = useState<"verification" | "boxList" | "payment" | "editProfile">("verification");
//   const [isLoading, setIsLoading] = useState(false);
//   const { data: session, status } = useSession();
  




 
//   // Fetch user data and boxes when phone is verified

//   useEffect(() => {
//     console.log(session);
    
//     if (session?.user?.role==="BoxHolder") {
//       setVerifiedPhoneNumber(session.user.phone); // Assuming phone is part of session.user
//     }
//   }, [session, status]);

//   useEffect(() => {
 
//     // setVerifiedPhoneNumber("9961633885");
//     if (verifiedPhoneNumber) {
//       fetchUserData(verifiedPhoneNumber);
//     }
//   }, [verifiedPhoneNumber]);

//   // Fetch user data for the verified phone number
//   const fetchUserData = async (phoneNumber: string) => {
//     setIsLoading(true);
    
//     try {
//       // Fetch user data from the API
//       const response = await fetch(`/api/boxes/userData?phoneNumber=${encodeURIComponent(phoneNumber)}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to fetch user data");
//       }
  
//       const userData: UserData = await response.json();
//       setUserData(userData);
  
//       // Now fetch boxes
//       fetchBoxes(phoneNumber);
//     } catch (error) {
//       console.error("Error fetching user data:", error);
//       setIsLoading(false); // Ensure loading stops on error
//     } finally {
//       setIsLoading(false); // Ensure loading stops after success or failure
//     }
//   };

//   // Fetch boxes for the verified phone number
//   const fetchBoxes = async (phoneNumber: string) => {
//     // phoneNumber="9961633885"
//     try {
//       setIsLoading(true);
//       // Make API call to fetch boxes by phone number
//       const response = await fetch(`/api/boxes/findmybox?phone=${encodeURIComponent(phoneNumber)}`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch boxes");
//       }

//       const data: Box[] = await response.json();
//       setBoxes(data);
//       setPageState("boxList");
//     } catch (error) {
//       console.error("Error fetching boxes:", error);
      
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle phone verification completion
//   const handleVerificationComplete = (phoneNumber: string) => {
//     setVerifiedPhoneNumber(phoneNumber);
//   };

//   // Handle box selection
//   const handleBoxSelect = (box: Box) => {
//     setSelectedBox(box);
//     setPageState("payment");
//   };

//   // Handle back to box list
//   const handleBackToBoxList = () => {
//     setSelectedBox(null);
//     setPageState("boxList");
//   };

//   // Handle payment completion
//   const handlePaymentComplete = () => {
//     // Update the box status in the list (in a real app, you'd refetch from API)
//     if (selectedBox) {
//       const updatedBoxes = boxes.map(box => {
//         if (box.id === selectedBox.id) {
//           return {
//             ...box,
//             status: "active" as const,
//             lastPayment: new Date().toISOString().split('T')[0]
//           };
//         }
//         return box;
//       });
      
//       setBoxes(updatedBoxes);
//     }
    
//     setSelectedBox(null);
//     setPageState("boxList");
//   };

//   // Handle logout
//   const handleLogout = () => {
//     setVerifiedPhoneNumber(null);
//     setUserData(null);
//     setBoxes([]);
//     setSelectedBox(null);
//     setPageState("verification");
//   };

//   // Handle edit profile
//   const handleEditProfile = () => {
//     // In a real application, you would navigate to an edit profile page
//     // For now, we'll just show an alert
//     alert("Edit profile functionality would be implemented here");
//   };

//   return (
//     <>
//       {/* Page Header */}
//       <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
//         <div className="container mx-auto max-w-6xl">
//           <div className="flex justify-between items-center mb-6">
//             <Link href="/" className="inline-flex items-center text-indigo-200 hover:text-white transition-colors">
//               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//               Back to Home
//             </Link>
            
//             {verifiedPhoneNumber && (
//               <button 
//                 onClick={handleLogout}
//                 className="text-indigo-200 hover:text-white transition-colors flex items-center"
//               >
//                 <span className="mr-2">Logout</span>
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//               </button>
//             )}
//           </div>
          
//           <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Pay-Box Collection</h1>
//           <p className="text-xl text-indigo-200 max-w-3xl">Easily pay your regular contributions or check your payment status with our simple Pay-Box system.</p>
          
//           {verifiedPhoneNumber && userData && (
//             <div className="mt-6 bg-white/10 px-4 py-2 rounded-lg inline-flex items-center">
//               <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//               </svg>
//               <span className="text-green-100">Welcome, {userData.name}</span>
//             </div>
//           )}
//         </div>
//       </section>

//       <section className="py-16 px-6 bg-gray-100 min-h-screen">
//         <div className="container mx-auto max-w-4xl">
//           <div className="bg-white rounded-2xl shadow-xl p-8">
//             {isLoading ? (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
//                 <p className="text-indigo-800 font-medium">Loading...</p>
//               </div>
//             ) : (
//               <>
//                 {pageState === "verification" && (
//                   <PhoneVerification onVerificationComplete={handleVerificationComplete} />
//                 )}
                
//                 {pageState === "boxList" && userData && (
//                   <BoxList 
//                     boxes={boxes} 
//                     userData={userData}
//                     onBoxSelect={handleBoxSelect}
//                     onEditProfile={handleEditProfile}
//                   />
//                 )}
                
//                 {pageState === "payment" && selectedBox && verifiedPhoneNumber && (
//                   <BoxPayment 
//                     box={selectedBox}
//                     phoneNumber={verifiedPhoneNumber}
//                     onBack={handleBackToBoxList}
//                     onPaymentComplete={handlePaymentComplete}
//                   />
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }