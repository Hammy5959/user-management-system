"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdOutlineMailLock } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import toast from "react-hot-toast";
import { MdError } from "react-icons/md";

import { IoIosEye, IoIosEyeOff } from "react-icons/io";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  const handleLogin = async () => {
    let newErrors = {
      email: !email,
      password: !password,
    };
    setErrors(newErrors);
    if (!email || !password) return toast.error("Email and Password required");

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      const toastId = toast.loading("Sending OTP...");
      toast.success(data.msg);
      localStorage.setItem("email", email);
      router.push("/verify-otp");
      toast.dismiss(toastId);
    } else {
      toast.error(data.msg);

      if (data.error === "email") {
        setErrors({ email: true, password: false });
      } else if (data.error === "password") {
        setErrors({ email: false, password: true });
      } else {
        setErrors({ email: true, password: true });
      }
    }
  };

  return (
    <div className="ml-[560px] mt-[180px] border-[1px] border-b-stone-50 w-100 bg-white backdrop-blur rounded-[10px] h-auto">
      <h1 className="text-3xl mt-[30px] font-bold ml-37.5">Login</h1>
      <CiUser className="ml-[170px] mt-[20px] text-4xl " />
      <div className="flex flex-col">
        <div className="flex items-center">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: false });
            }}
            onFocus={() => setErrors({ ...errors, email: false })}
            className={`border border-black p-2 rounded w-80 ml-[40px] mt-[20px] bg-white text-black ${errors.email ? "border-red-500 " : "border-black"}`}
          />
          {errors.email ? (
            <MdError className="absolute mt-[20px] ml-[332px] text-[18px] text-red-700 mt-[-400px]" />
          ) : (
            <MdOutlineMailLock className="absolute ml-[332px] mt-[20px] text-[18px]" />
          )}
        </div>
        <div className="flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: false });
            }}
            onFocus={() => setErrors({ ...errors, password: false })}
            className={`border border-black p-2 rounded w-80 ml-[40px] mt-[20px] bg-white text-black ${errors.password ? "border-red-500 " : "border-black"}`}
          />
          {errors.password ? (
            <MdError className="absolute ml-[332px] mt-[40px] -translate-y-1/2 text-red-700 text-[18px]" />
          ) : showPassword ? (
            <IoIosEyeOff
              onClick={() => setShowPassword(false)}
              className="absolute ml-[332px] mt-[40px] -translate-y-1/2 text-[19px] cursor-pointer"
            />
          ) : (
            <IoIosEye
              onClick={() => setShowPassword(true)}
              className="absolute ml-[332px] mt-[40px]  -translate-y-1/2 text-[19px] cursor-pointer"
            />
          )}
        </div>
      </div>
      <button
        onClick={handleLogin}
        className="bg-black text-white px-4 py-2 rounded  ml-[280px] mt-[30px]  hover:text-white hover:bg-[#4F0DCB] cursor-pointer mb-[30px]"
      >
        Send OTP
      </button>
    </div>
  );
}
