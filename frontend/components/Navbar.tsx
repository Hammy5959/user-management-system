import { FaRegCircleUser } from "react-icons/fa6";

export default function Navbar() {
  return (
    <>
      <div className="flex items-center ">
        <FaRegCircleUser className="text-white text-[26px] ml-[20px]"/>
        <ul className="text-[17px] ml-[700px]  flex  items-center gap-40 mt-[10px]">
          <li className="border-[1px] p-1 rounded-2xl text-white flex justify-center items-center w-[80px] hover:bg-white hover:text-black cursor-pointer">
            Home
          </li>
          <li className="border-[1px] p-1 rounded-2xl text-white flex justify-center items-center w-[80px] hover:bg-white hover:text-black cursor-pointer">
            Contact
          </li>
          <li className="border-[1px] p-1 rounded-2xl text-white flex justify-center items-center w-[80px] hover:bg-white hover:text-black cursor-pointer">
            About
          </li>
        </ul>
      </div>
    </>
  );
}
