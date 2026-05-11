"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";
import { FaUserLarge } from "react-icons/fa6";
import { MdOutlineMailLock } from "react-icons/md";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { FaSquarePhone } from "react-icons/fa6";
import { MdError } from "react-icons/md";
export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUsers, setNewUsers] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    phone: false,
  });
  const [permissions, setPermissions] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [allPermissions] = useState([
    "View Users",
    "Delete Users",
    "Create Users",
    "Assign Permission",
  ]);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const resetAddUserForm = () => {
    setNewUsers({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
    });

    setErrors({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      phone: false,
    });

    setShowPassword(false);
    setIsFormOpen(false);
  };

  // Load token & permissions
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedPermissions = JSON.parse(
      localStorage.getItem("permissions") || "[]",
    );
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
    setRole(storedRole);
    setPermissions(storedPermissions);
    fetchUsers(storedToken);
  }, []);

  // Check if user has a specific permission
  const hasPermission = (perm: string) => permissions.includes(perm);

  // Fetch all users
  const fetchUsers = async (authToken: string) => {
    try {
      const res = await fetch("http://localhost:5000/users", {
        headers: { Authorization: authToken },
      });
      const data = await res.json();
      const fixedData = data.map((u: any) => ({
        ...u,
        permissions: u.permissions || [],
      }));
      setUsers(fixedData);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  // Create new user
  const createUser = async () => {
    const newErrors = {
      firstName: !newUsers.first_name,
      lastName: !newUsers.last_name,
      email: !newUsers.email,
      password: !newUsers.password,
      phone: !newUsers.phone,
    };
    setErrors(newErrors);
    if (
      newErrors.firstName ||
      newErrors.lastName ||
      newErrors.email ||
      newErrors.password ||
      newErrors.phone
    ) {
      return toast.error("Please fill all input fields");
    }
    if (!token) return toast.error("Token Missing");

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newUsers),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.msg);
        setNewUsers({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          password: "",
        });
        setErrors({
          firstName: false,
          lastName: false,
          email: false,
          password: false,
          phone: false,
        });
        setIsFormOpen(false);
      } else {
        toast.error(data.msg);
      }

      fetchUsers(token);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete user
  const deleteUser = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      const data = await res.json();
      toast.success(data.msg);
      fetchUsers(token);
    } catch (err) {
      console.error(err);
    }
  };

  // Open permissions modal
  const openPermissions = (user: any) => {
    setSelectedUser({ ...user, permissions: [...user.permissions] });
  };

  // Toggle permission for selected user
  const togglePermission = (perm: string) => {
    if (!selectedUser) return;
    const perms = selectedUser.permissions;
    const newPerms = perms.includes(perm)
      ? perms.filter((p: string) => p !== perm)
      : [...perms, perm];
    setSelectedUser({ ...selectedUser, permissions: newPerms });
  };

  // Save updated permissions to backend
  const savePermissions = async () => {
    if (!selectedUser || !token) return;
    try {
      const res = await fetch("http://localhost:5000/permissions/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          user_id: selectedUser.id,
          permissions: selectedUser.permissions,
        }),
      });
      const data = await res.json();
      toast.success(data.msg);
      setSelectedUser(null);
      fetchUsers(token);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      <div className="">
        <Navbar />
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white ml-[50px] mt-[20px]">
            Dashboard ({role})
          </h1>
        </div>

        {/* Add User Form */}
        {isFormOpen && (
          <div className="fixed inset-0 backdrop-blur ">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createUser();
              }}
              className="bg-white ml-[550px] flex flex-col rounded-[10px] mt-[140px]  w-[480px] "
            >
              <IoMdClose
                onClick={resetAddUserForm}
                size={24}
                color="black"
                className="ml-[430px] mt-[20px] cursor-pointer"
              />

              <div className="ml-[150px] flex items-center">
                <p className="text-[27px]">Create User</p>
                <FaUserLarge className="ml-[10px] mt-[8px]" />
              </div>

              <input
                type="text"
                placeholder="First Name"
                value={newUsers.first_name}
                onChange={(e) =>
                  setNewUsers({ ...newUsers, first_name: e.target.value })
                }
                onFocus={() => setErrors({ ...errors, firstName: false })}
                className={`border border-black p-2 w-[200px] ml-[40px] mt-[20px] rounded placeholder:text-gray-400 ${errors.firstName ? "border-red-500" : "border-black"}`}
              />
              {errors.firstName && (
                <MdError className="absolute ml-[210px] mt-[115px] text-red-700 text-[18px]" />
              )}
              <input
                type="text"
                placeholder="Last Name"
                value={newUsers.last_name}
                onChange={(e) =>
                  setNewUsers({ ...newUsers, last_name: e.target.value })
                }
                onFocus={() => setErrors({ ...errors, lastName: false })}
                className={`border border-black p-2 w-[200px] ml-[250px] mt-[-42px] rounded placeholder:text-gray-400 ${errors.lastName ? "border-red-500" : "border-black"}`}
              />
              {errors.lastName && (
                <MdError className="absolute ml-[420px] mt-[115px] text-red-700 text-[18px]" />
              )}
              <div className="flex items-center">
                <input
                  type="email"
                  placeholder="Email"
                  value={newUsers.email}
                  onChange={(e) =>
                    setNewUsers({ ...newUsers, email: e.target.value })
                  }
                  onFocus={() => setErrors({ ...errors, email: false })}
                  className={`border border-black p-2 rounded w-[410px] mt-[15px] ml-[40px] placeholder:text-gray-400 ${errors.email ? "border-red-500" : "border-black"}`}
                />
                {errors.email ? (
                  <MdError className="absolute ml-[420px] mt-[20px] text-red-700 text-[18px]" />
                ) : (
                  <MdOutlineMailLock className="absolute ml-[420px] mt-[20px] text-[18px]" />
                )}
              </div>
              <div className="flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={newUsers.password}
                  onChange={(e) =>
                    setNewUsers({ ...newUsers, password: e.target.value })
                  }
                  onFocus={() => setErrors({ ...errors, password: false })}
                  className={`border border-black p-2 rounded w-[410px] mt-[15px] ml-[40px] placeholder:text-gray-400 ${errors.password ? "border-red-500" : "border-black"}`}
                />
                {errors.password ? (
                  <MdError className="absolute ml-[420px] mt-[20px] text-red-700 text-[18px]" />
                ) : showPassword ? (
                  <IoIosEyeOff
                    onClick={() => setShowPassword(false)}
                    className="absolute ml-[420px] mt-[20px] text-[20px] cursor-pointer"
                  />
                ) : (
                  <IoIosEye
                    onClick={() => setShowPassword(true)}
                    className="absolute ml-[420px] mt-[20px] text-[20px] cursor-pointer"
                  />
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  placeholder="Phone"
                  value={newUsers.phone}
                  onChange={(e) =>
                    setNewUsers({ ...newUsers, phone: e.target.value })
                  }
                  onFocus={() => setErrors({ ...errors, phone: false })}
                  className={`border border-black p-2 rounded w-[410px] mt-[15px] ml-[40px] placeholder:text-gray-400 ${errors.phone ? "border-red-500" : "border-black"}`}
                />
                {errors.phone ? (
                  <MdError className="absolute ml-[420px] mt-[20px] text-red-700 text-[18px]" />
                ) : (
                  <FaSquarePhone className="absolute ml-[420px] mt-[20px] text-[18px]" />
                )}
              </div>

              <button className="bg-black text-white px-4 w-[130px] ml-[170px] mt-[20px] mb-[30px] py-2 rounded hover:text-white hover:bg-[#4F0DCB] cursor-pointer mt-2">
                Add User
              </button>
            </form>
          </div>
        )}

        <h2 className="text-[28px]  font-semibold text-white ml-[700px] mt-[40px]">
          Users
        </h2>
        <ul className="space-y-2 p-[10px] w-[760px] ml-[400px] mt-[20px] bg-white rounded-[10px]">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex justify-between items-center border border-black p-[8px] rounded bg-transparent text-[17px] font-medium mt-[10px]"
            >
              <span>
                {u.first_name} {u.last_name} - {u.email} ({u.role})
              </span>
              <div className="flex gap-2">
                {hasPermission("Delete Users") && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer font-normal"
                  >
                    Delete
                  </button>
                )}
                {hasPermission("Assign Permission") && (
                  <button
                    onClick={() => openPermissions(u)}
                    className="bg-black text-white px-3 py-1 rounded hover:text-white hover:bg-[#4F0DCB] cursor-pointer font-normal"
                  >
                    Manage Permissions
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Permissions Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-transparent backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
            <div className="border-[1px] p-6 rounded w-96 rounded-[10px] bg-white" >
              <h3 className="text-lg font-bold mb-4 text-black">
                Permissions for {selectedUser.email}
              </h3>
              {allPermissions.map((p) => (
                <div key={p} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedUser.permissions?.includes(p)}
                    onChange={() => togglePermission(p)}
                    className="mr-2"
                  />
                  <label>{p}</label>
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-3 py-1 rounded border cursor-pointer bg-red-500 hover:bg-red-600 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={savePermissions}
                  className="px-3 py-1 rounded bg-black text-white hover:bg-[#4F0DCB] hover:text-white cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6 gap-7 mb-[20px]">
          <button
            onClick={logout}
            className="bg-white text-black px-4 py-2 rounded hover:text-white hover:bg-[#4F0DCB] cursor-pointer"
          >
            Logout
          </button>
          {hasPermission("Create Users") && !isFormOpen && (
            <div className="">
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-white text-black px-4 py-2 rounded hover:text-white hover:bg-[#4F0DCB] cursor-pointer"
              >
                Create User
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
