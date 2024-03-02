import {  useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { expressBackend } from "./Utils/backendLink"

const UserRegister = () => {
  const [email, setEmail] = useState<string>('test@email.com')
  const [password, setPassword] = useState<string>('password123');

  const navigate = useNavigate();

  const logIn = async () => {
    try {
      const response = await axios.post(`${expressBackend}/login`, {}, {
        headers: {
          email: email,
          password: password
        }
      });
      if (response?.data?.message?.issues) {
        console.log(response);
        
        response.data.message.issues.forEach((issue:{path:string; code:string}) => {
          return window.alert(`${issue.path[0]
            } ${issue.code
            }`);
        })
      }
      if (!response.data.token) {
        window.alert("Invalid username or password")
      }
      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("userName", response.data.userName)
        sessionStorage.setItem("userId", response.data.userId)
        console.log(response.data)
        navigate('/chatpage')
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="h-screen">
        <div className="text-center text-2xl md:text-4xl font-medium pt-6 text-black font-Inter">Welcome To My Personal Chat App</div>
        <div className="text-center text-xl font-medium pt-6 font-Inter">Auth Required</div>
        <div className="my-16 flex flex-grow justify-center">
          <div className="w-4/6 lg:w-4/12 shadow-lg px-10 pt-10 pb-4 btn-neomorph rounded-xl text-center">

            <div className="mb-3 pt-0">
              <input type="text" placeholder="Username" value={email}
                onChange={
                  (e) => setEmail(e.target.value)
                }
                className="px-3 py-3 placeholder-gray-400 text-slate-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full" />
            </div>
            <div className="mb-3 pt-0">
              <input type="password" placeholder="Password"
                value={password}
                onChange={
                  (e) => setPassword(e.target.value)
                }
                className="px-3 py-3 placeholder-gray-400 text-slate-600 relative bg-white rounded text-sm border-0 shadow outline-none focus:outline-none focus:ring w-full" />
            </div>
            <div className="flex justify-between pt-6">

              <button type="button"
                onClick={() => {
                  console.log(email, password)
                  return logIn()
                }}
                className="focus:outline-none text-black btn-neomorph  focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 ">
                Login
              </button>
              <div className="text-sm text-left pl-4 text-gray-600">
                Already have an account?
                <br />
                <span className="font-Poppins font-semibold text- underline">
                  <Link to='/signup'>Singup</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserRegister
// <div className="pt-8 bg-gray-100">
//   <span className="relative bg-gray-100 flex justify-center">
//     <div
//       className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-transparent bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-75"
//     >

//     </div>
//     <span className="relative z-10 tracking-widest bg-gray-100 px-6">Enter User Name</span>
//   </span>
//   <div className="px-8 flex pt-8 justify-center items-center">
//     <div
//       className="relative  w-40 block rounded-l-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
//     >
//       <input
//         type="text"
//         onChange={e => setUserName(e.target.value)}
//         value={userName}
//         className="peer  border-none bg-transparent h-9 placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
//         placeholder="Username"
//       />

//       <span
//         className="pointer-events-none absolute start-2.5 top-0 -translate-y-1/2 bg-gray-100 p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs"
//       >
//         e.g. Yash
//       </span>
//     </div>
//     <div className="relative flex justify-center">
//       <button
//         onClick={userRegister}
//         className=" px-4 py-2 text-white bg-indigo-600 rounded-r-lg duration-150 hover:bg-indigo-500 active:bg-indigo-700"
//       >
//         Join
//       </button>
//     </div>
//   </div>
// </div>