"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiPasswordBold } from "react-icons/pi";
import toast from "react-hot-toast";
import { MdError } from "react-icons/md";

export default function VerifyOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) router.push("/login");
    else setEmail(storedEmail);
  }, []);

  const handleVerify = async () => {
    if (!otp) {
      setErrors(true);
      toast.error("Please Enter OTP");
      return;
    }
    const res = await fetch("http://localhost:5000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("permissions", JSON.stringify(data.permissions));
      localStorage.setItem("role", data.role);
      toast.success("Login successful!");
      router.push("/dashboard");
    } else {
      setErrors(true);
      toast.error(data.msg);
    }
  };

  return (
    <div className="ml-[560px] mt-[210px] border-[1px] border-b-stone-50 w-100 bg-white backdrop-blur rounded-[10px] h-[300px]">
      <h1 className="text-3xl mt-[20px] font-bold ml-[125px]">Verify OTP</h1>
      <p className=" text-black  text-[17px] ml-[90px] mt-[30px]">
        Email: {email}
      </p>
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value);
            setErrors(false);
          }}
          onFocus={() => setErrors(false)}
          className={`border border-black p-2 rounded w-[200px] ml-[100px] mt-[30px] ${errors ? "border-red-500" : "border-black"} `}
        />{" "}
        {errors ? (
          <MdError className="absolute ml-[273px] mt-[45px] -translate-y-1/2 text-red-500 text-[18px]" />
        ) : (
          <PiPasswordBold className="absolute ml-[273px] mt-[45px] -translate-y-1/2 text-[18px]" />
        )}
      </div>
      <button
        onClick={handleVerify}
        className="bg-black text-white px-4 py-2 rounded  ml-[270px] mt-[40px] hover:text-white hover:bg-[#4F0DCB] cursor-pointer"
      >
        Verify OTP
      </button>
    </div>
  );
}
