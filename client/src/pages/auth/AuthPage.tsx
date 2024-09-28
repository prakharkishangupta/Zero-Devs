import Signin from "@/components/auth/Signin";
import Signup from "@/components/auth/Signup";
import { Routes, Route, useLocation } from "react-router-dom";
import NotFound from "../notfound/NotFound";

const AuthPage = () => {
 
  return (
    <div className="h-full grid grid-rows-[80px,130px,1fr,100px] md:grid-rows-[80px,130px,1fr,80px]">
      {/* Navbar */}
      <div className="h-full bg-black-gradient flex justify-center items-center">
        <img src="/logo.svg" alt="mKYC" className="w-[164px]" />
      </div>

      {/* Main */}
      <Routes>
        <Route index element={<NotFound/>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Signin />} />
      </Routes>

      {/* Footer */}
      <div className="h-full text-center md:px-[420px] py-2 text-gray-500 overflow-hidden text-sm border-t-[1px]">
        <div className="hidden md:block">
          mKYC allows to verify identities with our AI-powered mKYC
          solution, designed to conduct secure and seamless video KYC. Enhance
          compliance and security with cutting-edge technology.
        </div>
        <div>mKYC - © Copyright 2024</div>
      </div>
    </div>
  );
};

export default AuthPage;
